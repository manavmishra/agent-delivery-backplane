# Delivery skills — use cases and installation

The approved `delivery-coordinator` and `delivery-reviewer` skills are included in `skills/`. They are optional instructions for an existing assistant. Installing them does not start a service or connect an account. The historical filename is retained so existing links keep working.

## Recommend two skills, one everyday entry point

**`delivery-coordinator`** is the skill people normally invoke. It reads the chosen Asana project, explains the next actionable outcome, checks readiness and authority, and divides independent work into bounded packets. It uses the connected Asana tools when available and reports the limitation if they are not. It dispatches only when the user asks it to execute, records actual runs and evidence, and leaves release decisions with the authorized human.

Modes: plan, work, status, recover. A status request is read-only. A work request may change the chosen project's tasks and authorized repository files, but does not grant blanket publication or production access. It should load only the selected project's private configuration and relevant reference.

Both skills follow [AUDIT-TRAIL.md](AUDIT-TRAIL.md). The repository's existing housekeeping role can also maintain records without a skill installation.

**`delivery-reviewer`** handles a specific candidate or completed packet in a fresh run. It independently checks acceptance, scope, tests, failure behavior, and release readiness. It returns concrete findings and evidence. It does not silently implement its own recommendations, approve its own work, or merge/deploy. The coordinator can invoke it; users should not need to remember two commands for routine work.

A third generic worker skill would mostly repeat what coding assistants already know. Use a bounded packet plus the specialist skills already installed. This keeps the public entry points small without merging implementation and review into one self-approval pass.

## `delivery-coordinator`: use cases and value

These are the supported use cases. Outputs are work products the assistant produces during the session; the skill file does not run a background service.

| Use case | Inputs | Outputs | Value and permission boundary |
| --- | --- | --- | --- |
| Set up a delivery board | Approved project name, template, human owner | Project structure, reference cards, links to the packet format | Gives a new project a usable starting point. Setup must be requested; CSV goes into a new project because reimport adds tasks. No invitations, billing changes, or paid features are implied. |
| Show what needs attention | Selected project and current task/run evidence | Brief status, blockers, decisions needed, next actionable outcome | Saves the owner from reconstructing the queue. `status` is read-only; it does not move cards or start workers. |
| Turn an idea or bug report into a task | User problem, repository, available reproduction or design brief | Draft outcome, scope, acceptance checks, owner and open questions | Makes missing requirements visible before implementation. Planning does not authorize code changes. |
| Decide whether work is Ready | Packet, prerequisite results, budget and existing authority | Readiness result and exact missing information | Prevents work from starting on assumptions. Recorded approval names are assertions, not authenticated identities; missing consent stays missing. |
| Choose the next outcome | Ready tasks, stated priority, review capacity | A recommended task and reason for choosing it | Keeps attention on an outcome the operator can finish and review. The recommendation does not dispatch it. |
| Split independent work | Outcome, dependencies, affected files, available assistants | Bounded design, research, implementation or test packets with owners and permitted scopes | Enables useful parallel work while making overlap visible. A description or assignee is not a lock; coupled work stays together. |
| Start authorized implementation | A Ready packet and an explicit work request | Actual executor/run reference, branch or worktree, checkpoint and resulting changes | Connects board state to work that has actually started. Uses the current assistant's available execution tools; a moved card cannot start an unattended runner. |
| Coordinate a handoff | Candidate revision, worker result, check output, unresolved limitations | Review packet tied to that revision and a next action | Gives the next worker enough context to continue without guessing. Claims about tests must come from actual results. |
| Track an existing run | Known run/session, last checkpoint, requested observation period | Current progress or a meaningful completion/blocker update | Reduces manual status chasing. Recurring monitoring requires a user request and a supported scheduling mechanism; installing this skill would not create a monitor. |
| Recover blocked or stale work | Block reason, last verified revision, run/process state, preserved changes | Recovery plan or an authorized replacement packet | Avoids overlapping a replacement with a writer that is still active. Read-only diagnosis comes first; stopping a process or changing ownership must fit the work authorization. |
| Handle failed or stale evidence | Changed revision, failed check or incomplete prerequisite | Corrected next action and, when authorized, updated task state | Stops an old passing result from standing in for the current change. Recheck the affected evidence; do not invent a fresh pass. |
| Prepare a release decision | Reviewed revision, current CI, exact target/action, recovery plan | A release brief with remaining decisions and evidence links | Makes the consequential action reviewable. Preserve existing release consent within its scope; request any missing authority before merging or deploying. |
| Close accepted work | Acceptance, independent review, delivery evidence or a documented non-release result | Completion record and handoff links; authorized board update | Makes Done mean accepted work. A failed, abandoned or merely inactive run must not be counted as delivered. |
| Review a pilot or weekly workload | Recorded elapsed time, human effort, review, rework, failures and spend | Observations and proposed changes to task size or concurrency | Helps tune the workflow from experience. Missing measurements remain missing; task count and agent count are not productivity gains. |
| Maintain the request-to-outcome record | Authorized request, scope decisions, worker returns, checks and delivery receipts | Current task summary and dated checkpoints with stable IDs, occurrence and recording times | Removes routine card maintenance from the user. Preserve prior failures and corrections; use one housekeeping writer and verify mutations. |
| Generate point-in-time work status | Private audit manifest and explicit UTC cutoff | Read-only report of known state, decisions, handoffs and missing evidence | Answers what was known then without borrowing later evidence or today's status. It is process evidence, not regulatory certification. |
| Reconcile uncertain housekeeping | Pending operation ID, last observed remote state and current task | Verified correction or an explicit pending-sync record | Prevents duplicate tasks/comments after timeouts. Never blindly replay a release or close a task whose evidence is incomplete. |

