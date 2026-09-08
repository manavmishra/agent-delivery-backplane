# Zero Slop pilot profile

Use this profile to coordinate an authorized Zero Slop change through existing repositories and release systems. The kit does not replace those systems or add a new runtime dependency. This profile was checked against local source on September 8, 2026; inspect current repository instructions and workflows before executing it.

## Choose the right repository

The public portable skill, offline Python scorer, npm CLI, plugins/extensions, and hosted MCP/REST service belong to [manavmishra/ZeroSlop](https://github.com/manavmishra/ZeroSlop). Its [AGENTS.md](https://github.com/manavmishra/ZeroSlop/blob/main/AGENTS.md), [SECURITY.md](https://github.com/manavmishra/ZeroSlop/blob/main/SECURITY.md), and [validation workflow](https://github.com/manavmishra/ZeroSlop/blob/main/.github/workflows/validate.yml) are the source contracts.

The live `zero-slop.ai` website belongs to a separate repository named `ZSWebpage`. Use an existing authorized checkout of that repository for website, browser WebMCP, and website reporting changes. This public kit includes no private checkout, account observations, screenshots, credentials or report payloads. The `website/` directory inside the public ZeroSlop repository is a retained testable snapshot. Its deployment refusal must remain; it is not the live website source.

At the audit date the portable release version was `2.10.2`. Read `package.json` for the current version rather than copying this historical value into a new change. The website's own package version does not identify the embedded skill release.

## Small first pilot

Proposed outcome: make the website's local preflight account for the native WebMCP check required by CI.

The inspected `ZSWebpage/scripts/preflight.sh` claimed to cover validation but omitted `node scripts/test-webmcp-native.mjs`. The website validation and source-sync workflows included that command. Reconfirm this gap at the chosen base revision before starting; close or replace the task if it is already fixed.

Scope the work to the preflight and any narrowly related documentation/test change. Run the native suite against the already built static output, preserve its failure exit and browser evidence, and obtain an independent review. The suite intercepts hosted inference and analytics; it may download pinned test browsers. It does not need to edit production settings or spend hosted model capacity.

Suggested acceptance criteria:

- The local path either runs the native WebMCP check after the build or plainly documents the required separate command.
- A failing native check prevents a misleading “all validation passes” conclusion.
- The checked static output is reused; no second unreviewed build is substituted.
- The change leaves deployment, privacy, analytics, browser installation settings and source-release contracts intact.
- Review and tests name the exact candidate revision; merge and deployment are tracked separately.

This is a pilot proposal only. Publishing this kit or exporting its sample does not implement, merge or deploy the production change.

## Website commands

Working directory: the root of the authorized **ZSWebpage** checkout, not `ZeroSlop/website`. Use Node 24 to match the inspected CI. The following are exact commands from the website validation path:

```sh
npm ci
npm run source:check
node scripts/verify-vendored-scorer.mjs
node scripts/parity-scorer.mjs
npm run sitemap:check
node scripts/check-blog-editorial.mjs
npm run brand:check
npm test
npm run lint
node scripts/test-webmcp-native.mjs
npm run audit:production
```

`npm test` builds `dist/static` and runs the test suite. Native WebMCP QA reuses that output. Source readiness and dependency auditing can contact external registries/services, so these are not all offline commands. Preserve the workflow's documented audit settings and failure handling; a missing dependency or audit outage is not a passing check.

The main deploy job ships the static artifact that passed CI. A validation run can succeed while deployment is skipped for missing credentials, so record actual deployment status. Source sync resolves an immutable published skill release, checks release assets, npm version/commit agreement and gateway/scorer readiness, and verifies browser parity before deploying the imported runtime. Its hourly reconciliation and existing notifications remain in place. Do not run deployment or source-sync mutation commands merely because a task moved sections.

For a blog in ZSWebpage, use its existing `docs/blog-editorial-style.md` and `content/blog-editorial-reviews.json`. Review the final article and supporting prose files, record actual source-review/copy-desk/read-aloud/verification/fresh-eyes roles, and bind the record to exact SHA-256 values. Run `node scripts/check-blog-editorial.mjs`. Hash freshness and declared reviewers do not authenticate factual truth or human approval. Publish only public evidence approved for the article.

## Portable skill and distribution commands

Working directory: the **ZeroSlop repository root**. These are existing checks, not an alternative to all required CI jobs:

```sh
python3 scripts/check_release_version.py <verified-base-ref>
python3 scripts/check_distribution_manifests.py
node distribution/sync-version.mjs --check
python3 -m compileall -q scripts tests bench
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/build_plugin.py --check
python3 scripts/build_bundle.py --check
python3 scripts/calibrate.py --selftest
python3 scripts/predictability.py --selftest
python3 scripts/register.py --selftest
python3 bench/validate_corpus_registry.py
python3 bench/make_charts.py --check
npm pack --dry-run --json
```

Replace `<verified-base-ref>` with the actual approved Git base. That release-delta check compares committed `base...HEAD`; it does not prove all uncommitted work was inspected. The validation workflow additionally contains the exact JSON parsing, regex compilation, scorer smoke, frontmatter, graphics and motion checks. Run its complete required job set for publication. The npm workflow compares the tarball's runtime inventory with the plugin mirror and checks maintainer-only exclusions; a successful `npm pack` alone is insufficient.

`package.json` owns the release number. A change to a released runtime/distribution path requires a new version under the repository's exact delta rules. The existing `node distribution/sync-version.mjs` synchronizes manifests and version markers; plugin, bundle and scorer outputs must then be regenerated and checked as applicable. Do not relabel benchmark results. Keep npm's runtime allowlist and `scripts/build_plugin.py` exclusions aligned. Private voice/learning files and maintainer-only tools must never enter the package.

For CLI and integration work, from the same root:

```sh
node --test tests/cli-deslop.test.mjs tests/cli-package-tools.test.mjs
node tests/cli-package-e2e.mjs
node --test distribution/homebrew/prepare-formula.test.mjs
node --test integrations/github-action/review.test.mjs
node --experimental-strip-types --test integrations/raycast/test/review.test.ts
node --test integrations/templates.test.mjs
node --test mcp/scripts/e2e_rest.test.mjs
```

CLI acceptance already has cross-platform CI. Package E2E runs without `--live`, using synthetic/local fixtures. REST language-example changes also require the language compilers and local-server acceptance in `.github/workflows/api-examples.yml`; missing languages must not be silently reported as covered. Full Homebrew installation acceptance is an existing manual workflow, not something this kit has run.

## Hosted MCP and REST commands

From the **ZeroSlop root**:

```sh
python3 mcp/scripts/sync_scorer.py --check
python3 mcp/scripts/test_scorer.py
```

From **ZeroSlop/mcp/gateway**:

```sh
npm ci
node ../../.github/scripts/audit-npm.mjs
npm run check
npm run dry-run
```

From **ZeroSlop/mcp/scorer**:

```sh
npm ci
uv sync --locked
node ../../.github/scripts/audit-npm.mjs
npm run dry-run
```

Match the current workflow's Node, Python, uv and audit configuration. The inspected MCP CI used Node 24, Python 3.13 and pinned uv. The dry runs package Workers without deploying them. Scorer regeneration, when required by an authorized runtime update, uses the existing `python3 mcp/scripts/sync_scorer.py --version <new-version>` from the root, followed by the checks above.

Root validation also tests the retained `website/` snapshot as a separate job. Passing only the runtime tests is not the entire release gate. Preserve the separate plugin scanner and relevant CLI/API acceptance results.

## Promotion and privacy

Existing main validation drives immutable-tag npm, GitHub-release and MCP-Registry publishers. Publication guards bind the release to a validated commit; hosted deployment rejects a superseded release and verifies scorer/gateway health. The website imports only a ready released version. Preserve these guards and their reconciliation paths. An Asana assignment, `approvedBy` string, completed checklist or valid JSON file cannot replace them.

For each delivery, retain the task ID, authorized scope, base/candidate revision, exact tests and outcomes, actual reviewer identity, release/deploy evidence and remaining limits. Keep design, implementation and independent review distinct. A coordinator may use several agents, but their outputs cannot certify their own independence by changing a name.

Keep this kit outside Zero Slop's offline runtime. Do not add Asana networking, subprocess execution, credentials or polling to the portable Python modules. Preserve the local-only learning boundary, source fidelity, path safety and no-fabrication rules. Explicit hosted editing already sends selected text remotely; preserve shared capacity/budget controls, no automatic paid fallback or model retry, and no draft-content telemetry across CLI, MCP, REST and web-live channels.

Keep real drafts, private profiles, account/task exports, business analytics, credentials and screenshots out of the public kit and blog. Use synthetic fixtures and public source links. The coordination layer must preserve every existing install, API, browser, GitHub review/CI and notification channel; it is an additional place to track work, not permission to remove them.
