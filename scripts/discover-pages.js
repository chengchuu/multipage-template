const fs = require("node:fs");
const path = require("node:path");

module.exports = function discoverPages(directory) {
  const pages = fs.readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort()
    .flatMap((name) => {
      const pageDirectory = path.join(directory, name);
      const template = path.join(pageDirectory, "index.html");
      if (!fs.existsSync(template)) return [];
      const entry = path.join(pageDirectory, "index.js");
      const config = path.join(pageDirectory, "page.config.js");
      for (const file of [ template, entry, config ]) {
        if (fs.existsSync(file) && !fs.statSync(file).isFile()) {
          throw new Error(`${file} must be a file`);
        }
      }
      return [ {
        name,
        template,
        entry: fs.existsSync(entry) ? entry : null,
        configFile: config,
        config: fs.existsSync(config) ? require(config) : {},
      } ];
    });
  if (pages.length === 0) throw new Error(`No pages containing index.html found in ${directory}`);
  return pages;
};