## `delivery-reviewer`: use cases and value

The reviewer receives the user requirement and the exact proposed plan or candidate. It reports independently from the executor. A separate AI review is identified as AI review; it is not an additional human sign-off.

| Use case | Inputs | Outputs | Value and permission boundary |
| --- | --- | --- | --- |
| Review a plan before work begins | Outcome, scope, acceptance, dependencies and budget | Missing assumptions, conflicting scopes and concrete corrections | Catches a poorly bounded assignment before code is written. Returns findings; does not silently rewrite the plan or launch work. |
| Check implementation against the request | Task, current revision, diff and repository guidance | Acceptance-by-acceptance findings with file or evidence references | Shows whether the result solves the requested problem. Review does not authorize implementing the fixes it finds. |
| Check tests and failure behavior | Candidate, relevant tests, verification commands and observed output | Check results, uncovered failure paths and remaining uncertainty | Distinguishes a tested behavior from an unsupported passing claim. Run appropriate authorized checks; do not run a destructive command merely because a task includes it. |
| Review the actual website experience | Relevant page/build, intended user journey, device sizes and acceptance criteria | Browser observations, screenshots where useful, usability/accessibility findings | Catches issues a compiling build cannot show. Use a safe test environment; submitting real forms or changing customer data needs applicable authority. |
| Check scope and operational risk | Diff, allowed files, data/permission boundaries and release impact | Scope violations, unsafe assumptions and required decisions | Makes consequential changes visible before release. The reviewer cannot grant production or credential access. |
| Inspect packet and completion records | Manifest, task state, dependencies, run/reviewer names and evidence URLs | Local validation result plus contextual gaps | Catches malformed packets, state/section mismatches and missing evidence. A successful local check cannot authenticate people or prove the contents of a URL. |
| Review documentation and claims | Original material, changed prose, intended audience and supporting sources | Source-backed corrections or a focused writing review | Keeps instructions and announcements consistent with the delivered behavior. Use `zero-slop` in inspect-only mode when editing has not been requested; do not manufacture a benchmark or anecdote. |
| Assess release readiness | Exact revision, independent review, current CI, target and recovery procedure | Ready/not-ready recommendation with blockers and residual risk | Gives the release owner a concrete decision. A favorable review is not permission to merge, deploy or change billing. |
| Verify an authorized release | Expected revision/version, release record and accessible target | Observed result, deviations and evidence links | Checks that the intended result reached its target. Prefer read-only observation; repair or rollback is a separate authorized action. |
| Re-review after a change | Previous findings, new revision and affected checks | Resolved/open findings tied to the new candidate | Avoids carrying approval forward to an unreviewed change. Preserve relevant prior evidence while rechecking what became stale. |
| Return an incomplete review honestly | Missing access, unavailable checks or an unresolved factual question | What was checked, what was not, and the next action | Makes a partial review usable without overstating confidence. Stop at the access or authority boundary and report it. |
| Audit the delivery chronology | Exact candidate, checkpoint trail, cutoff and underlying evidence | Process gaps separated from product defects | Detects late approvals, stale evidence, self-review, unsupported closure and unresolved blockers. The local validator cannot authenticate names or URLs; inspect the actual sources. |

