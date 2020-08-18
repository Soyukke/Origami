# 折り紙

https://soyukke.github.io/Origami/index.html

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

## TODO

## 初期表示
.---.
|   |
.---.

### 処理
- クリックでノード追加

### 表示
- ノードは球で表示．
- ガイドを表示する


## グラフ

### ノード

ノードが持つ情報
- 座標(x, y) 不要？
- ジオメトリ


### エッジ

- ノード1, ノード2

### エッジと点Pの距離

### グラフ描画

* [x] ノード追加時，ノードをsceneに追加
* [ ] ノード削除時，ノードをsceneから削除
* [x] エッジ追加時，エッジをsceneに追加
* [ ] エッジ削除時，エッジをsceneから削除