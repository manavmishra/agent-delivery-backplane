# Acceptance plan

This plan separates three kinds of evidence: checks the local CLI can perform, exercises a coordinator must perform, and requirements for an adapter that does not ship in this version. A valid manifest is not proof that a reviewer is a different person, a worker stopped, a deployment succeeded, or an Asana project was created.

Use synthetic task descriptions and a temporary copy of the examples. Do not run the pilot against production, invite people, import into a shared project, send messages, or connect an account as part of local acceptance. An authorized operator performs any later live exercise.

## Local checks

From the kit repository root, with Node 22 or newer:

```sh
npm test
node src/cli.mjs validate templates/project.json
node src/cli.mjs validate examples/zero-slop.json
node src/cli.mjs summary examples/zero-slop.json
```

Export once to a new temporary output path:

```sh
node src/cli.mjs export examples/zero-slop.json --csv /path/to/temporary/zero-slop.csv
```

Replace that placeholder with an actual temporary directory. The default export must refuse an existing output file; `--force` is an explicit overwrite request. Exporting CSV creates a local file. It does not create or update Asana tasks. Re-importing the CSV can add duplicate tasks; it is not a synchronization mechanism.

The cases below are acceptance requirements. Record the command, exact kit revision, test name, result, and any limitation before marking them passed. Test output from an earlier revision is not current evidence.

| ID | Exercise | Expected result and scope |
| --- | --- | --- |
| L01 | Validate both shipped manifests and summarize the example. | Both validate; summary agrees with actual task counts/states. This proves file compatibility, not task execution. |
| L02 | Try malformed JSON, an unknown command/flag, excessive input size, duplicate IDs or rendered section names, nonexistent sections, unsupported states, and a delivery state/section mismatch. | Nonzero exit with a useful error; no output export and no modification of the input. Reserved lifecycle labels must match their canonical section IDs. |
| L03 | Remove the outcome, file scope, acceptance criteria, risk, or positive time/attempt budget from a delivery task in `ready`, `active`, `review`, `release`, or `done`. | Validation rejects the incomplete work packet. An intake idea may remain incomplete. |
| L04 | Move a delivery task to `ready`, `active`, `review`, `release`, or `done` while a declared delivery prerequisite is not `done`; also try an unknown prerequisite, a reference prerequisite, a self-dependency, and a cycle. | Invalid dependencies and premature readiness/execution fail validation. Textual prerequisite links in Asana still need the coordinator's check. |
| L05 | Mark a task `high` risk and move it into `active`, `review`, `release`, or `done` without `approvedBy`. | Validation rejects it. Adding a name records an assertion only; the human's actual authorization must exist in the review channel. |
| L06 | Mark a task `done` without an executor, approved review/evidence, or delivery evidence. Reuse the executor identity as reviewer. | Validation rejects each case. A valid alternative reviewer ID is not authenticated independence. `not_applicable` delivery still needs evidence explaining why. |
| L07 | Mark a task `blocked` without a reason or next action. | Validation rejects an uninformative blocked state. |
| L08 | Export descriptions with commas, quotation marks, line breaks, Unicode and formula-like prefixes. | CSV remains parseable; formula-like user data is neutralized for spreadsheet use; prerequisite IDs and instruction boundaries remain readable. Inspect the exact exported bytes. |
| L09 | Export again to an existing file without `--force`, then perform an explicitly requested overwrite on synthetic output. | Default refuses; explicit overwrite behaves as documented. Neither operation is represented as idempotent Asana import. |
| L10 | Inspect CLI imports, package dependencies and tests; run the local test suite with no Asana credential configured. | No Asana request, webhook listener, scheduler, agent dispatch, shell-command execution from task text, or model call is required for validation/export/summary. Browser/account setup is absent from local success claims. |
| L11 | Supply an evidence URL with credentials or a non-HTTP(S) scheme; inspect exported sample descriptions. | Invalid evidence is rejected; shipped examples contain no tokens, account metrics, private paths or personal addresses. URL validity does not certify that a destination is safe or accessible. |
| L12 | Run the illustrative audit at 10:05, 10:10 and 10:18 UTC on 2026-01-01. | Active, supported closure, then Blocked after reopening; the current task state cannot leak into earlier reports. |
| L13 | Add late-recorded evidence, invalid calendar dates, duplicate event IDs, unknown fields, excessive events or malformed roles. | Later evidence stays out of earlier reports; malformed histories fail with useful errors. |
| L14 | Claim closure after skipped/failed checks, self-review, stale candidates, wrong release targets, or release before review/checks. | The unsupported closure is rejected. A new candidate, reopen, rejected review or blocker invalidates affected completion evidence. |
| L15 | Audit a legacy manifest without history; run audit with no cutoff, then with a valid explicit cutoff. | Legacy work reports unknown history. A cutoff is required. Valid report generation writes JSON only to stdout and leaves the input untouched. Exit 0 is not a compliance pass. |

