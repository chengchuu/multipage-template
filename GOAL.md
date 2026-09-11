# Project Goal

## Project

This repository is `pages`, a Webpack 5 multi-page frontend project.

The project is designed to build and maintain a collection of independent web pages through one shared build system.

The Live Demo deployment target is <https://chengchuu.github.io/pages/>. `npm run build:pages` generates a static root directory of all discovered demos after production compilation, preserving independent page directories and relative asset URLs. `npm run validate:pages` checks the complete existing artifact under `/pages/` without rebuilding.

The directory uses the supplied semantic palette in a static light theme without browser JavaScript. Ordinary builds and local development retain their existing behavior; an ordinary build may remove the root directory document.

GitHub Actions validates and deploys `dist/` on pushes to `main` and manual dispatch. Remote configuration and public routes must be verified during separately authorized deployment; local validation alone does not establish deployment success.

Each page can have its own HTML, JavaScript, configuration, and external assets while reusing shared frontend logic and project-level defaults.

Production output is generated under:

```text
dist/
```

The `dist/` directory contains generated files and must not be edited manually.

---

## Core Goals

The project should provide:

- Webpack 5-based multi-page builds.
- Automatic page discovery.
- Minimal requirements for creating a page.
- HTML-only pages without unnecessary JavaScript bundles.
- Optional page-specific JavaScript.
- Optional page-specific configuration.
- Shared frontend helpers and reusable logic.
- Shared project-level configuration.
- Per-page configuration overrides and extensions.
- Environment-specific external CSS and JavaScript resources.
- ESLint-based JavaScript code-quality and formatting checks.
- A deliberate pnpm and npm package-manager workflow.
- Predictable production output under `dist/`.
- A simple structure that remains maintainable as the number of pages grows.

---

## Source Structure

The primary source structure is:

```text
src/
├── shared/
└── pages/
```

### Shared Code

Reusable browser-side code belongs under:

```text
src/shared/
```

Examples include:

- DOM helpers.
- URL helpers.
- Formatting functions.
- Validation helpers.
- Theme behavior.
- Shared initialization logic.
- Reusable browser utilities.
- Logic used by multiple pages.

The project should not introduce separate `common/` and `utils/` directories unless future growth provides a clear reason.

If `shared/` becomes large, it can be organized into smaller domain-specific directories later.

### Pages

Individual pages belong under:

```text
src/pages/
```

Example:

```text
src/pages/example/
├── index.html
├── index.js
└── page.config.js
```

Only `index.html` is required.

The following files are optional:

```text
index.js
page.config.js
```

---

## Page Model

A directory is considered a page when it contains:

```text
index.html
```

The following are all valid pages.

### HTML-Only Page

```text
src/pages/example/
└── index.html
```

### HTML and JavaScript

```text
src/pages/example/
├── index.html
└── index.js
```

### HTML and Configuration

```text
src/pages/example/
├── index.html
└── page.config.js
```

### Full Page

```text
src/pages/example/
├── index.html
├── index.js
└── page.config.js
```

Adding a page must not require manually registering it in the Webpack configuration.

Removing a page directory should also remove it automatically from subsequent builds.

---

## Automatic Page Discovery

The build system should automatically scan:

```text
src/pages/
```

The only required condition for discovering a page is the existence of:

```text
index.html
```

For every discovered page, the build system should independently detect whether these optional files exist:

```text
index.js
page.config.js
```

Conceptually, page discovery may produce normalized metadata such as:

```js
{
  name: "example",
  template: "/absolute/path/src/pages/example/index.html",
  entry: "/absolute/path/src/pages/example/index.js",
  config: {},
}
```

When an optional file does not exist, the build system should use a safe default rather than requiring placeholder files.

---

## Page JavaScript

`index.js` is optional.

If a page contains:

```text
src/pages/example/index.js
```

Webpack should create the corresponding page bundle and inject it into that page automatically.

If a page does not contain `index.js`:

- The page must still build normally.
- Webpack must not generate a useless page-specific JavaScript bundle.
- The generated HTML must not contain references to a nonexistent page bundle.

HTML-only pages are a first-class project use case.

---

## Page Configuration

A page may optionally provide:

```text
page.config.js
```

Page configuration should contain only behavior that differs from project defaults.

Initial configuration should primarily support external assets.

Example:

```js
module.exports = {
  externalAssets: {
    development: {
      styles: [],
      scripts: [],
    },

    production: {
      styles: [],
      scripts: [],
    },
  },
};
```

The configuration format should remain extensible.

Future page-level options may include:

- Page title.
- Metadata.
- Favicon.
- HTML processing settings.
- Asset injection settings.
- Other page-specific build behavior.

