"use strict";
// node for loading
const ora = require("ora");
// console for node
const chalk = require("chalk");
// path for node
const path = require("path");
// webpack
const webpack = require("webpack");
// webpack production setting
const config = require("./webpack.prd.config");
// 指定删除的文件
const rmFile = path.resolve(__dirname, "../dist");
// build start loading
const spinner = ora("building for production...");
// public
const { entryListPublic, _resolve } = require("./utils");
const fs = require("fs-extra");
spinner.start();

// 构建全量压缩包！
fs.remove(rmFile)
  .then(() => {
    console.log("\n删除 dist 成功！\n");
    webpack(config, function (err, stats) {
      spinner.stop();
      if (err) throw err;
      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + "\n\n"
      );
      if (stats.hasErrors()) {
        console.log(chalk.red("  Build failed with errors.\n"));
        process.exit(1);
      }
      console.log(chalk.cyan("  Build complete.\n"));
      console.log(
        chalk.yellow(
          "  Tip: built files are meant to be served over an HTTP server.\n" +
            "  Opening index.html over file:// won't work.\n"
        )
      );
      const publics = entryListPublic();
      // console.log(publics)
      Object.keys(publics).forEach((page) => {
        if (fs.pathExistsSync(publics[page])) {
          // console.log('exist', page, publics[page])
          const outPath = _resolve(`../dist/${page}/public`);
          fs.mkdirpSync(outPath);
          fs.copy(publics[page], outPath)
            .then(() => console.log(`${publics[page]} copy to ${outPath} success!`))
            .catch((err) => console.error(err));
        }
      });
    });
  })
  .catch((err) => {
    console.error(err);
  });