## Coordinator exercises

These are manual acceptance cases, not promises made by the validator. They may be rehearsed locally with two synthetic tasks. Live Asana checks require the operator's chosen project and existing authorization.

| ID | Exercise | Acceptance evidence |
| --- | --- | --- |
| M01 | Ask a first-time user to follow the README through validating the starter, reading one work packet, and exporting a CSV. | The user can explain who executes work, what to paste into an existing agent, where evidence goes, and what remains manual. Record observed confusion; the author reading their own instructions is not a newbie test. |
| M02 | Rehearse operation with trial-only custom fields, rules, native dependencies and GitHub widgets unavailable. | Ordinary tasks/sections/descriptions and plain links still describe the workflow. The README does not promise unlimited free human seats. Existing account limits are checked separately; upgrading is optional. |
| M03 | Review every “start,” “assign,” “automatic,” “dispatch,” “sync” and “done” claim in the README, sample and CSV. | Assignment means coordination; an existing agent harness or person must start execution. No CSV export, Asana status move or passing validator is described as running code. |
| M04 | Give a successor a prerequisite that is unfinished in the actual project while its local manifest says `done`. | Coordinator checks current evidence and withholds dispatch. A stale local manifest cannot override the real dependency. |
| M05 | Present a high-risk task with a fabricated `approvedBy` name and otherwise valid JSON. | It may satisfy syntax, but the coordinator refuses promotion without the actual human authorization for that scope. Use review-channel identity and an exact candidate revision. |
| M06 | Have the implementation agent propose its own approved review, or change the candidate after review. | Coordinator requests a separate review and invalidates stale approval. Same model/product on separate runs is recorded as AI review, not multiple human approvals. |
| M07 | Stop a worker or let its advisory claim expire, then let the old worker return late. | Mark the attempt stale; preserve its output. Check whether it still runs before takeover. A late result cannot overwrite or promote over a newer accepted attempt. The CLI does not enforce this. |
| M08 | Prepare two work packets with overlapping files or the same checkout. | Coordinator does not dispatch conflicting writers together. Assign disjoint work in isolated worktrees or serialize it. Asana assignment/claim comments are never treated as an atomic lock. |
| M09 | Rehearse importing the same CSV twice in an authorized disposable project. | Import guidance warns before the second import that rows add tasks. Inspect mapping and created rows; record stable IDs for manual reconciliation. No claim that CSV updates existing tasks or preserves all project settings. Until run, mark this case untested. |
| M10 | Review the kit and proposed blog as though both will become public. | Only synthetic examples and approved public evidence remain. No actual drafts, private task exports, analytics screenshots, credentials or local learning profiles. A private repo becoming public is a fresh publication decision. |
| M11 | Finish the Zero Slop preflight pilot on an isolated branch in the correct repository, if separately authorized. | Record exact diff, required checks and independent review; keep merge/deploy separate. A completed local pilot is not proof it reached production. See [the Zero Slop guide](ZERO-SLOP.md). |

## Future adapter checks

These cases are **not implemented** by a static manifest/CSV CLI. Do not describe an adapter as production-ready until its own tests and deployment evidence cover them.

