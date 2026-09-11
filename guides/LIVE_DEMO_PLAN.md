# Live Demo plan

Status: Plan only. The user selected a generated root directory of discovered demos. Implementation and deployment require separate authorization.

## Goal

Publish the project at <https://chengchuu.github.io/pages/>. The root page should list every discovered demo and link to its independent page directory.

Expected routes:

- `/pages/`: generated demo directory.
- `/pages/example/`: interactive counter example.
- `/pages/simple/`: HTML-only example.

## Current behavior and cause

The project uses Webpack 5 and discovers immediate directories containing `src/pages/<page>/index.html`. JavaScript and page configuration are optional. `scripts/discover-pages.js` owns discovery; there is no manually maintained page registry.

The production build generates `dist/<page>/index.html` and page-local assets. It does not generate `dist/index.html`, so the intended root URL has no landing page. No GitHub Actions deployment workflow is present.

Disk builds use relative HTML bundle references and Webpack's automatic runtime public path. Existing links between the examples are relative. This model should support the `/pages/` deployment prefix, subject to artifact and browser validation.

Webpack's coordinated cleanup removes entries in `dist/` whose names do not match discovered page directories. A landing page written before the build would be removed.

## Selected approach and alternatives

Generate a static root directory from the existing discovery helper after the production build succeeds. Use a dedicated `build:pages` script to assemble the complete deployment artifact.

This approach keeps independent page compilation intact and avoids adding a manual list of demos. The directory requires no browser JavaScript or new dependency.

Alternatives considered:

- A manually maintained landing page is initially simple but can retain stale links or omit new demos.
- A redirect to `example/` is smaller but does not provide a directory of demos.
- Webpack-integrated root generation could support the development server, but requires additional output ownership and cleanup coordination. A post-build step is sufficient for the selected deployment goal.

## Scope and constraints

- Preserve Webpack 5, automatic discovery, optional page files, and independent page output.
- Keep `dist/` generated and ignored. Modify generators rather than generated files.
- Preserve ordinary `npm run build`, `npm run build:dev`, and development-server behavior. The root directory belongs to the proposed Pages build.
- Use Node.js 22 in GitHub Actions. Keep local dependency operations on pnpm and lifecycle commands on npm.
- Preserve the tracked `pnpm-lock.yaml` and ignored `package-lock.json` policy.
- Use `npm install` in GitHub Actions, without npm caching, `npm ci`, Corepack setup, or a new `packageManager` field.
- Keep npm publication, release automation, PWA support, a full SEO system, framework migration, and changes to sibling repositories outside this plan.

## Proposed implementation

### 1. Assemble the Pages artifact

Add a focused CommonJS generator under `scripts/` and expose it through `npm run build:pages` after the existing production build. The generator should:

- Reuse `scripts/discover-pages.js` and its deterministic ordering.
- Require a generated HTML destination for every discovered demo.
- Write a complete HTML document to `dist/index.html`, with a language attribute, character encoding, viewport metadata, descriptive title, primary heading, and semantic list of links.
- Style the landing page with the semantic palette and contrast rules in the following section.
- Use directory names as labels, escape HTML text and attributes, and encode each page name as a URL segment.
- Use relative destinations such as `./example/` so the artifact works under `/pages/` without hardcoding that prefix into demo bundles.
- Replace the landing document on every successful Pages build, removing links to deleted demos.
- Fail clearly when discovery or artifact generation fails. Do not produce an empty success page after an error.

Run generation only after all Webpack compilers finish successfully. Keep the current per-page cleanup behavior. A later ordinary build may remove the generated root page; document that `build:pages` is the command that recreates the complete Pages artifact.

#### Landing page basic colors

Use the supplied color scheme through semantic `--color-*` properties. Keep palette definitions in maintained source used by the generator; do not manually style generated `dist/index.html`. Component styles should reference semantic properties rather than repeat palette hex values.

Use a static light theme as the baseline for this plan, with `data-theme="light"`, CSS `color-scheme: light`, and a `theme-color` metadata value of `#ffffff`. Theme switching, system preference detection, and persisted preferences are outside this basic-color update, so the landing page still requires no browser JavaScript.

Preserve the supplied light and dark pairings as the palette contract:

