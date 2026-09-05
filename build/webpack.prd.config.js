const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConf = require("./webpack.base.config");
const prodConfig = require("./conf").build;
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const { assetsPath, version, onlyPages } = require("./utils");
const WorkboxPlugin = require("workbox-webpack-plugin");

const prdConf = merge(baseConf, {
  mode: "production",
  output: {
    publicPath: "../",
    filename: assetsPath(`[name]/${version}/[chunkhash].js`)
  },
  devtool: prodConfig.devtoolType,
  module: {
    rules: []
  },
  plugins: [
    new OptimizeCSSPlugin(),
    // new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()
  ].concat(
    onlyPages
      .filter((page) => ["example-a"].includes(page))
      .map((page) => {
        const id = `${page}-v${version}`;
        // WIKI https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW#GenerateSW
        return new WorkboxPlugin.GenerateSW({
          cacheId: `${id}-gsw`,
          // Do not precache images
          exclude: [/\.(?:png|jpg|jpeg|svg)$/, "service-wroker.js"], // Page need refresh twice.
          // target dir
          swDest: `../dist/${page}/service-worker.js`,
          skipWaiting: true,
          clientsClaim: true,
          // Define runtime caching rules.
          // WIKI https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry
          // Example https://gist.github.com/jeffposnick/fc761c06856fa10dbf93e62ce7c4bd57
          runtimeCaching: [
            // icon images
            {
              // Match any request that ends with .png, .jpg, .jpeg or .svg.
              urlPattern: /^https:\/\/xxx.xxx.com\/xxx/, // /\.(?:png|jpg|jpeg|svg)$/,
              // Apply a cache-first strategy.
              handler: "CacheFirst",
              options: {
                // Use a custom cache name.
                cacheName: `${id}-icon-images`,
                // Only cache 50 images, and expire them after 30 days
                expiration: {
                  maxEntries: 50
                },
                // Ensure that only requests that result in a 200 status are cached
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // note images & others
            {
              // Match any request that ends with .png, .jpg, .jpeg or .svg.
              urlPattern: /^https:\/\/xxx.xxx.com/, // /\.(?:png|jpg|jpeg|svg)$/,
              // Apply a cache-first strategy.
              handler: "CacheFirst",
              options: {
                // Use a custom cache name.
                cacheName: `${id}-note-images`,
                // Only cache 50 images, and expire them after 30 days
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                },
                // Ensure that only requests that result in a 200 status are cached
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // note images & others for i.mazey.net
            {
              // Match any request that ends with .png, .jpg, .jpeg or .svg.
              urlPattern: /^https:\/\/xxx.xxx.net/, // /\.(?:png|jpg|jpeg|svg)$/,
              // Apply a cache-first strategy.
              handler: "CacheFirst",
              options: {
                // Use a custom cache name.
                cacheName: `${id}-i-images`,
                // Only cache 50 images, and expire them after 30 days
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                },
                // Ensure that only requests that result in a 200 status are cached
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        });
      })
  )
});

module.exports = prdConf;
