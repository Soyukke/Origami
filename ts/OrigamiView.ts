export {View};
import * as THREE from 'three';
import * as MG from './MetaGraphs';
/**
 * 画面表示用のclass
 */
class View {
  private scene:THREE.Scene;
  private camera:THREE.Camera;
  private renderer:THREE.WebGLRenderer;
  private geometry:THREE.Geometry;
  private material:THREE.Material;
  private cube:THREE.Mesh;
  private canvasId = '#canvas';
  private canvas:HTMLCanvasElement;
  private mousePosition: THREE.Vector2;
  private debug = false;
  private light = new THREE.DirectionalLight(0xFFFFFF, 1.0);

  /**
   * コンストラクタ
   */
  constructor() {
    this.mousePosition = new THREE.Vector2(1, 1);
    // htmlからid="canvas"なElementを取得して利用する
    const canvas:HTMLCanvasElement|null = document.querySelector(this.canvasId);
    if (canvas == null) {
      const e = new Error('#canvasが見つからない');
      throw e;
    }
    this.canvas = canvas;
    // this.canvas.addEventListener('mousemove', this.onMouseMove);
    // EventListenerに登録する関数のthisはViewインスタンスではないので，引数でViewインスタンスを与える
    this.canvas.addEventListener(
        'mousemove',
        (ev:MouseEvent) => this.onMouseMoveThis(this, ev),
    );

    // rendererは
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 視野角
    const height = window.innerHeight;
    // const width = window.innerWidth;
    const fov = 60;
    const theta = Math.PI * fov / 180;
    // カメラから平面までの距離
    const d = (height / 2) / Math.tan(theta / 2);

    this.scene = new THREE.Scene();
    this.geometry = new THREE.BoxGeometry(5, 5, 5);
    this.material = new THREE.MeshBasicMaterial({color: 0x00FF00});
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);
    this.scene.add(this.light);
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 1, d*2);
    // 指定の視野角で表示される領域が一致するようにする
    this.camera.position.z = d;

    this.initGraph();
  }

  /**
   * 折り紙用グラフ初期化
   */
  private initGraph() {
    const g = new OrigamiGraph(this.scene);
    const n1 = new MG.Vertex();
    const n2 = new MG.Vertex();
    const n3 = new MG.Vertex();
    const n4 = new MG.Vertex();
    const e1 = new MG.Edge(n1, n2);
    const e2 = new MG.Edge(n1, n3);
    const e3 = new MG.Edge(n2, n4);
    const e4 = new MG.Edge(n3, n4);
    g.addVertex(n1, new THREE.Vector3(-200, -200, 0));
    g.addVertex(n2, new THREE.Vector3(-200, 200, 0));
    g.addVertex(n3, new THREE.Vector3(200, -200, 0));
    g.addVertex(n4, new THREE.Vector3(200, 200, 0));
    g.addEdge(e1);
    g.addEdge(e2);
    g.addEdge(e3);
    g.addEdge(e4);
  }

  /**
   *  マウスを動かしたときのイベントを取得
   * 参考
   * https://ics.media/tutorial-three/raycast/
   * @param {View} self
   * @param {MouseEvent} ev
   */
  private onMouseMoveThis(self:View, ev:MouseEvent) {
    const elm = ev.currentTarget as HTMLElement;
    const x = ev.clientX - elm.offsetLeft;
    const y = ev.clientY - elm.offsetTop;
    const w = elm.offsetWidth;
    const h = elm.offsetHeight;
    // this.mousePosition = new THREE.Vector2((x / w) * 2 - 1, (y / h) * 2 + 1);
    self.mousePosition.x = (x / w) * 2 - 1;
    self.mousePosition.y = 1 - (y / h) * 2;
    const vec = new THREE.Vector3(
        (w/2)*self.mousePosition.x, (h/2)*self.mousePosition.y, 0,
    );
    // const vec = new THREE.Vector3(
    //     self.mousePosition.x, self.mousePosition.y, 0,
    // ).unproject(self.camera);
    // vec.unproject(self.camera);
    // this.cube.position.set(this.mousePosition.x, this.mousePosition.y, 0);
    /**
     * WebGL座標
     * (-w/2, h/2) (w/2, h/2)
     *       (0,  0)
     * ( -w/2,  -h/2) ( w/2, -h/2)
     */

    /**
    * Window座標
    * (0,  0) (w, 0)
    * (0,  h) (w, h)
    */
    console.log('cube vec: ', vec.x, vec.y, vec.z);
    self.cube.position.set(vec.x, vec.y, vec.z);
    self.debugLog(self.mousePosition);


    // オブジェクトのスクリーン座標 -1 ~ 1 project関数を実行するとvecterのpositionも書き換えられる．
    // const project = self.cube.position.project(self.camera);
    // const sx = w / 2.0 * (project.x + 1.0);
    // const sy = h / 2.0 * (-project.y + 1.0);
    // const ww = window.innerWidth;
    // const wh = window.innerHeight;
    // console.log('hoge: ', sx, sy, h, wh, w, ww);

    // // ワールド座標(-1 ~ 1)からスクリーン座標へ変換する
    // const wx = self.mousePosition.x;
    // const wy = self.mousePosition.y;
    // const vec2 = new THREE.Vector3(wx, wy, 0);
    // vec.unproject(self.camera);
    // console.log('world->screen: ', vec2.x, vec2.y, vec2.z);
  }

  /**
   * windowのcanvas座標からWebGL座標(見えている領域)への変換
   * https://qiita.com/watabo_shi/items/0811d03390c18e46be86
   * @param {THREE.Vector3} windowPosition
   * @param {THREE.Vector3} glPosition
   * @param {number} width
   * @param {number} height
   */
  private transform(
      windowPosition:THREE.Vector3,
      glPosition:THREE.Vector3,
      width:number, height:number,
  ) {
    /**
     * θ = π * fov / 180
     * d: カメラから平面までの距離
     * tan(θ/2) = (height/2) / d
     * d = (height / 2) / tan(θ/2)
     */
    // pi * fov / 180
    // tan()

    // 視野角
    const fov = 60;
    const theta = Math.PI * fov / 180;
    // カメラから平面までの距離
    const d = (height/2) / Math.tan(theta/2);
  }

  /**
   * マウス座標を画面に表示する
   * @param {THREE.Vector2} mp
   */
  private cubeRender() {
    // const v = new THREE.Vector3(mp.x, mp.y, 0);
    // this.cube.position.set(-1, 0, 0);
    this.cube.rotation.x += 0.1;
    this.cube.rotation.y += 0.1;
  }

  /**
   * sceneを作る
   */
  private createScene() {
  }

  /**
   * 画面をrenderする関数
   */
  public render() {
    this.cubeRender();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  /**
   * @param {any[]} data
   */
  private debugLog(...data: any[]) {
    if (this.debug) {
      console.log(data);
    }
  }
}