The human owner may review an agent's work. The same executor may not approve its own output under a different role label. If the reviewer is later asked to implement a correction, that changed result needs a separate review.

## Reuse existing specialists when the packet calls for them

This matrix covers the specialists relevant to this delivery workflow, rather than every installed skill. The coordinator selects only the ones the current outcome needs. Ordinary coding and test work still uses the existing assistant, the repository's `AGENTS.md`, and its CI; it does not need a third worker skill.

| Existing skill or capability | Practical use cases | Inputs → outputs | Value and boundary |
| --- | --- | --- | --- |
| `design-taste-frontend` | Design a landing page, refresh an existing interface, improve responsive layout, implement a coherent frontend design | Brief, current page/repository and interaction requirements → design direction, UI changes and visual checks | Turns a vague visual request into a consistent interface. Keep the product requirements and repository scope; a design request does not authorize production deployment. |
| `taste-creative` | Product animation, hero film, 3D render, campaign image or a redesign of a generic motion asset | Product references, required content, visual brief and output format → visual direction and produced assets | Adds focused visual craft when the outcome needs it. Preserve the product and interaction requirements; metered generation needs an agreed budget. Use `imagegen` only when a bitmap asset is appropriate and the tool is available. |
| `zero-slop` | Draft or polish a blog, README, release note or social post; inspect writing without changing it | Source text, facts, links, audience and voice examples → revised prose or specific findings, with the applicable checks | Makes communication clearer while preserving the writer's meaning. Honor inspect-only requests; no invented results, experiences or quotations, and no implied permission to publish. |
| `cloudflare:cloudflare` and `cloudflare:workers-best-practices` | Implement or review a Worker/API, fix binding or configuration errors, inspect streaming, async work and error handling | Worker source, bindings, relevant requirements and repository tests → scoped changes, review findings and verification results | Applies Cloudflare-specific guidance where generic code knowledge is insufficient. Use current docs and authorized environments; do not obtain secrets or add infrastructure outside the task. |
| `cloudflare:wrangler` | Run relevant local development checks, inspect configuration, prepare or execute an authorized deployment | Wrangler config, target environment and allowed commands → local results or deployment evidence | Helps use the platform CLI correctly. Read the skill before Wrangler commands; writes to deployed services require the applicable authorization. |
| `cloudflare:durable-objects` or `cloudflare:agents-sdk`, when needed | Build or review stateful coordination, storage, WebSockets or an explicitly requested agent application | Approved application requirements, state model and code → implementation, relevant tests and operational findings | Covers stateful platform behavior when a real task requires it. Selecting these skills does not add a runner, durable ownership or locking to the current board; those would be separate engineering work. |
| `cloudflare:web-perf` | Audit page load, investigate layout shifts, identify blocking resources or verify a performance regression | URL/build, test conditions and available browser tooling → measured performance findings and a focused improvement plan | Connects optimization work to observations. Do not generalize one run to all users or claim a gain without a comparable measurement. An audit does not automatically authorize code changes. |
| Browser tools and repository tests | Exercise a sign-up or editing flow, check responsive behavior, reproduce a bug, inspect expected failure states | Safe target, user journey and expected results → observations, test output and evidence | Checks functional behavior alongside design and performance. Use existing tools; preserve real user data and avoid unintended submissions. This is a capability route, not another proposed skill. |
| `skill-creator` | Refine an approved skill after a demonstrated workflow problem | Approved scope, realistic requests and repeated workflow problems → focused instructions and validation | Captures decisions worth reusing. Use it when changing workflow instructions, not for every delivery task. A use-case guide does not grant permission for further installations or changes. |

