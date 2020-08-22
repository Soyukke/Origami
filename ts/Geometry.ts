/**
 * ベクトル関連の計算を行う
 */

export {Geometry};

import * as THREE from 'three';

/**
 * 計算
 */
class Geometry {
  private static eps = 1e-8;
  /**
   * v1とv2が平行か
   * @param {t.Vector3} v1
   * @param {t.Vector3} v2
   * @return {boolean}
   */
  public static isParallel(v1:THREE.Vector3, v2:THREE.Vector3) {
    // x = v1・v2
    const x = v1.clone().dot(v2);
    // y = |v1||v2|
    const y = v1.length() * v2.length();
    if (Math.abs(x-y) < Geometry.eps) {
      return true;
    } else {
      return false;
    }
  }
}