Additional configuration should only be introduced when there is an actual project requirement.

---

## External Assets

The project must support injecting external CSS and JavaScript resources into individual pages.

External assets may differ between development and production.

Example development resources:

```text
http://localhost:5513/local/index.js
http://localhost:9202/local/index.css
```

Example production resources:

```text
https://i.mazey.net/net/index.js
https://i.mazey.net/net/index.css
```

A page may configure them through `page.config.js`.

Example:

```js
module.exports = {
  externalAssets: {
    development: {
      styles: [
        {
          href: "http://localhost:9202/local/index.css",
        },
      ],

      scripts: [
        {
          src: "http://localhost:5513/local/index.js",
        },
      ],
    },

    production: {
      styles: [
        {
          href: "https://i.mazey.net/net/index.css",
        },
      ],

      scripts: [
        {
          src: "https://i.mazey.net/net/index.js",
        },
      ],
    },
  },
};
```

External asset definitions should use objects rather than plain strings.

For scripts, the configuration should be able to support attributes such as:

```text
src
defer
async
type
integrity
crossorigin
referrerpolicy
```

For stylesheets, the configuration should be able to support attributes such as:

```text
href
media
integrity
crossorigin
referrerpolicy
```

Only attributes that are explicitly configured should be emitted.

---

## Shared Defaults

The project must support shared defaults in addition to page-level configuration.

Shared build configuration should live outside `src/` because it belongs to the build system rather than browser runtime code.

A possible structure is:

```text
config/
└── external-assets.config.js
```

Example:

```js
module.exports = {
  development: {
    styles: [],
    scripts: [],
  },

  production: {
    styles: [],
    scripts: [],
  },
};
```

The effective page configuration should combine:

```text
shared defaults
+
page-specific configuration
=
effective page configuration
```

For external asset arrays, the default behavior should be additive.

Conceptually:

```js
const styles = [
  ...shared.styles,
  ...page.styles,
];

const scripts = [
  ...shared.scripts,
  ...page.scripts,
];
```

A page should not need to repeat shared resources already declared at the project level.

---

## Environment Handling

Webpack's normal `mode` should determine the primary build environment.

Development:

```bash
webpack --mode development
```

Production:

```bash
webpack --mode production
```

The initial project should support:

```text
development
production
```

The build system should not introduce an additional environment mechanism unless a future requirement needs environments such as:

```text
test
staging
preview
```

Environment handling should remain predictable and centralized.

---

## HTML Handling

Source `index.html` files should remain normal HTML documents.

Pages should not be required to contain Webpack-specific template loops or asset-injection markup merely to consume configured external resources.

The build system should handle:

- Page bundle injection.
- Shared external stylesheet injection.
- Page-specific external stylesheet injection.
- Shared external script injection.
- Page-specific external script injection.
- Development and production resource selection.

External CSS should normally be injected into:

```html
<head>
```

External JavaScript should be injected in a predictable and documented order.

The build system should preserve valid source HTML and avoid unnecessary transformations.

---

## Configuration Layering

Configuration should follow a predictable hierarchy.

Conceptually:

```text
Webpack defaults
      ↓
Project defaults
      ↓
Page configuration
      ↓
Environment-specific values
```

Project defaults should cover behavior shared by most pages.

Page configuration should describe exceptions or additions.

The configuration model should avoid duplication and excessive nesting.

---

## ESLint

The project should use ESLint to provide consistent JavaScript formatting and basic static analysis.

ESLint should cover relevant JavaScript source and build-system files, including:

```text
src/**/*.js
config/**/*.js
scripts/**/*.js
webpack.config.js
```

The exact file patterns may be adjusted to match the implemented repository structure.

The project should provide a standard lint command:

```bash
npm run lint
```

A lint-fix command may also be provided when useful:

```bash
npm run lint:fix
```

### Established Formatting Rules

The initial ESLint configuration should establish these formatting rules:

```json
{
  "rules": {
    "semi": ["warn", "always"],
    "quotes": ["warn", "double"],
    "indent": ["warn", 2, { "SwitchCase": 1 }],
    "comma-dangle": ["warn", "always-multiline"],
    "eol-last": ["warn", "always"],
    "spaced-comment": ["warn", "always"],
    "object-curly-spacing": ["warn", "always"],
    "array-bracket-spacing": ["warn", "always"],
    "object-curly-newline": [
      "warn",
      {
        "ImportDeclaration": {
          "multiline": true,
          "minProperties": 4
        }
      }
    ]
  }
}
```

The baseline style therefore requires:

- Semicolons.
- Double quotes.
- 2-space indentation.
- One additional indentation level for `case` clauses.
- Trailing commas in multiline structures.
- A newline at the end of every file.
- A space after `//` in line comments.
- Spaces inside object braces.
- Spaces inside array brackets.
- Multiline imports when an import contains at least four members.

