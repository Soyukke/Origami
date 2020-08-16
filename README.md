#折り紙TypeScript

## 初期設定

https://hiranoon.hatenablog.com/entry/2020/04/13/192746

## Three.js

https://qiita.com/siouxcitizen/items/32198325644496d52716


three.jsのインストール
```shell
$ npm install three
```

型定義パッケージ管理
```shell
$ npm install -g typings
```

three.jsの型定義インストール
```shell
$ typings init
$ typings install dt~three --save --global
```

フロントで実行するので，webpackを使ってjavascriptをまとめる．
```
$ npm i -D ts-loader
npm i -S three
npm install --save-dev webpack
npm install webpack-cli --save-dev
```