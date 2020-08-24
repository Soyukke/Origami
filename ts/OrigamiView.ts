export {View};
import * as THREE from 'three';
import * as MG from './MetaGraphs';
import * as Geometry from './Geometry';

// 操作モード
type Mode = 'SelectEdge'|'AddVertex';

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
  private light = new THREE.DirectionalLight(0xFFFFFF);
  private g:OrigamiGraph;
  private mode:Mode = 'AddVertex';
  private moveEvent:(ev:MouseEvent)=>any;
  private addNodeEvent:(ev:MouseEvent)=>any;
  private selectEdgeEvent:(ev:MouseEvent)=>any;
  private changeFoldRateEvent:(ev:Event)=>any;

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

    this.moveEvent = (ev:MouseEvent) => this.onMouseMoveThis(this, ev);
    this.addNodeEvent = (ev:MouseEvent) => this.onClickEdge(this, ev);
    this.selectEdgeEvent =
    (ev:MouseEvent) => this.onClickEdgeForSelect(this, ev);
    this.changeFoldRateEvent =
    (ev:Event) => this.onChangeFoldRate(this, ev);


    const foldRateElement = document.getElementById('foldRate');
    foldRateElement?.addEventListener('change', this.changeFoldRateEvent);

    this.canvas.addEventListener(
        'mousemove',
        this.moveEvent,
    );

    /**
     * ノードクリック時の動作
     * 1つめノード選択 -> 追加予定リストに追加
     * 2つめノード選択 -> 追加予定リストに追加し，グラフにノードとエッジを追加する
     */

    this.canvas.addEventListener(
        'click',
        this.addNodeEvent,
    );

    // rendererは
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    const width = window.innerWidth*0.8;
    const height = window.innerHeight*0.8;
    this.renderer.setSize(width, height);
    console.log('init', window.innerWidth, window.innerHeight);
    console.log('init', canvas.width, canvas.height);
    // document.body.appendChild(this.renderer.domElement);

    // 視野角
    // const width = window.innerWidth;
    const fov = 60;
    const theta = Math.PI * fov / 180;
    // カメラから平面までの距離
    const d = (height / 2) / Math.tan(theta / 2);

    this.scene = new THREE.Scene();
    const A = 10;
    this.geometry = new THREE.BoxGeometry(A, A, A);
    this.material = new THREE.MeshLambertMaterial({color: 0x00FF00});
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);
    this.light.position.set(1000, 1000, 1000);
    this.scene.add(this.light);
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 1, d*2);
    // 指定の視野角で表示される領域が一致するようにする
    this.camera.position.z = d;

    // グラフ初期化
    this.g = new OrigamiGraph(this.scene);
    this.initGraph();
  }

  /**
   * 折り紙用グラフ初期化
   */
  private initGraph() {
    const n1 = new MG.Vertex();
    const n2 = new MG.Vertex();
    const n3 = new MG.Vertex();
    const n4 = new MG.Vertex();
    const e1 = new MG.Edge(n1, n2);
    const e2 = new MG.Edge(n1, n3);
    const e3 = new MG.Edge(n2, n4);
    const e4 = new MG.Edge(n3, n4);
    const L = 500;
    this.g.addVertex(n1, new THREE.Vector3(-L/2, -L/2, 0));
    this.g.addVertex(n2, new THREE.Vector3(-L/2, L/2, 0));
    this.g.addVertex(n3, new THREE.Vector3(L/2, -L/2, 0));
    this.g.addVertex(n4, new THREE.Vector3(L/2, L/2, 0));
    this.g.addEdge(e1);
    this.g.addEdge(e2);
    this.g.addEdge(e3);
    this.g.addEdge(e4);
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
    // シーン座標系: [-1, 1]
    const x1 =(x / w) * 2 - 1;
    const y1=1 - (y / h) * 2;
    // シーン座標系: [-w/2, w/2], [-h/2, h/2]
    // self.mousePosition.x = (w/2)*x1;
    // self.mousePosition.y = (h/2)*y1;

    // z = カメラ座標におけるscene座標からz = 0におけるx, y座標を求める
    const vec = new THREE.Vector3(
        x1, y1, 0,
    ).unproject(self.camera).sub(self.camera.position).normalize();
    console.log('mousePosition1: ', vec);
    const distance = - self.camera.position.z / vec.z;
    vec.multiplyScalar(distance).add(self.camera.position);
    console.log('mousePosition2: ', vec);

    self.mousePosition.x = vec.x;
    self.mousePosition.y = vec.y;

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
   * 辺クリック時の動作
   * 参考
   * https://ics.media/tutorial-three/raycast/
   * @param {View} self
   * @param {MouseEvent} ev
   */
  private onClickEdge(self:View, ev:MouseEvent) {
    this.g.addNearestVertexToBuffer();
    // 2個バッファに存在するなら，それをつなぐエッジを追加してバッファをクリア
    // また，2個の頂点のEdgeが等しい場合は追加しない: 同じ辺上に辺を追加しない
    if (this.g.verteciesBuffer.length == 2) {
      const isNotOnSameEdge =
      this.g.verteciesBuffer[0].edge !== this.g.verteciesBuffer[1].edge;
      // true;
      if (isNotOnSameEdge) {
        const v1 = this.g.verteciesBuffer[0].vertex;
        const v2 = this.g.verteciesBuffer[1].vertex;
        const newEdge = new MG.Edge(v1, v2);
        this.g.addEdge(newEdge);
        // バッファ配列はクリア
        this.g.verteciesBuffer = [];
      } else {
        // さっき追加した頂点は取り除く
        const v = this.g.verteciesBuffer.pop();
        if (v instanceof PairEdgeVertex) {
          this.scene.remove(v.vertex.getProp('obj'));
        }
      }
    }
    console.log('バッファ配列長: ', this.g.verteciesBuffer.length);
  }

  /**
   * 辺選択モード時における辺クリック時の動作
   * 参考
   * https://ics.media/tutorial-three/raycast/
   * @param {View} self
   * @param {MouseEvent} ev
   */
  private onClickEdgeForSelect(self:View, ev:MouseEvent) {
    // マウスから最も近いエッジ
    const edge = this.g.nearestVertex.edge;
    // edgeの情報を取り出してhtmlに表示
    // すべてのedgeをselected = falseにする
    this.g.getEdges().forEach((e) => e.setProp('selected', false));
    // edgeの色を変更し，selected propにtrueをセットする
    edge.setProp('selected', true);
    // 情報表示element
    const foldMode = (edge.getProp('fold') as number);
    const foldModeElement = document.getElementById('foldMode');
    if (foldModeElement instanceof HTMLElement) {
      foldModeElement.textContent = foldMode >= 0 ? '山折り' : '谷折り';
    }
    // inputタグ
    const foldRateElement = document.getElementById('foldRate');
    if (foldRateElement instanceof HTMLElement) {
      (foldRateElement as HTMLInputElement).value = foldMode.toString();
    }
  }

  /**
   * 辺選択モード時: 折り率を入力して設定したときの動作
   * 参考
   * https://ics.media/tutorial-three/raycast/
   * @param {View} self
   * @param {Event} ev
   */
  private onChangeFoldRate(self:View, ev:Event) {
    // 選択されているEdge
    const edge = this.g.getEdges().find((e) => e.getProp('selected') === true);
    const foldRateElement = document.getElementById('foldRate');
    if (foldRateElement instanceof HTMLElement) {
      const value = (foldRateElement as HTMLInputElement).value;
      edge?.setProp('fold', value);
    }
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
    this.g.updateEdgeColor(
        new THREE.Vector3(this.mousePosition.x, this.mousePosition.y, 0),
    );
    requestAnimationFrame(this.render.bind(this));
  }

  /**
   * 辺選択モードへ変更
   */
  public selectEdgeMode() {
    console.log('mode', '辺選択モード関数');
    this.mode = 'SelectEdge';
    this.canvas.removeEventListener(
        'click',
        this.addNodeEvent,
    );
    this.canvas.addEventListener(
        'click',
        this.selectEdgeEvent,
    );
  }

  /**
   * ノード追加モードへ変更
   */
  public addVertexMode() {
    console.log('mode', '頂点選択モード関数');
    this.mode = 'AddVertex';
    this.canvas.removeEventListener(
        'click',
        this.selectEdgeEvent,
    );
    // 辺選択をすべてfalseにする
    this.g.getEdges().forEach((e) => e.setProp('selected', false));
    this.canvas.addEventListener(
        'click',
        this.addNodeEvent,
    );
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
 * 型定義
 */
class PairEdgeVertex {
  /**
   * コンストラクタ
   */
  constructor(public vertex:MG.Vertex, public edge:MG.Edge) {}
}

/**
 * ノードを描画したりする機能をのせる
 */
class OrigamiGraph extends MG.MetaGraph {
  public scene:THREE.Scene;
  private nearestEdge_:MG.Edge|undefined;
  public nearestVertex:PairEdgeVertex;
  // 追加予定の頂点
  public verteciesBuffer:PairEdgeVertex[] = [];

  /**
   * 初期化
   * @param {THREE.Scene} scene
   */
  constructor(scene:THREE.Scene) {
    super();
    this.scene = scene;

    // 最も近い距離の辺上の点
    this.nearestVertex = this.addNewVertex();
  }

  /**
   * 新しい頂点初期化し追加
   * @return {MG.Vertex}
   */
  public addNewVertex() {
    const vertex = new MG.Vertex();
    const geometry = new THREE.SphereGeometry(10, 16, 32);
    const material = new THREE.MeshLambertMaterial({color: 0xFF00FF});
    const sphere = new THREE.Mesh(geometry, material);
    const vec = new THREE.Vector3(-200, -200, -200);
    sphere.position.set(vec.x, vec.y, vec.z);
    vertex.setProp('vec', vec);
    vertex.setProp('obj', sphere);
    this.scene.add(sphere);
    return new PairEdgeVertex(vertex, this.edges[0]);
  }

  /**
   * ノード追加
   * @param {MG.Vertex} v
   * @param {THREE.Vector3} vec
   */
  public addVertex(v:MG.Vertex, vec?:THREE.Vector3) {
    super.addVertex(v);
    const geometry = new THREE.SphereGeometry(10, 16, 32);
    const material = new THREE.MeshLambertMaterial({color: 0xFF0000});
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
    e.setProp('selected', false); // 辺が選択されているか
    // 辺の折り [-180, 180]
    e.setProp('fold', 0);
  }

  /**
   * 辺と点までの距離
   * $$
   * \cos \theta = \frac{\vec e_{i, j} \cdot \vec p}{|\vec e_{i,j}||\vec p|} \\
   * d = \sin \theta |\vec p| \\
   * \left(\frac{d}{|\vec p|}\right)^2
   * +\left(\frac{\vec e_{i, j}
   * \cdot \vec p}{|\vec e_{i,j}||\vec p|}\right)^2 = 1\\
   * $$
   *
   * $$
   * 点と線のベクトルが重なるとき(θ=0)のときは距離0ということにする
   * d = \sqrt{|\vec p|^2 - \left(\frac{\vec e_{i, j} \cdot \vec p}
   * {|\vec e_{i,j}|}\right)^2}
   * $$
   * @param {MG.Edge} e
   * @param {THREE.Vector3} p
   * @return {number} 距離
   */
  public distance(e:MG.Edge, p:THREE.Vector3) {
    const v1 = (e.getNode1().getProp('vec') as THREE.Vector3).clone();
    const v2 = (e.getNode2().getProp('vec') as THREE.Vector3).clone();
    const e21 = v2.sub(v1);
    const p1 = p.clone().sub(v1);
    const e21DotP1 = e21.clone().dot(p1);
    console.log('mouse p', p);
    const e21Norm = e21.length();
    const p1Norm = p1.length();
    const cos = e21DotP1/(e21Norm*p1Norm);
    const sin = 1 - (cos**2);
    const d = Math.abs(sin*p1Norm);
    if (Number.isNaN(d)) {
      // 座標pがエッジ上に存在する
      return 0;
    }
    return d;
  }

  /**
   * 点pと最も近い辺e上の点qを求める
   * @param {MG.Edge} e
   * @param {THREE.Vector3} p
   * @return {Vector3} q 座標
   */
  private getNearestVertex(e:MG.Edge, p:THREE.Vector3) {
    const v1 = (e.getNode1().getProp('vec') as THREE.Vector3).clone();
    const v2 = (e.getNode2().getProp('vec') as THREE.Vector3).clone();
    const e21 = v2.sub(v1);
    const p1 = p.clone().sub(v1);
    const e21DotP1 = e21.clone().dot(p1);
    const e21Norm = e21.length();
    const p1Norm = p1.length();
    const cos = e21DotP1/(e21Norm*p1Norm);
    const a = p1Norm*cos/e21Norm;
    const q = v1.add(e21.clone().multiplyScalar(a));
    return q;
  }

  /**
   * すべてのエッジと点を比較し，最も点と近いエッジを求める
   * @param {THREE.Vector3} p
   * @return {Edge}
   */
  public nearestEdge(p:THREE.Vector3) {
    const edges = this.getEdges();
    console.log('nearestEdge: ', edges);
    const distances = edges.map<number>(
        (edge) => {
          return this.distance(edge, p);
        },
    );
    console.log('distances: ', distances);
    const idx = distances.indexOf(Math.min(...distances));
    console.log('idx: ', idx);
    this.nearestEdge_ = edges[idx];
    return edges[idx];
  }

  /**
   * 指定されたEdgeの色をかえる．その他のエッジは元の色に設定
   * @param {MG.Edge} e
   */
  public colorEdges(e:MG.Edge) {
    const edges = this.getEdges();
    edges.forEach(
        (edge) => {
          const line:THREE.Line = edge.getProp('obj');
          const isSelected:boolean = edge.getProp('selected');
          if (!isSelected) {
            (line.material as THREE.LineBasicMaterial).color =
            new THREE.Color(0xAAAAAA);
            line.material.needsUpdate = true;
          } else {
            (line.material as THREE.LineBasicMaterial).color =
            new THREE.Color(0xFFF100);
            line.material.needsUpdate = true;
          }
        },
    );
    const line:THREE.Line = e.getProp('obj');
    (line.material as THREE.LineBasicMaterial).color =
    new THREE.Color(0x00FF00);
    line.material.needsUpdate = true;
  }

  /**
   * Line色塗り
   * @param {THREE.Vector3} p
   */
  public updateEdgeColor(p:THREE.Vector3) {
    const edge = this.nearestEdge(p);
    this.updateVertexOnNearestEdge(edge, p);
    console.log('updateEdgeColor: ', edge);
    this.colorEdges(edge);
  }

  /**
   * マウスの座標と最も近い辺上の頂点の座標を更新する
   * 頂点プロパティ: vec, objを更新する
   * @param {MG.Edge} edge
   * @param {THREE.Vector3} p
   */
  public updateVertexOnNearestEdge(edge:MG.Edge, p:THREE.Vector3) {
    // 辺上に垂直におろした点の座標
    const q = this.getNearestVertex(edge, p);
    // 点qが辺edge上に存在するならば座標をqへ移動する
    if (this.isPositionOnEdge(edge, q)) {
      const sphere:THREE.Mesh = this.nearestVertex.vertex.getProp('obj');
      sphere.position.set(q.x, q.y, q.z);
      this.nearestVertex.vertex.setProp('vec', q);
      this.nearestVertex.edge = edge;
    }
  }

  /**
   * クリック時，辺上のオブジェクトをbufferへ追加する
   * nearestVertexを初期化する
   */
  public addNearestVertexToBuffer() {
    this.verteciesBuffer.push(this.nearestVertex);
    this.nearestVertex = this.addNewVertex();
  }

  /**
   * 座標pが辺edge上に存在するか
   * @param {MG.Edge} e
   * @param {THREE.Vector3} p
   * @return {boolean}
   */
  public isPositionOnEdge(e:MG.Edge, p:THREE.Vector3) {
    const p1 = (e.getNode1().getProp('vec') as THREE.Vector3).clone();
    const p2 = (e.getNode2().getProp('vec') as THREE.Vector3).clone();
    const v1 = p.clone().sub(p1);
    const v2 = p2.clone().sub(p1);
    // v1とv2が平行ならば v1・v2 == |v1||v2|
    const x = v1.clone().dot(v2);
    const y = v1.length() * v2.length();
    // 平行かつ v1.length() <= v2.length()ならば，v1はv2の線上に存在する
    if ((Math.abs(x - y) < 1e-8) && (v1.length() <= v2.length())) {
      return true;
    } else {
      return false;
    }
  }
}
