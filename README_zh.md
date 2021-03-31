# Bookmark Tomb
#### 签坟

> 本项目是一个书签同步系统，您现在访问的时我们的浏览器插件仓库。

你可以前往我们的[主页](https://bookmarktomb.github.io/BookmarkTomb_Docs)查看帮助文档(暂时还不够完善)。

## Simple introduction

本插件是基于Vue2和TS构建的，目前只适配了Chromium内核(>=85)的浏览器。

The details as fallow table:

|实现|涉及技术|
|:----:|:----:|
|UI框架|Vuetify|
|Vue版本|Vue 2|
|Script语言|TypeScript|
|打包工具|Webpack 4|

## Dev and Debug

1. 克隆本项目。

   `git clone https://github.com/BookmarkTomb/BookmarkTomb_Plugin.git`

2.将本项目导入WebStorm或者其他IDE。
3. 运行 `npm i` 安装依赖。
4. 运行 `npm run dev` 生成开发版本。
5. 运行 `npm run build`  生成生产版本。
6. 在编译后，将生成的 `dist` 文件夹导入chrome。