/**
 * ノードを描画したりする機能をのせる
 */
class OrigamiGraph extends MG.MetaGraph {
  public scene:THREE.Scene;
  /**
   * 初期化
   * @param {THREE.Scene} scene
   */
  constructor(scene:THREE.Scene) {
    super();
    this.scene = scene;
  }

  /**
   * ノード追加
   * @param {MG.Vertex} v
   * @param {THREE.Vector3} vec
   */
  public addVertex(v:MG.Vertex, vec?:THREE.Vector3) {
    super.addVertex(v);
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xFF0000});
    const sphere = new THREE.Mesh(geometry, material);
    if (typeof vec !== 'undefined') {
      sphere.position.set(vec.x, vec.y, vec.z);
      this.scene.add(sphere);
      v.setProp('vec', vec);
      v.setProp('obj', sphere);
    }
  }

  /**
   * エッジ追加
   * https://threejs.org/docs/#api/en/objects/Line
   * 頂点1の座標と頂点2の座標をつなぐ線を表示する
   * @param {MG.Edge} e
   * @param {THREE.Vector3} vec
   */
  public addEdge(e:MG.Edge) {
    super.addEdge(e);
    const v1 = e.getNode1().getProp('vec');
    const v2 = e.getNode2().getProp('vec');
    const positions = new Float32Array(
        [
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
        ],
    );
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
    );
    const material = new THREE.LineBasicMaterial({color: 0xAAAAAA});
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    // lineオブジェクトをエッジの情報として埋め込む
    e.setProp('obj', line);
  }
}