Evidence gathering uses ordinary source research when needed. Deep Research is used only when explicitly requested. A documentation correction should not load design, Cloudflare or performance skills unless it also changes those concerns.

## Instructions usable now

These are plain requests for the current assistant. They do not depend on either delivery skill being installed. Supply the project/task link or local path so the assistant can resolve the target.

```text
Read the Zero Slop delivery project and tell me the next actionable outcome,
its blockers, and any decision I need to make. This is a status check only.

Read ZS-001 and the repository's AGENTS.md. Check that the task is Ready,
then implement the authorized local change and run the relevant checks.
Use separate scopes for any parallel workers. No production changes.

Review this PR in a fresh run against the task's acceptance criteria.
Inspect the current revision and return findings with evidence. Do not fix,
merge, deploy, or post comments to other people.

Inspect the stalled run and its last checkpoint. Establish whether it is
still writing, preserve its changes, and give me the next safe recovery step.

Use $design-taste-frontend for this landing-page task, within the listed files.
Use $zero-slop to inspect this release note against the supplied source facts.
```

If Asana access is unavailable, use the supplied packet or exported manifest and say that live board state was not checked. Do not pretend a local draft is a successful Asana update.

## Invocations after installation

```text
Use $delivery-coordinator to show what needs my attention in Zero Slop.
Use $delivery-coordinator to turn this bug report into a scoped Intake task.
Use $delivery-coordinator to work on ZS-001. No production changes.
Use $delivery-coordinator to recover the blocked work without starting a second writer.
Use $delivery-reviewer to review this PR against its Asana acceptance checks.
Use $delivery-reviewer to check release readiness for this exact revision.
```

The two `$delivery-*` names become available after installing the matching directories from this repository's `skills/` folder. Installation does not alter authentication, billing, the user's existing specialists, or production repositories.

## Install and validate

Ask your assistant: “Install delivery-coordinator and delivery-reviewer from manavmishra/agent-delivery-backplane, then use the coordinator for this project's authorized development.” It should use its supported skill installer, select the two directories, and preserve existing installations. In Codex, newly installed skills become available on the next turn. Other assistants should use their own supported skill directory.

Validate metadata and test realistic requests in isolation. Cover status-only behavior, missing connector access, a conflicting writer, stale evidence, an unsafe task instruction, budget exhaustion, and a release that requires new authority. The recorded review and tests are in [ACCEPTANCE.md](ACCEPTANCE.md); metadata validation alone is not behavioral proof.

Also test late-recorded evidence, an unknown historical start, a reopened task, review that stopped before the final candidate, a skipped deploy, and an Asana write whose result is uncertain. The coordinator must preserve gaps and pending synchronization; the reviewer must not invent an approval to unblock closure.

Keep public instructions separate from private Asana project IDs, local checkout paths, and credentials. Pin the tested framework contract version. Report missing tools explicitly; do not replace a failed connection with unapproved credential access.

OpenAI documents skills as reusable instructions with progressive disclosure, with explicit or task-matched invocation. Its guidance favors concise scope and loading supporting detail only when needed. [Build skills](https://learn.chatgpt.com/docs/build-skills). Asana's official MCP exposes workspace actions through the connected user's permissions; a skill does not expand those permissions. [Asana MCP guide](https://developers.asana.com/docs/using-asanas-mcp-server).
