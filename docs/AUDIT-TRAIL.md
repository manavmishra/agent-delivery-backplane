# A delivery record from request to outcome

Keep one chronological record per delivery packet. Asana shows the current summary and checkpoint comments. GitHub holds the code, checks, review, and release receipts. The local audit command reconstructs the assertions that were known at a chosen time.

This is an ADLC process audit, not regulatory certification. A valid record does not authenticate a person, open an evidence URL, prove a test passed, or make editable Asana comments tamper-proof. The coordinator still checks the underlying evidence. There is no paid Asana feature, background dispatcher, model call, or network request in the audit command.

## What the housekeeping role records

Start the record when authorized work starts. Update it at meaningful checkpoints, not after every tool call. The existing assistant handles this during the development session; the user should not have to maintain cards.

| Checkpoint | Retain |
| --- | --- |
| Request and authority | User request, accountable human, permitted work and release actions, target, exclusions. A task comment cannot grant new authority. |
| Scope and decision | Repository, base revision, acceptance criteria, required checks, rationale, alternatives rejected, and why a release is or is not required. |
| Execution and handoff | Actual agent/run IDs, role, branch/worktree and write scope, preserved output, next owner, conflicts, budget consumption or unknown usage. |
| Candidate and checks | Exact full commit SHA, command or user journey, expected and observed result, evidence, failures and skipped checks. |
| Independent review | Actual reviewer and role, exact candidate, findings, approval or requested changes, checks not performed. |
| Release and verification | Applicable human authority, exact candidate and target, actual release outcome, target verification. A skipped deploy is not delivery. |
| Closure or blocker | Accepted outcome with current evidence, or a concrete obstacle, next-action owner and resume condition. |

Descriptions are current summaries. Preserve history in dated checkpoint comments and private local records; add corrections instead of rewriting past decisions. Use a stable checkpoint ID to avoid duplicate writes. After an uncertain Asana write, read the task before retrying. If it remains uncertain, preserve a pending handoff rather than creating another task or posting repeatedly.

New delivery packets use `metadata.audit: {"schemaVersion":"1.0","events":[]}`. Reference cards contain instructions only, never a fabricated execution history. Existing manifests without this extension remain valid, but their audit report says `unknown` and lists `audit_trail` as missing. Do not backfill invented approvals or timestamps to make an old task pass.

## Generate a point-in-time report

With Node 22 or newer, from this repository:

```sh
node src/cli.mjs validate examples/audit-trail.json
node src/cli.mjs audit examples/audit-trail.json --as-of 2026-01-01T10:05:00Z
node src/cli.mjs audit examples/audit-trail.json --as-of 2026-01-01T10:10:00Z
node src/cli.mjs audit examples/audit-trail.json --as-of 2026-01-01T10:18:00Z
```

The example is entirely illustrative: placeholder identities, commits and evidence URLs, not Zero Slop production history. The three reports show Active with missing review/release evidence, then a supported closure, then Blocked after reopening with a new candidate. The present-day `task.state` is not substituted for historical state.

For real work, use an authorized private manifest outside public repositories. The command emits JSON to stdout and does not change the input or update Asana. It validates the entire supplied history first. Exit code 0 means the report was generated, **not** that every task is complete: inspect `closureVerified` and `gaps`. Invalid input or an invalid closure claim exits nonzero. `summary` remains the current manifest summary; it is not historical evidence.

## Event contract

The [structural schema](../schema/audit.schema.json) documents `task.metadata.audit`. The CLI also checks chronology and lifecycle rules that JSON Schema alone cannot establish.

Each event has a unique stable `id`, an `at` occurrence timestamp, a `recordedAt` timestamp, `kind`, `actor: {id, role}`, a short factual `summary`, and an `evidence` array of `{label, url}`. Timestamps must be explicit UTC, for example `2026-01-01T10:00:00Z`. Append in `recordedAt` order. Both timestamps must be at or before the report cutoff for an event to appear.

When the occurrence time is unknown, record a present-time `observation` explaining the gap. Do not label the observation as the missing approval or review. Late-recorded evidence remains absent from earlier reports. Events with equal occurrence and recording timestamps retain their array order.

| Kind | Additional fields |
| --- | --- |
| `authorization` | `actions`: `work` and/or `release`; a release needs `target`. Optional `candidate` narrows authorization to one SHA. The source must be an actual human authorization; the CLI cannot authenticate it. |
| `scope` | `scope: {repo, include, exclude}`, `acceptance`, `requiredChecks`, `releaseRequired`. |
| `worker` / `handoff` | `runId`; a handoff also needs `to`. Record actual actors, not invented Asana seats. |
| `candidate` | Full lowercase 40- or 64-character commit SHA in `candidate`. |
| `check` | `candidate`, `name`, `result`: `passed`, `failed`, or `skipped`. |
| `review` | `candidate`, `result`: `approved` or `changes_requested`; actor role `reviewer` or `human`. |
| `release` | `candidate`, `target`, `result`: `verified`, `failed`, `skipped`, or `not_applicable`. |
| `verification` | `candidate`, `target`, `result`: `passed`, `failed`, or `skipped`. |
| `state` | `state`: `intake`, `ready`, `active`, `review`, `release`, or `blocked`. Use a closure event for Done. |
| `blocker` | `nextAction`; explain the obstacle and responsible party in the summary. |
| `closure` / `observation` | A closure needs `candidate`; an observation uses only common fields. |

Required evidence links must be absolute HTTP(S) URLs without embedded credentials. Keep commands, outcomes and limitations in summaries; never store tokens, drafts, private learning data or unnecessary transcripts. URL checks are syntactic, not a safety scan. Private evidence must stay private. Git commits and URLs in public examples are not substitutes for real receipts.

## Completion gates and limits

A supported closure needs recorded human work authority, evidenced scope, an actual worker/run, a candidate, passed required checks, and an evidenced approved review from an identity different from every recorded worker. These assertions must support the current candidate. When a release is required, record matching release authority, a verified release preceded by its checks and review, and later verification at the same target. No-release work needs an evidenced `not_applicable` release record explaining why. Unresolved blockers prevent closure.

A new candidate or scope clears prior check/review/release evidence. Reopening clears closure. A later failed check, rejected review or blocker makes an earlier completion claim insufficient. The JSON packet's current `done` state also requires a current valid closure when the audit extension is present. Names, timestamps and receipts remain recorded assertions: the command cannot prove permission, detect omitted events, enforce budget limits, or determine whether an acceptance criterion was sensible.

Input limits remain 1 MiB, 50,000 JSON nodes and depth 20 across the manifest; each audit has at most 1,000 events and each event at most 20 evidence links. Split long-running work into linked bounded packets before reaching these limits. Keep earlier records; do not truncate history to make validation pass.

Retain each generated report with its cutoff, framework revision, source-manifest digest and the actual check results. This makes a report reproducible from that input. It does not provide cryptographic attestation or an immutable compliance archive. Stronger retention and unattended operation need separately engineered controls described in [ADAPTERS.md](ADAPTERS.md).
