const { entryList, _resolve, pageList, version } = require("./utils");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const webpack = require('webpack');
// const path = require('path');

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const baseConf = {
  entry: entryList(),
  output: _resolve("../dist"),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        include: _resolve("../src")
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
            // options: {
            //   hmr: process.env.NODE_ENV === 'development'
            // }
          },
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   // //i.mazey.net/style/lib/tiny.css http://127.0.0.1:5514/lib/tiny.css
    //   'process.env.CSS_BASE_URL': JSON.stringify(
    //     process.env.NODE_ENV === 'production' ? '//i.mazey.net/style' : 'http://localhost:5514'
    //   ),
    //   // //i.mazey.net/polestar/lib/tiny.js http://127.0.0.1:5513/lib/tiny.js
    //   'process.env.JavaScript_BASE_URL': JSON.stringify(
    //     process.env.NODE_ENV === 'production' ? '//i.mazey.net/polestar' : 'http://localhost:5513'
    //   ),
    // }),
    ...pageList(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: `[name]/${version}/[chunkhash].css`
    })
  ],
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": _resolve("../src")
    }
  }
};

module.exports = baseConf;
