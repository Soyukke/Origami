// js/main.ts
// TypeScriptの型指定を入れた
import {View} from './OrigamiView';

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
  const body = document.body;
  const df = document.createDocumentFragment();
  const node = document.createElement('h3');
  node.textContent = 'typescriptからdom操作';
  df.appendChild(node);
  body.appendChild(df);
  const view = new View();
  view.render();
}


window.onload = () => addHeadOne();
