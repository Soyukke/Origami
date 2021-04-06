// js/main.ts
// TypeScriptの型指定を入れた
import {View} from './OrigamiView';

let view:View;

/**
 * json doc
 * @param {string} name: string hoge
 */
function sayHello(name: string): void {
  console.log(`Hello ${name}!`);
  console.log(`Hello ${name}! 2`);
  console.log(`Hello ${name}! 2`);
  console.log(`Hello ${name}! 2`);
}
const myName: string = 'TypeScript';
sayHello(myName);

/**
 * now
 */
function addHeadOne(): void {
  view = new View();
  view.render();
  addButtonEvent();

  // スライダーで折る
  const elm = document.getElementById('doFoldRate');
  if (elm instanceof HTMLElement) {
    elm.addEventListener(
        'input',
        ()=>view.foldingZatsu(view.g),
    );
  }

  const axisPositionX = document.getElementById('axisPositionX');
  const axisPositionY = document.getElementById('axisPositionY');
  const a = 5;
  if (axisPositionX instanceof HTMLInputElement) {
    axisPositionX.addEventListener(
      'input',
      (event) => view.cameraMoveX(
        a * Number.parseInt((event.target as HTMLInputElement).value)
      )
    );
  }

  if (axisPositionY instanceof HTMLInputElement) {
    axisPositionY.addEventListener(
      'input',
      (event) => view.cameraMoveY(
        a * Number.parseInt((event.target as HTMLInputElement).value)
      )
    );
  }
}

/**
 * ボタンにイベントリスナー追加
 */
function addButtonEvent() {
  // ボタンのonClick
  const body = document.body;
  const elms = body.getElementsByClassName('modeButton');
  console.log('main', elms);
  for (let i=0; i<elms.length; i++) {
    const btn = elms.item(i);
    console.log('main', 'ボタンにaddEventListener');
    if (btn instanceof HTMLButtonElement) {
      btn.addEventListener(
          'click',
          (ev:MouseEvent) => onClickModeButton(ev),
      );
    }
  }

  // 対称点選択
  const elms2 = body.getElementsByClassName('symmetricButton');
  for (let i=0; i<elms2.length; i++) {
    const btn = elms2.item(i);
    console.log('main', 'ボタンにaddEventListener');
    if (btn instanceof HTMLButtonElement) {
      btn.addEventListener(
          'click',
          (ev:MouseEvent) => onClickSymmetricButton(ev),
      );
    }
  }

}

/**
 * dom操作
 */
function addTextNode() {
  const body = document.body;
  const df = document.createDocumentFragment();
  const node = document.createElement('h3');
  node.textContent = 'typescriptからdom操作';
  df.appendChild(node);
  body.appendChild(df);
}

/**
 * モードボタン押下時の処理
 * - 押されたボタンのclassを操作する
 * - OrigamiViewのモードを変更する
 * @param {MouseEvent} ev
 */
function onClickModeButton(ev:MouseEvent) {
  const body = document.body;
  const elms = body.getElementsByClassName('modeButton');
  for (let i=0; i<elms.length; i++) {
    const btn = elms.item(i);
    if (btn instanceof HTMLButtonElement) {
      btn.classList.remove('selected');
    }
  }
  (ev.target as HTMLButtonElement).classList.add('selected');
  const label = (ev.target as HTMLButtonElement).textContent;
  console.log('main', 'label', label);
  if (label === '辺追加') {
    view.addVertexMode();
  } else if (label === '辺選択') {
    view.selectEdgeMode();
  }
}

/**
 * Symmetricボタン押下時の処理
 * - 押されたボタンのclassを操作する
 * - OrigamiViewのモードを変更する
 * @param {MouseEvent} ev
 */
function onClickSymmetricButton(ev:MouseEvent) {
  const body = document.body;
  const elms = body.getElementsByClassName('symmetricButton');
  for (let i=0; i<elms.length; i++) {
    const btn = elms.item(i);
    if (btn instanceof HTMLButtonElement) {
      btn.classList.remove('selected');
    }
  }
  (ev.target as HTMLButtonElement).classList.add('selected');
  const label = (ev.target as HTMLButtonElement).textContent;
  console.log('main', 'label', label);
  if (label === 'none') {
    view.setSymmetricMode(undefined);
  } else if (label === '1/2') {
    view.setSymmetricMode(1/2);
  } else if (label === '1/3') {
    view.setSymmetricMode(1/3);
  } else if (label === '1/4') {
    view.setSymmetricMode(1/4);
  }
}

window.onload = () => addHeadOne();