- Atomic claim acquisition and fencing in the coordinator's authoritative store; two concurrent workers cannot both gain the same current write lease.
- Expiry, renewal and explicit recovery; an old fencing token cannot promote after takeover. Independent local state files across machines do not establish shared ownership.
- Duplicate webhook delivery, missing events, reordered events and expired credentials; reconcile current state rather than executing event text as a command.
- Ambiguous remote task creation; look for the stable task marker before retrying so a timeout does not create duplicate work.
- Bounded retries, rate-limit handling, scope-limited credentials, secret redaction and a stop mechanism for the external runner.
- An actual human-approval check before the adapter performs a consequential action, bound to task scope and candidate revision.

## Evidence record

Use one row per tested case: `case ID | revision | executor | method/command | result | evidence | limitation`. Valid results are `pass`, `fail`, `not run`, and `not applicable` with a reason. Never infer a pass from the presence of this document, a plan, a reviewer name, or a test that was only proposed. No live Asana import, trial downgrade, human onboarding session, or production pilot is claimed by this plan.

### Initial independent local review

On September 8, 2026, a separate Codex review agent inspected the CLI, schema and tests, ran `node --test` on macOS with Node `24.19.0`, and observed **15 passed, 0 failed**. Both shipped manifests validated. The Zero Slop summary contained two reference cards and four delivery tasks: two intake, one ready, and one blocked. A separate Python standard-library CSV parser confirmed four exported columns, preserved quotes/newlines/Unicode, and an escaped formula-like task name using synthetic input.

The review found and the implementation agent repaired three contract gaps: state/section mismatch could place unscoped intake work under Done; duplicate rendered section names could collapse board lanes; and Ready did not enforce the prerequisite rule stated in the operating model. The final test run includes those corrections. An existing-symlink check supplements the platform's no-follow flag; this is not a claim of protection against hostile concurrent filesystem changes.

Tested source SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `src/cli.mjs` | `ddcce0c1c68cbe84761c2a626830b1424aa58ba46fe779fe9f95be1167bc98d0` |
| `src/manifest.mjs` | `bc3bc06e85f4f4b1867e979f46891b301cd31fcf0419f4d001d684bc3da67c43` |
| `schema/manifest.schema.json` | `db8ae14d4687e14dba9dd8abd69a99348457280939ec7dc0877e435b998d6054` |

This records the local CLI suite and separate parser check, not a pass for every manual case above. Live Asana import/downgrade, independent human onboarding, Linux/Windows execution and autonomous-adapter recovery remain untested by this reviewer. The first shell-default Node run correctly hit the minimum-version guard; the passing results above used the supported runtime.

### Audit extension local checkpoint — September 8, 2026

The expanded suite passes **35 tests, 0 failures** on macOS with the bundled Node 24 runtime. It covers historical cutoffs, late-recorded evidence, malformed input, candidate changes, reopens, blockers, release ordering, authority assertions, independent actor IDs, no-release work, unchanged inputs and a deterministic 1,000-event history. The documented example reports Active, Done and Blocked at its three cutoffs. The template and its generated CSV remain reference instructions, without fictional completed work.

TDD evidence: the implementation agent's audit regressions were followed by a separate review that found reopening, release-ordering, repeated-worker and malformed-field gaps. Regression cases now cover those findings. A later scope/role test also failed before the coordinator's correction and passed afterward. Those local passes do not constitute the missing final independent review.

The reviewer stopped at a usage limit before inspecting the final combined change. **Final independent approval and publication remain pending.** The coordinator's tests are not substituted for that approval. No new package publish, paid Asana feature, autonomous dispatcher, Linux/Windows run or independent onboarding trial is claimed by this checkpoint. The standalone JSON Schema is documented and example-field checked; the runtime's explicit validator, not an external JSON Schema engine, enforces the semantic gates in these tests.

Tested implementation SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `src/audit.mjs` | `90f57d8021a53b4b4699940d199bfcb5651961abadd0d5951f94f6f828efe902` |
| `src/cli.mjs` | `b1a245ca0ba8e166f0292082e5674407c5126eccbb4593b36a6947a91b822d46` |
| `src/manifest.mjs` | `39176256ad7bfac37f6e757a62792605eec63a9843755c35a9161fd3dce11eaa` |
| `schema/audit.schema.json` | `99e057354ef877f2595668e3b0babc7e24e0ae0ebce4761181ccf4016fa0b881` |
