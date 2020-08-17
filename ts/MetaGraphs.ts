// import { Vector2, Vector3 } from "three";
export {MetaGraph, Vertex, Edge, Dict};

/**
 * グラフ
 * ノード追加など
 * 座標系は[0, 1]
 */
class MetaGraph {
  private vertices:Vertex[]
  private edges:Edge[]

  /**
   * グラフ初期化
   * 最初は4角にノードがある
   */
  constructor() {
    this.vertices = [];
    this.edges = [];
  }

  /**
   * 頂点リスト取得
   * @return {Vertex[]}
   */
  public getVertices() {
    return this.vertices;
  }

  /**
   * 辺リスト取得
   * @return {Edge[]}
   */
  public getEdges() {
    return this.edges;
  }

  /**
   * 頂点追加
   * @param {Vertex} v
   */
  public addVertex(v:Vertex) {
    this.vertices.push(v);
  }

  /**
   * 頂点追加
   * @param {Vertex[]} vs
   */
  public addVertices(...vs:Vertex[]) {
    this.vertices.push(...vs);
  }

  /**
   * 辺追加
   * @param {Edge} e
   */
  public addEdge(e:Edge) {
    this.edges.push(e);
  }

  /**
   * 頂点追加
   * @param {Edge[]} es
   */
  public addEdges(...es:Edge[]) {
    this.edges.push(...es);
  }
}

/**
 * key <-> valueのpairで任意の型のvalueを持つことができる
 */
interface Dict {
  [key: string]: any
}

/**
 * ノード: 2次元座標を有する
 * プロパティ{any}を持つ
 */
class Vertex {
  private props:Dict = {};

  /**
   * @param {Dict} dict
   */
  constructor(dict:Dict = {}) {
    this.props = dict;
  }

  /**
   * プロパティを取得する
   * @param {string} key
   * @return {any}
   */
  public getProp(key:string) {
    return this.props[key];
  }

  /**
   * ノードにプロパティをセットする
   * @param {string} key
   * @param {any} value
   */
  public setProp(key:string, value:any) {
    this.props[key] = value;
  }
}

/**
 * エッジ. 二つのノードを有する
 */
class Edge {
  private vertex1:Vertex;
  private vertex2:Vertex;

  /**
   * コンストラクタ
   * @param {Vertex} v1
   * @param {Vertex} v2
   */
  constructor(v1:Vertex, v2:Vertex) {
    this.vertex1 = v1;
    this.vertex2 = v2;
  }
  /**
   * ノード取得
   * @return {Vertex} ノード
   */
  public getNode1() {
    return this.vertex1;
  }

  /**
 * ノード取得
 * @return {Vertex} ノード
 */
  public getNode2() {
    return this.vertex2;
  }
}
