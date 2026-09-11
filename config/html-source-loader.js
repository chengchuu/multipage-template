// Export ordinary HTML without evaluating HtmlWebpackPlugin's Lodash syntax.
module.exports = function htmlSourceLoader(source) {
  return `module.exports = ${JSON.stringify(source)};`;
};
