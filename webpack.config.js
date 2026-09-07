const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const discoverPages = require("./scripts/discover-pages");
const resolveAssets = require("./config/resolve-external-assets");
const ExternalAssetsPlugin = require("./config/ExternalAssetsPlugin");

function createConfig(root, mode = "production", serving = false) {
  if (![ "development", "production" ].includes(mode)) throw new Error(`Unsupported Webpack mode: ${mode}`);
  const sharedFile = path.join(root, "config/external-assets.config.js");
  const shared = require(sharedFile);
  const pages = discoverPages(path.join(root, "src/pages"));
  let clientName = "__pages_dev_client__";
  while (pages.some((page) => page.name === clientName)) clientName += "_";
  const assets = new Map();
  const html = pages.map((page) => {
    const filename = `${page.name}/index.html`;
    assets.set(filename, resolveAssets(shared, page.config, mode, sharedFile, page.configFile));
    return new HtmlWebpackPlugin({
      filename,
      template: `${require.resolve("./config/html-source-loader")}!${page.template}`,
      chunks: [ ...(serving ? [ clientName ] : []), ...(page.entry ? [ page.name ] : []) ],
      chunksSortMode: "manual",
      inject: "head",
      scriptLoading: "defer",
      minify: false,
    });
  });
  return {
    mode,
    context: root,
    // HtmlWebpackPlugin owns HTML output; disable Webpack's native HTML transforms.
    experiments: { html: false },
    entry: {
      ...Object.fromEntries(pages.filter((page) => page.entry).map((page) => [ page.name, page.entry ])),
      // One functional reload client serves every page, including HTML-only pages.
      ...(serving ? { [clientName]: `${require.resolve("webpack-dev-server/client/index.js")}?hostname=0.0.0.0&port=0&pathname=/ws&hot=false&live-reload=true` } : {}),
    },
    output: {
      path: path.join(root, "dist"),
      filename: mode === "production" ? "assets/[name].[contenthash:8].js" : "assets/[name].js",
      publicPath: "auto",
      clean: true,
    },
    optimization: { splitChunks: false, runtimeChunk: false },
    plugins: [ ...html, new ExternalAssetsPlugin(assets) ],
    devServer: {
      host: "127.0.0.1",
      port: 8080,
      static: false,
      historyApiFallback: false,
      hot: false,
      client: false,
      liveReload: true,
      watchFiles: [ path.join(root, "src/pages/**/*.html") ],
    },
  };
}

module.exports = (environment, argv) => createConfig(__dirname, argv.mode, environment.WEBPACK_SERVE === true);
module.exports.createConfig = createConfig;
