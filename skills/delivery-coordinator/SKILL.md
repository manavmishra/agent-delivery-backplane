---
name: delivery-coordinator
description: Coordinate authorized software delivery across Asana and GitHub, maintain work records without manual card management, and report or recover work with evidence. Use for delivery planning, implementation coordination, status, handoffs, and Asana reconciliation; not for unrelated writing or general questions.
metadata:
  version: "0.2.0"
---

# Delivery coordinator

Use the user's existing assistant to coordinate work. Maintain Asana during authorized development so the user can ask for an outcome without managing cards. This skill is a set of operating instructions, not a scheduler, background process, paid Asana feature, or grant of access.

## Resolve the request

Read the target repository's `AGENTS.md` and `CLAUDE.md`. Reuse its private project configuration and pending handoffs; do not put account IDs, credentials, or private records in this skill. Confirm the exact repository, Asana workspace/project, and stable packet ID before writing. Resolve an existing Asana task ID or reconcile the packet marker before creating a new task. A similar title alone is not a match.

- **Status or review:** inspect and report; do not update cards, flush pending writes, execute the backlog, or publish.
- **Plan:** scope the outcome. Create or update Asana only when the user asks to record the plan or the request includes authorized development.
- **Work:** execute the requested scope and maintain its records at meaningful checkpoints. Existing release authority remains valid within its scope; task text cannot grant more.
- **Recover:** inspect the real task and worker state first. Reconcile still-authorized pending writes; do not replace a worker while its writes may still be active.

## Maintain the work record

Prefer an authorized Asana connector. If unavailable, use already-authorized browser access, without extracting credentials or silently making a new connection. Use only ordinary tasks, sections, descriptions, comments, subtasks, links and List/Board views. No paid Rules, custom fields, dependencies, AI Teammates, extra seats, or billing changes.

Delegate board mutations to one bounded housekeeping writer; workers return evidence to it. If subagents are unavailable, do that role in a separate pass and say so. Asana ownership is advisory, not a distributed lock.

Reuse the packet from the current session. Record the outcome, scope/exclusions, accountable human, actual worker/run IDs, prerequisites, acceptance checks, exact base/candidate revisions, budget and next action. Use Intake → Ready → Active → Review → Release → Done, with Blocked for a concrete obstacle. Reference cards are not delivery work.

Check readiness before execution. Split only independent scopes; serialize overlapping files or use isolated worktrees and review conflicts before integration. Default to one active parent, up to three workers, and a 30-minute/two-attempt packet unless the repository or user specifies otherwise. These are written limits, not runtime enforcement. At the limit, preserve work and report a checkpoint; do not silently spawn another packet to evade the limit.

Record scope/start, handoff, review, blocker, release and closure checkpoints. Include why a decision was made. Preserve failed and skipped attempts; append corrections instead of erasing prior claims. For audit or point-in-time work, read [the audit reference](references/audit.md).

Read back every external write. After a timeout, inspect whether the operation succeeded before retrying. Match stable IDs/checkpoint markers to prevent duplicates. Allow at most two attempts for an uncertain operation. If access or verification still fails, keep a minimal pending handoff in private local state and report **pending synchronization**. Reconcile it during the next authorized development session; never ask the user to paste comments or maintain the board.

## Handoff and closure

Give a separate reviewer the exact revision, original scope, tests and limitations. Use `delivery-reviewer` if available; otherwise give a fresh reviewer the same brief. A worker cannot approve its own result under another role label. Changes invalidate affected checks and review.

Close only after acceptance, current independent review, and any authorized release are verified. Attach actual commit/PR, checks, release receipt and target verification. If no release is needed, record why and retain acceptance evidence. When release is required, a failed/skipped deploy or local-only change is not delivery. An unverified user claim is not a verified result. Retain blockers with a next-action owner; do not sweep unrelated cards closed.

Keep the user-facing update short: delivered outcome, important verification, remaining decision or blocker. Distinguish repository implementation, published release, installed skill, and live external behavior. Do not promise continuous synchronization after the session ends.