| Token                | Light     | Dark      |
|:---------------------|:----------|:----------|
| `--color-primary`    | `#4d8ffb` | `#5089e8` |
| `--color-on-primary` | `#141414` | `#141414` |
| `--color-surface`    | `#ffffff` | `#141414` |
| `--color-heading`    | `#2d2d2d` | `#d6d6d6` |
| `--color-body`       | `#626262` | `#a5a5a5` |
| `--color-muted`      | `#828282` | `#878787` |
| `--color-divider`    | `#f6f6f6` | `#1d1d1d` |
| `--color-field`      | `#ebebeb` | `#272727` |
| `--color-focus`      | `#d9d9d9` | `#373737` |
| `--color-fieldset`   | `#c0c0c0` | `#4e4e4e` |
| `--color-code-bg`    | `#eeeeee` | `#242424` |
| `--color-code`       | `#e83e8c` | `#d44386` |
| `--color-highlight`  | `#fff9c0` | `#413f2b` |

Apply surface, heading, and body roles to the page background, primary heading, and descriptive text. Use divider and field roles for subtle separators and borders, and highlight for text selection. These roles do not require adding cards, fields, code blocks, or other unnecessary components.

For essential normal-size demo links, define a semantic link-text role using the supplied accessible light blue `#2f73df`. Keep `--color-primary` for accents, borders, large text, and filled controls; `#4d8ffb` on white does not meet the supplied normal-text contrast requirement. Underline links and preserve a clearly visible keyboard focus indicator. Do not rely on the subtle `--color-focus` border alone for focus visibility.

Use `--color-on-primary` for text on any primary-filled control. Keep light muted text secondary and noncritical. Derive optional tinted surfaces and interaction treatments from semantic tokens with `color-mix()` or alpha colors, and verify contrast for the actual rendered combinations.

If dark-theme behavior is approved later, apply the paired dark tokens together under the resolved root selector and synchronize CSS `color-scheme` and browser `theme-color` (`#141414`). Do not activate only isolated dark colors. Bootstrap mapping is unnecessary for this landing page and does not justify adding Bootstrap.

### 2. Validate the deployment artifact

Add `npm run validate:pages` and a focused validator under `scripts/`. Validate the final artifact without rebuilding it:

- Require `dist/index.html` and each discovered demo's `index.html`.
- Confirm the root directory includes every discovered demo exactly once and no stale demo entries.
- Resolve directory links and supported local asset references against the intended `/pages/` mount path.
- Check that resolved local files exist and remain inside the artifact boundary.
- Distinguish external URLs, fragments, and other non-file references from local artifact paths.
- Verify that HTML-only pages do not receive unnecessary page bundles.
- Report the affected page and reference when a check fails, and return a failing exit status.

Keep the validator focused on generated output and the project's supported markup. Browser checks should complement static checks for runtime-loaded chunks and assets.

### 3. Add GitHub Actions deployment

Create `.github/workflows/pages.yml` with separate build and deploy jobs. Proposed triggers are pushes to `main` and manual dispatch. Confirm this branch policy before enabling the workflow; release-branch deployment is not assumed.

Use the action versions specified for this project plan:

- `actions/checkout@v7`
- `actions/setup-node@v6`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

The build job should execute these steps in order:

1. Check out the repository.
2. Set up Node.js 22 with `package-manager-cache: false`.
3. Install dependencies with `npm install`.
4. Run `npm run lint`.
5. Run `npm run test`.
6. Run `npm run build:dev`.
7. Run `npm run build:pages`.
8. Run `npm run validate:pages`.
9. Configure GitHub Pages.
10. Upload `dist/` with the Pages artifact action.

Do not add nonexistent template scripts such as `docs`, `typecheck`, `seo:validate`, or `pwa:validate` solely to match the reusable workflow. Do not use `actions/cache`, `cache`, or `cache-dependency-path`.

The deploy job should depend on the successful build job and deploy only its uploaded artifact. Default workflow permissions to `contents: read`; grant `pages: write` and `id-token: write` to the deploy job. Use the `github-pages` environment and derive its URL from the deployment action output. Use concurrency group `pages` with `cancel-in-progress: false`.

No `NPM_TOKEN` or npm publication workflow is needed for this goal.

### 4. Update project documentation

