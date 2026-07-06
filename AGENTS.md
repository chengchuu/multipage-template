# Repository Guidelines

## Project Structure & Module Organization

This is a webpack multi-page template. Source pages live in `src/pages/<page-name>/`; each page should provide `index.js` and `index.html` so `build/utils.js` can discover it automatically. Shared source can live in `src/index.js`, while reusable HTML templates live in `src/template/`. Webpack configuration is in `build/`, deployment helpers are in `build/shell/`, and local environment scripts are in `scripts/`. Production output is generated under `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm run dev`: starts `webpack-dev-server` with `build/webpack.dev.config.js`.
- `npm run build`: builds production assets through `build/build.js`.
- `npm run lint:fix`: runs ESLint with autofix for JavaScript files under `src/`.
- `npm run release:dev`, `npm run release:pre`, `npm run release:prd`: upload built assets with `aliyunoss-cli`.
- `npm run publish:dev|pre|prd`: installs dependencies, builds, then releases to the selected environment.

Use Node.js 14 for compatibility with the project scripts unless you are deliberately upgrading the toolchain.

## Coding Style & Naming Conventions

Use 2-space indentation, LF endings, UTF-8, final newlines, and no trailing whitespace per `.editorconfig`. JavaScript follows `.eslintrc.js`: ES modules, StandardJS base rules, double quotes, max line length 120, `let`/`const` instead of `var`, and no required semicolons from ESLint. Prettier is configured with `"semi": true`, and staged JS/Vue/ES6 files are formatted through `prettier-eslint` and `eslint --fix`.

Name page folders with stable, URL-friendly names such as `page1`, `example-a`, or `link`. Keep each page self-contained unless code is intentionally shared.

## Testing Guidelines

No test runner or `npm test` script is currently defined. For changes, at minimum run `npm run lint:fix` and manually verify affected pages with `npm run dev`. If adding tests later, document the command in `package.json` and keep test files near the code they cover.

## Commit & Pull Request Guidelines

Commits are checked with `@commitlint/config-conventional`. Use allowed types such as `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `revert`, `test`, `add`, `update`, `delete`, and `merge`; examples include `fix(dev): webpack compiler error` and `feat(link): modify directory name`.

Pull requests should describe the changed pages, list verification commands, link related issues, and include screenshots or page URLs for visual changes. Call out config, deployment, or Node version changes explicitly.
