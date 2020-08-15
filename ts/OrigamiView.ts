export {View};
import * as THREE from 'three';
/**
 * 画面表示用のclass
 */
class View {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private geometry: THREE.Geometry;
  private material: THREE.Material;
  private cube: THREE.Mesh;

  /**
   * コンストラクタ
   */
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({color: 0x00FF00});
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;
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
    requestAnimationFrame(this.render.bind(this));
    this.cube.rotation.x += 0.1;
    this.cube.rotation.y += 0.1;
    this.renderer.render(this.scene, this.camera);
  }
}