After implementation approval, update:

- `GOAL.md`: record the Live Demo URL, generated directory, and deployment artifact contract.
- `AGENTS.md`: replace the no-deployment statement and document Pages build and validation responsibilities.
- `README.md`: add the Live Demo link, new commands, deployment prerequisites, and the distinction between local development and the Pages landing page.

Keep source ownership and package-manager policy consistent across these documents.

## Validation after implementation approval

Extend the existing Node test approach with focused cases for deterministic directory generation, special characters in names, missing artifacts, page addition and removal, and regeneration after cleanup. Preserve existing coverage for all optional page-file combinations, external asset merging, page isolation, lazy chunks, and development and production builds.

Run the following checks from the `pages` repository after implementation is authorized:

1. `pnpm install --frozen-lockfile`
2. `npm run lint`
3. `npm run test`
4. `npm run build:dev`
5. `npm run build`
6. `npm run build:pages`
7. `npm run validate:pages`
8. `git diff --check`
9. `git status --short`

Serve the completed artifact locally under `/pages/`. Verify the root directory, direct loads of both demo routes, navigation, counter interaction, asset requests, and browser errors. Exercise a lazy-loaded fixture under the same subpath when validating runtime asset resolution.

Inspect the landing page's semantic colors, normal-text link contrast, keyboard focus, hover states, and text selection. Confirm that its static light root attribute, CSS color scheme, and browser theme metadata agree. Recheck contrast after changes to font size, opacity, backgrounds, or mixed-color treatments.

Report installation, network, or browser limitations separately. A successful build alone does not establish that GitHub deployment or browser behavior works.

## Deployment prerequisites and recovery

Before an authorized deployment, verify that the remote repository corresponds to the intended URL, GitHub Pages uses GitHub Actions as its source, and the `github-pages` environment permits the selected deployment branches. These remote settings have not been verified during planning.

After an authorized deployment, check the three public routes and confirm the workflow's environment URL matches the intended site. If a release fails validation, keep it from reaching deployment. For a deployed regression, use an authorized revert and rebuild of a known-good revision; dependency resolution may differ because CI does not consume the pnpm lockfile.

Creating this plan does not authorize commits, pushes, remote setting changes, workflow dispatch, or deployment.

## Risks and mitigations

- **Cleanup ordering:** Webpack removes root output before compilation. Generate the directory after the full production build and test repeated builds.
- **Incorrect URLs or escaping:** unusual directory names can break links or HTML. Encode URL segments, escape markup, and test representative names.
- **Color contrast:** light primary and muted colors are unsuitable for some essential normal-size text. Use the specified semantic text roles and verify rendered text and focus indicators against their actual backgrounds.
- **Subpath regressions:** root-relative links can escape `/pages/`. Validate the artifact under its production mount path and check browser requests.
- **Dependency drift:** CI's `npm install` does not read `pnpm-lock.yaml`. Preserve this documented policy and distinguish local frozen-lockfile results from CI results.
- **Public content:** every discovered demo is included in the artifact and directory. Review new page contents before deployment.
- **External assets:** production resources may fail independently or use insecure URLs. Review configured production assets and browser loading behavior.
- **Unverified remote configuration:** correct source files do not guarantee permitted deployment. Check Pages and environment settings before enabling delivery.

## Acceptance criteria

- [ ] `build:pages` produces a complete `dist/` artifact with a generated root directory.
- [ ] The root directory links to every discovered demo without a separate registry.
- [ ] Adding or removing a demo updates the next Pages artifact and directory.
- [ ] HTML-only pages remain free of unnecessary JavaScript bundles.
- [ ] The landing page uses the supplied semantic basic colors, accessible demo links, visible keyboard focus, and consistent static light-theme metadata without adding theme-switching JavaScript.
- [ ] Navigation, bundled assets, and runtime-loaded assets work under `/pages/`.
- [ ] Required local checks and CI validation pass before deployment.
- [ ] The workflow uses the specified action versions, Node.js 22, disabled caching, and the intended permissions and triggers.
- [ ] Project documentation reflects the implemented behavior.
- [ ] Remote prerequisites and public routes are verified during separately authorized deployment.

None of these implementation or deployment criteria is marked complete by creating this plan.
