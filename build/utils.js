const path = require("path");
const fs = require("fs");
const prodConfig = require("./conf").build;
let entryFiles = fs.readdirSync(path.resolve(__dirname, "../src/pages"));
const HtmlWebpackPlugin = require("html-webpack-plugin");
const _resolve = (_path) => path.resolve(__dirname, _path);
const assetsPath = (_path) => path.posix.join(prodConfig.assetsPath, _path);
const format = require("date-fns/format");
// 生成版本 20210308.072903
const genVersion = () => {
  const d = new Date();
  const version = format(d, "yyyyMMdd.HHmmss");
  return version;
};
const version = genVersion();

if (process.env.PAGE) {
  entryFiles = [process.env.PAGE];
}

// 忽略的文件夹
const fPages = [".DS_Store"];
// 限制文件夹
const onlyPages = [];

entryFiles = entryFiles.filter((page) => {
  if (onlyPages.length) {
    return onlyPages.includes(page);
  }
  return !fPages.includes(page);
});

console.log("更新的页面：", entryFiles);

module.exports = {
  _resolve,
  assetsPath,
  // 文件名 pages [ 'page1', 'page2' ]
  entryFiles,
  // webpack 入口 { page1: '~/src/pages/page1/index.js', page2: '~/src/pages/page2/index.js' }
  entryList: () => {
    const entryList = {};
    entryFiles.map((page) => {
      entryList[page] = _resolve(`../src/pages/${page}/index.js`);
    });
    return entryList;
  },
  // webpack 入口 { page1: '~/src/pages/page1/public', page2: '~/src/pages/page2/public' }
  entryListPublic: () => {
    const entryList = {};
    entryFiles.map((page) => {
      entryList[page] = _resolve(`../src/pages/${page}/public`);
    });
    return entryList;
  },
  // html页面 [HtmlWebpackPlugin {}]
  pageList: () => {
    const pageList = [];
    entryFiles.map((page) => {
      pageList.push(
        new HtmlWebpackPlugin({
          template: ["example-a"].includes(page)
            ? _resolve("../src/template/example1/index.html")
            : _resolve(`../src/pages/${page}/index.html`),
          filename: _resolve(`../dist/${page}/index.html`),
          chunks: ["common", page],
          // 压缩配置
          minify: {
            // 删除Html注释
            removeComments: true,
            // 去除空格
            collapseWhitespace: true,
            // 去除属性引号
            removeAttributeQuotes: true
          },
          chunksSortMode: "auto",
          CSS_BASE_URL: process.env.NODE_ENV === "production" ? "//i.mazey.net/style/lib" : "http://localhost:5513/lib",
          // serve: http://localhost:9202 local: http://localhost:5513/lib
          JavaScript_BASE_URL:
            process.env.NODE_ENV === "production" ? "//i.mazey.net/polestar/lib" : "http://localhost:9202"
        })
      );
    });
    return pageList;
  },
  version,
  onlyPages
};
