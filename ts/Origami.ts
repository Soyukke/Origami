export { OrigamiGraph};
import * as THREE from 'three';

/**
 * 折り紙グラフ
 * ノード追加など
 * 座標系は[0, 1]
 */
class OrigamiGraph {
  private nodes:Node[]
  private edges:Edge[]

  /**
   * グラフ初期化
   * 最初は4角にノードがある
   */
  constructor() {
    const n1 = new Node(0, 0);
    const n2 = new Node(0, 1);
    const n3 = new Node(1, 0);
    const n4 = new Node(1, 1);
    const e1 = new Edge(n1, n2);
    const e2 = new Edge(n1, n3);
    const e3 = new Edge(n2, n4);
    const e4 = new Edge(n3, n4);

    this.nodes = [n1, n2, n3, n4];
    this.edges = [e1, e2, e3, e4];
  }
}

/**
 * ノード: 2次元座標を有する
 */
class Node {
  private x:number;
  private y:number;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  /**
   * @return {number[]}
   */
  public getPosition() {
    return [this.x, this.y];
  }
}

/**
 * エッジ. 二つのノードを有する
 */
class Edge {
  private node1:Node;
  private node2:Node;

  /**
   * コンストラクタ
   * @param {Node} n1
   * @param {Node} n2
   */
  constructor(n1:Node, n2:Node) {
    this.node1 = n1;
    this.node2 = n2;
  }
  /**
   * ノード取得
   * @return {number} ノード
   */
  public getNode1() {
    return this.node1;
  }

  /**
 * ノード取得
 * @return {number} ノード
 */
  public getNode2() {
    return this.node2;
  }
}