Example:

```js
import {
  first,
  second,
  third,
  fourth,
} from "example-package";

const options = {
  enabled: true,
  values: [ "first", "second" ],
};
```

All initial formatting rules should use the `warn` severity.

A rule may later be promoted to `error` after the existing project source conforms to it and stricter enforcement provides a clear benefit.

### Formatting Principles

The ESLint configuration should remain independent from a specific frontend framework.

Environment, source type, globals, and additional static-analysis rules should be configured separately according to actual project requirements.

When another formatter is introduced, its settings must remain compatible with ESLint for:

- Quotes.
- Semicolons.
- Indentation.
- Spacing.
- Trailing commas.
- Line wrapping where overlapping rules apply.

The project should avoid multiple tools producing conflicting formatting results.

Existing repository formatting conventions should be preserved unless they conflict with the configured ESLint rules.

Linting should not cause unrelated files to be reformatted merely because another valid style is preferred.

---

## Node.js Package-Manager Workflow

The project should use a deliberate boundary between pnpm and npm.

pnpm owns local dependency operations.

npm owns local development commands, lifecycle commands, package inspection, and GitHub Actions execution.

The selected command should depend on the operation being performed rather than using one package manager for every task.

### Local Dependency Management

Use pnpm for dependency operations performed on a developer machine.

Install declared dependencies with:

```bash
pnpm install
```

Add a dependency with:

```bash
pnpm add <package>
```

Add a development dependency with:

```bash
pnpm add -D <package>
```

Update dependencies with:

```bash
pnpm update
```

Or update a specific dependency:

```bash
pnpm update <package>
```

Remove a dependency with:

```bash
pnpm remove <package>
```

Do not use local npm commands to install, add, update, or remove project dependencies.

Examples that should not be used for local dependency management include:

```text
npm install <package>
npm uninstall <package>
npm update <package>
```

Developers are expected to provision pnpm independently.

The repository should not add package-manager bootstrap infrastructure merely to enforce this workflow.

Do not add:

- Corepack setup.
- Repository-owned pnpm installers.
- Package-manager bootstrap scripts.
- Installation wrappers whose only purpose is provisioning pnpm.

### Local Project Commands

Use npm to run maintained `package.json` scripts.

Examples include:

```bash
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run test
```

Additional scripts should follow the same convention.

Use:

```bash
npm run <script>
```

rather than:

```text
pnpm run <script>
pnpm <script>
pnpm exec <command>
```

Package scripts should remain independent from whichever tool installed the dependencies.

When package contents need to be inspected, use:

```bash
npm pack
```

Do not use pnpm as the normal local lifecycle-command runner.

### GitHub Actions

If GitHub Actions workflows are introduced, they should use npm for installation and script execution.

Install dependencies with:

```bash
npm install
```

Run maintained scripts with:

```bash
npm run <script>
```

Do not use:

```text
npm ci
```

Do not enable npm dependency caching in GitHub Actions.

Workflow caching, if ever required for another purpose, should be treated as a separate explicit design decision rather than being coupled to dependency installation.

### Package Metadata

Do not add a `packageManager` field to `package.json` merely to enforce the pnpm and npm workflow.

For example, the project should not introduce:

```json
{
  "packageManager": "pnpm@..."
}
```

unless a future explicit requirement changes this policy.

If a `packageManager` field is introduced for another reason later, do not remove or modify it as incidental cleanup.

### Lockfile Policy

Package-manager responsibilities and lockfile policy are separate decisions.

The project must not infer its lockfile policy from:

```text
pnpm install
npm install
local development
GitHub Actions
```

The selected policy is to track `pnpm-lock.yaml` and keep `package-lock.json` untracked. Preserve this policy unless an explicit project decision changes it. Do not rewrite lockfiles as incidental cleanup.

### Workflow Boundary

The intended command map is:

| Context | Purpose | Command |
|:--|:--|:--|
| Local | Install dependencies | `pnpm install` |
| Local | Add a dependency | `pnpm add <package>` |
| Local | Update dependencies | `pnpm update [package]` |
| Local | Remove a dependency | `pnpm remove <package>` |
| Local | Run a project script | `npm run <script>` |
| Local | Inspect packed contents | `npm pack` |
| GitHub Actions | Install dependencies | `npm install` |
| GitHub Actions | Run a project script | `npm run <script>` |

Project documentation, scripts, and future automation should preserve this boundary consistently.

---

## Build-System Separation

Browser runtime code and build-system code should remain clearly separated.

Browser code belongs under:

```text
src/
```

