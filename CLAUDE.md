@docs/ASANA-HOUSEKEEPING.md

# Repository work

Read `README.md` and the relevant documents before changing the work contract. This repository provides a workflow kit and local validator. Keep it usable with free Asana features, an existing assistant, and no hosted service or required model API.

For authorized development, automatically invoke the bounded Asana housekeeping role defined above. The user requests the work; the coordinator is responsible for having the board maintained and verified. Questions, status, diagnosis, and review-only requests stay read-only unless recording is explicitly requested.

Preserve unrelated changes. Use `npm test` for validator changes and the documented `node src/cli.mjs` checks for manifests; inspect current commands before running them. A local validation result does not authenticate a reviewer, verify a remote release, or enforce runner budgets.

Read `docs/AUDIT-TRAIL.md` for per-work history and point-in-time reporting. Apply the contract to this repository's own development too. Preserve missing evidence as a gap; a review that stopped before inspecting the final candidate is not approval to release it.

Changes to runtime code, schemas, connectors, permissions, releases, or billing need the authority appropriate to the actual request. Housekeeping does not grant that authority. Do not create or install skills under these instructions; optional skills still require the user's separate decision.
