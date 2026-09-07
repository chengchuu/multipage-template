const attributes = {
  styles: [ "href", "media", "integrity", "crossorigin", "referrerpolicy" ],
  scripts: [ "src", "defer", "async", "type", "integrity", "crossorigin", "referrerpolicy" ],
};

function object(value, keys, location) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`${location}.${key} is unsupported`);
  }
}

function normalize(configuration, location) {
  object(configuration, [ "development", "production" ], location);
  const result = {};
  for (const mode of [ "development", "production" ]) {
    const environment = configuration[mode] === undefined ? {} : configuration[mode];
    object(environment, [ "styles", "scripts" ], `${location}.${mode}`);
    result[mode] = {};
    for (const kind of [ "styles", "scripts" ]) {
      const list = environment[kind] === undefined ? [] : environment[kind];
      const field = `${location}.${mode}.${kind}`;
      if (!Array.isArray(list)) throw new Error(`${field} must be an array`);
      result[mode][kind] = Array.from(list, (asset, index) => {
        const item = `${field}[${index}]`;
        object(asset, attributes[kind], item);
        const required = kind === "styles" ? "href" : "src";
        if (typeof asset[required] !== "string" || !asset[required].trim()) {
          throw new Error(`${item}.${required} must be a nonempty string`);
        }
        for (const [ key, value ] of Object.entries(asset)) {
          const type = key === "async" || key === "defer" ? "boolean" : "string";
          if (typeof value !== type) throw new Error(`${item}.${key} must be ${type}`);
        }
        return { ...asset };
      });
    }
  }
  return result;
}

module.exports = function resolveAssets(shared, page, mode, sharedFile, pageFile) {
  if (![ "development", "production" ].includes(mode)) throw new Error(`Unsupported Webpack mode: ${mode}`);
  object(page, [ "externalAssets" ], pageFile);
  const defaults = normalize(shared, sharedFile)[mode];
  const overrides = normalize(page.externalAssets === undefined ? {} : page.externalAssets, `${pageFile}.externalAssets`)[mode];
  return {
    styles: [ ...defaults.styles, ...overrides.styles ],
    scripts: [ ...defaults.scripts, ...overrides.scripts ],
  };
};
