# Operating model

Agent Delivery Backplane coordinates people and replaceable agents through an ordinary Asana project. GitHub holds code, reviews, checks, and release evidence. Agents execute through the tools their operator already uses.

## Start with five daily actions

1. **Choose one Ready outcome.** Confirm the user problem, repository, acceptance criteria, owner, and release impact.
2. **Split independent scopes.** Give each worker an independently reviewable packet. Keep coupled work together.
3. **Delegate bounded packets.** Assign scope, a branch/worktree, allowed actions, verification, and a budget. Record the actual run.
4. **Independently review evidence.** Inspect the candidate and run results against the agreed criteria. Return specific failures to the worker.
5. **Have the human release owner authorize release.** Use existing repository controls, then record the release and verify its result. Existing authorization remains valid within its scope.

Start with **one active parent outcome**, **up to three workers with disjoint scopes**, **30 minutes total per packet**, and **at most two attempts within that total**. Child packets share the parent's time, attempt, and spending limits; delegation does not multiply the budget. Set a monetary or token ceiling before using metered tools; an unknown cost is not zero. These are configurable initial recommendations, not research findings or enforced limits unless the chosen runner implements them. Repository restrictions can be stricter.

## Seven sections

Use these exact section names. A separate `Start here` section may hold reference tasks.

| Section | Meaning and admission evidence |
| --- | --- |
| Intake | A proposed outcome awaiting scope, priority, or missing information. |
| Ready | Concrete acceptance criteria; verified repository and target; named human owner; allowed scope; satisfied prerequisites; verification and release plan; budget. |
| Active | A current executor/run, base revision, unique branch/worktree, assigned scope, and remaining budget are recorded. The coordinator has checked for overlap. |
| Review | Candidate revision and diff/PR, check results, limitations, and relevant recovery steps are available for independent review. |
| Release | Review and applicable CI cover the current candidate. The release owner can assess the exact action, target, authority, and recovery plan. |
| Done | Acceptance is verified. For shipped work, release/deploy and target verification receipts are attached. For work requiring no release, record why release is not applicable. |
| Blocked | A specific dependency, unresolved failure, budget limit, or missing decision prevents progress. Record the last verified state, owner of the next action, and resume condition. |

The coordinator moves work back when evidence fails or becomes stale. Moving a card does not run an agent, approve a merge, or deploy software. Mark the Asana task complete only after its Done criteria are met. Keep abandoned or superseded work explicit in its description; do not count it as accepted delivery.

## One packet, one accountable owner

The parent task describes the outcome. Worker tasks or subtasks describe the parts that can be reviewed separately. Use description text and ordinary links for:

```text
Outcome / packet ID:
Human owner / coordinator / executor and run ID:
Repository / base revision / branch or worktree:
Allowed scope / exclusions / prerequisite links:
Acceptance criteria / verification commands or user paths:
Permitted actions / release owner / required decision:
Timebox / attempt limit / cost or token ceiling:
Candidate / checks / review / release evidence:
Last verified state / next safe action:
Audit checkpoint ID / occurred at / recorded at / decision and evidence:
```

Keep one writer on each branch and one coordinator updating execution ownership. Workers return artifacts to that coordinator. An assignee or claimed-at comment is a coordination convention, not an atomic lock. Replacing a stalled worker requires checking its process and preserving its changes before transferring ownership.

Review must actually examine the result. For a solo operator, a fresh agent run can provide a separate AI review; identify it as such. It is not another human approval, and the implementer's own tests are not an independent review. Check affected evidence again after revisions change. A merge that triggers production is a release action and needs the applicable authority before the merge.

Keep the [per-work audit trail](AUDIT-TRAIL.md) alongside the current packet. The housekeeper records actual decisions and handoffs from authorization through closure or blocker, without paid Asana fields. Preserve failed and skipped outcomes. A historical report uses only events known by its cutoff; missing history stays unknown. Reopening or changing the candidate invalidates the relevant completion evidence.

## Grow only when review capacity grows

One person can coordinate, dispatch, review, and own release decisions. Two people can divide ownership and review. Larger teams keep the same packet contract and add coordinators only when ownership and integration boundaries are clear.

The workflow uses only free features: sections, descriptions, tasks, subtasks, comments, and plain GitHub links. Do not use paid custom fields, native dependencies, Rules, templates, or GitHub widgets. Current Asana Personal allows two people; eligible legacy accounts differ. Visible trial features must not become dependencies. The workflow can add agent runs without fake seats, but the account's actual human-seat limit still applies. Check [Asana's Personal terms](https://help.asana.com/s/article/asana-personal-plan-details?language=en_US) and [current plans](https://asana.com/pricing). Do not upgrade the account as part of setup or delivery.

Review accepted outcomes, elapsed time, human review effort, rework, failures, and spend weekly. Increase concurrency when those measures justify it. Do not use agent count or closed-card count as a productivity claim.

See [security boundaries](SECURITY.md), [adapter requirements](ADAPTERS.md), and [research and limits](RESEARCH.md).