Build configuration and build helpers should live outside `src/`.

A possible structure is:

```text
config/
scripts/
```

For example:

```text
config/
├── external-assets.config.js
├── resolve-external-assets.js
└── ExternalAssetsPlugin.js

scripts/
└── discover-pages.js
```

The exact organization may evolve as implementation requirements become clearer.

The project should prefer a small number of focused build helpers rather than putting all logic into one large `webpack.config.js`.

---

## Output

All production output must be generated under:

```text
dist/
```

A page such as:

```text
src/pages/example/index.html
```

should normally generate:

```text
dist/example/index.html
```

If the page has JavaScript, its generated assets should also live under the `dist/` output structure.

The exact asset naming strategy can be refined during implementation.

The following rules are mandatory:

- Do not edit `dist/` manually.
- Do not treat generated files as source files.
- Rebuild generated files using project scripts.
- Source-of-truth files must live outside `dist/`.
- `dist/` should be safe to remove and regenerate.

---

## Development Principles

The project should prioritize:

- Simple conventions.
- Minimal required files.
- Automatic discovery.
- Explicit configuration where behavior differs.
- Low duplication.
- Clear separation between source and build logic.
- Predictable build behavior.
- Maintainable Webpack configuration.
- Consistent ESLint-enforced JavaScript formatting.
- Deliberate pnpm and npm responsibilities.
- Easy page creation and removal.
- Reusable shared frontend logic.
- Community-standard frontend practices.
- Incremental complexity only when required.

Avoid:

- Dummy `index.js` files for HTML-only pages.
- Dummy `page.config.js` files when no configuration is needed.
- Manually maintained page registration lists.
- Repeating common external assets in every page.
- Duplicated `common/` and `utils/` directory concepts.
- Build-specific markup in every HTML source file when Webpack can handle injection.
- Large monolithic Webpack configuration files.
- Conflicting lint and formatting tools.
- Using npm for local dependency operations.
- Using pnpm for normal project-script execution.
- `npm ci` in GitHub Actions.
- npm dependency caching in GitHub Actions.
- Package-manager bootstrap infrastructure without an explicit requirement.
- A `packageManager` field added merely to enforce tooling choice.
- Incidental lockfile changes.
- Premature abstractions.
- Overly complex configuration schemas.
- Manual edits to generated output.

---

## Initial Project Structure

The project may initially use:

```text
pages/
├── src/
│   ├── shared/
│   └── pages/
│       ├── example/
│       │   ├── index.html
│       │   ├── index.js
│       │   └── page.config.js
│       │
│       └── simple/
│           └── index.html
│
├── config/
│   ├── external-assets.config.js
│   ├── resolve-external-assets.js
│   └── ExternalAssetsPlugin.js
│
├── scripts/
│   └── discover-pages.js
│
├── dist/
├── eslint.config.js
├── webpack.config.js
├── package.json
├── GOAL.md
└── README.md
```

The repository also tracks `pnpm-lock.yaml` under the selected lockfile policy.

This structure is an initial direction rather than a permanent requirement.

Directories and build helpers should only be introduced when they provide a clear responsibility.

---

## Initial Success Criteria

The first usable version of `pages` should support the following workflow.

Create an HTML-only page:

```text
src/pages/example/index.html
```

Run the development build.

Webpack should:

1. Discover the page automatically.
2. Generate the corresponding HTML output.
3. Avoid generating an unnecessary page JavaScript bundle.

Adding:

```text
src/pages/example/index.js
```

should automatically enable page-specific JavaScript without changing central Webpack configuration.

Adding:

```text
src/pages/example/page.config.js
```

should automatically enable page-specific configuration.

A page should be able to:

- Use shared external assets.
- Add its own external assets.
- Use different external resources in development and production.
- Reuse logic from `src/shared/`.
- Build independently from unrelated pages.

Local dependency installation should use:

```bash
pnpm install
```

Local project validation should use maintained npm scripts such as:

```bash
npm run lint
npm run build
```

The lint command should check the project's JavaScript source and build-system code against the established ESLint rules.

The initial implementation should successfully validate representative JavaScript through ESLint without requiring formatting exceptions for ordinary project code.

If GitHub Actions is introduced, it should install dependencies and run project scripts using:

```bash
npm install
npm run <script>
```

It should not use `npm ci` or npm dependency caching.

The project should not add Corepack setup, a repository-owned package-manager installer, or a `packageManager` field merely to enforce the workflow.

Track `pnpm-lock.yaml` and keep `package-lock.json` untracked, as explicitly selected for this project.

A production build should generate the complete deployable result under:

```text
dist/
```

The project should remain straightforward to understand and maintain as additional pages are introduced.
