const webpack = require("webpack");
const baseConf = require("./webpack.base.config");
const devConfig = require("./conf").dev;
const notifier = require("node-notifier");
const { merge } = require("webpack-merge");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const { entryFiles } = require("./utils.js");
// console.log(entryList(), pageList())
const pages = entryFiles.reduce((sum, pagePath) => {
  sum += `\nhttp://${devConfig.host}:${devConfig.port}/${pagePath}/index.html`;
  return sum;
}, "");
const devConf = merge(baseConf, {
  output: {
    publicPath: "/",
    filename: "[name].[hash].js"
  },
  devtool: devConfig.devtool,
  //
  devServer: {
    // clientLogLevel: 'warning',
    // inline: true,
    // hot: true,
    open: false,
    host: devConfig.host,
    port: devConfig.port,
    compress: true
    // overlay: {
    //   errors: true,
    //   warnings: false
    // },
    // quiet: true
  },
  module: {
    rules: []
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(),
    new FriendlyErrorsPlugin({
      // 编译成功提示！
      compilationSuccessInfo: {
        messages: [`Your application is running here: ${pages}`]
      },
      // 编译出错！
      onErrors: function (severity, errors) {
        if (severity !== "error") {
          return;
        }
        const error = errors[0];
        const filename = error.file.split("!").pop();
        // 编译出错时,右下角弹出错误提示！
        notifier.notify({
          title: "mu-cli",
          message: severity + ": " + error.name,
          subtitle: filename || ""
        });
      }
    })
  ]
});
module.exports = devConf;
