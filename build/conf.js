module.exports = {
  dev: {
    host: "localhost",
    port: 9999,
    devtool: "eval-cheap-module-source-map"
  },
  build: {
    devtool: false,
    assetsPath: "./"
  }
};
