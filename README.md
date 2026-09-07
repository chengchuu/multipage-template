# Pages

Independent HTML pages built with Webpack 5. Pages are discovered from immediate directories under `src/pages/`; only `index.html` is required.

## Install and run

Use Node.js 22 or newer and independently installed pnpm.

```bash
pnpm install
npm run dev
```

Open <http://127.0.0.1:8080/simple/> for the HTML-only example or <http://127.0.0.1:8080/example/> for the counter example. There is no root landing page or SPA fallback.

| Command | Purpose |
|:--------|:--------|
| `npm run dev` | Start the development server |
| `npm run build:dev` | Write a development build to `dist/` |
| `npm run build` | Write a production build to `dist/` |
| `npm run lint` | Check JavaScript source, configuration, and tests |
| `npm run lint:fix` | Apply ESLint fixes |
| `npm run test` | Run Node tests with temporary build fixtures |

Use pnpm for dependency installation, additions, updates, and removals. Track `pnpm-lock.yaml`; keep `package-lock.json` untracked. Use `pnpm install --frozen-lockfile` to verify the recorded resolution. Use npm for project scripts and `npm pack` for package inspection. No deployment workflow is included. Future GitHub Actions should use `npm install` and npm scripts without npm dependency caching or `npm ci`; npm does not consume the pnpm lockfile.

## Add a page

Create `src/pages/<name>/index.html` containing a normal HTML document. The next build generates `dist/<name>/index.html`. An optional `index.js` enables a page bundle. Browser scripts use ES modules and can import reusable code from `src/shared/`.

HTML-only pages receive no page bundle. Production bundles use content hashes under `dist/assets/`; HTML uses relative bundle URLs to support deployment under a subdirectory. Builds clean `dist/`, including output belonging to removed pages. Never edit generated files.

The development server reloads existing pages after HTML or JavaScript edits. HTML-only pages use one shared development-server reload client; neither disk build emits that client or a page bundle for them. Restart the server after adding or removing page directories, adding or removing optional entries, or editing build/page configuration. Page discovery and configuration loading occur when Webpack starts.

## External assets

Project defaults live in `config/external-assets.config.js`. Both environments initially have empty arrays. Optional page configuration uses CommonJS:

```js
module.exports = {
  externalAssets: {
    development: {
      styles: [ { href: "http://localhost:9202/local/index.css" } ],
      scripts: [ { src: "http://localhost:5513/local/index.js", defer: true } ],
    },
    production: {
      styles: [ { href: "https://i.mazey.net/net/index.css" } ],
      scripts: [ { src: "https://i.mazey.net/net/index.js", defer: true } ],
    },
  },
};
```

These URLs illustrate configuration only; supply resources you actually serve. External resources are linked, not downloaded or bundled. Missing optional configuration, environments, and arrays are treated as empty. Explicitly malformed values fail the build with the configuration path and field.

Webpack mode selects `development` or `production`, defaulting to production when omitted. Page arrays append to shared arrays without replacement or deduplication. Styles require a nonempty `href` and accept `media`, `integrity`, `crossorigin`, and `referrerpolicy`. Scripts require a nonempty `src` and accept boolean `defer`/`async` plus string `type`, `integrity`, `crossorigin`, and `referrerpolicy`. Unknown fields and incorrect value types are rejected. Optional attributes are emitted only when configured; false boolean attributes are omitted. Stylesheets always receive `rel="stylesheet"`.

Configured tags are injected into the head using HtmlWebpackPlugin hooks: shared styles, page styles, shared scripts, page scripts, then the deferred page bundle. Source-authored tags retain their original positions. Classic blocking scripts execute as parsed; deferred classic scripts execute in document order. Async and module scripts follow browser scheduling, so tag order does not guarantee execution order across those categories. Use classic deferred dependencies when page JavaScript requires ordered external initialization.

## Maintenance

The root `webpack.config.js` composes supporting configuration and helpers in `config/`; page discovery lives in `scripts/`. The flat ESLint configuration separates browser modules from CommonJS configuration and Node tests. The nine formatting rules in GOAL.md use warning severity; recommended static-analysis rules report errors. ESLint owns formatting; no separate formatter is installed. ESLint's core formatting rules are deprecated and retained here to match the requested baseline.

```bash
pnpm install --frozen-lockfile
npm run lint
npm run test
npm run build:dev
npm run build
git diff --check
git status --short
```

Tests build temporary projects in both modes and cover discovery, HTML-only output, page isolation, external assets, invalid configuration, and stale-output removal. Review generated output and exercise both example routes before changing build behavior.
