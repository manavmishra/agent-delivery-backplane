# An Asana board for working with coding agents

> Draft for review. The audit extension described below is implemented locally; final independent review and publication are pending. The two proposed delivery skills remain uninstalled. No measured productivity improvement is claimed.

An agent can finish its assignment while the feature remains broken. The code compiles, the card moves, and nobody has checked whether the person using the product can complete the task.

For Zero Slop, I want one place to see what is being built, who owns the next step, and what still needs a decision. That has to cover the website and the skill repository without creating another system to maintain. The starting point is a free-compatible Asana workflow, with GitHub holding the code and release evidence.

The framework is called Agent Delivery Backplane. It is a small workflow kit with reusable tasks and a local validator. The agents run through the assistant the operator already uses. Moving an Asana card does not launch an agent or approve a release.

## Start with the handoff

Consider a website change. One agent can inspect the existing design while another prepares test cases. Once the design is settled, an implementation agent can change the page. Final testing has to examine that implementation, not an earlier screenshot.

The handoff needs to say which revision was reviewed, what the reviewer tried, and what happened. “Tests pass” leaves too much unspecified. A useful note names the command or user path, its expected result, and the observed result. If the code changes afterward, the relevant checks need to run again.

This is why each delivery task describes an outcome. The worker packets underneath it have narrower responsibilities: an input, a permitted file scope, an output, and a stopping condition. Two agents editing the same branch are not independent just because they have different names.

Anthropic's March 2026 application-development report used a planner, generator, and separate evaluator. Its evaluator exercised running applications against agreed criteria. That is useful engineering evidence for explicit handoffs and independent review. It does not establish that every project needs three agents, or that the same arrangement will be economical for our work. The reported comparisons differed in scope, time, and spending. [Anthropic's report](https://www.anthropic.com/engineering/harness-design-long-running-apps).

## Keep the daily workflow small

The board uses seven stages: Intake, Ready, Active, Review, Release, Done, and Blocked. Reference cards explain the workflow and provide a task to copy. They are kept out of delivery counts.

Ready means someone can begin without inventing the requirements. Active means there is an identified run and an agreed write scope. Review requires a result another person or agent can inspect. Release makes the production decision visible, including when merging a pull request will deploy automatically.

For a solo project, the owner can review an agent's work. A fresh agent can provide an additional review, but calling it “independent” must not imply a second human signed off. The executor cannot approve its own output.

I would start with one active outcome and at most three workers on non-overlapping work. Each packet gets an initial 30-minute timebox and at most two attempts. Those are adjustable operating limits, not research findings. Spending limits still need enforcement by the runner; writing a number in an Asana description does not enforce a budget.

The free baseline uses ordinary tasks, sections, subtasks, comments, and links, without requiring paid rules or custom fields. Asana's current Personal plan supports two people, with different terms for eligible legacy accounts. More agents should not mean inviting more fake teammates. [Asana Personal details](https://help.asana.com/s/article/asana-personal-plan-details?language=en_US).

## Add skills where they help

Two proposed assistant skills would make this workflow easier to invoke. Neither has been created or installed. The [full skills proposal](SKILLS-PROPOSAL.md) describes their scope and the checks required before installation.

`delivery-coordinator` would be the everyday entry point. In plan mode, it would turn an outcome into bounded work packets. Work mode would start authorized work through the existing assistant. Status would remain read-only. Recover would inspect stalled work and conflicting writers before proposing how to continue. A single entry point would spare the operator from repeating the handoff rules in every request; it would not make Asana an automatic dispatcher.

`delivery-reviewer` would examine a specific result in a fresh run. Its job would cover acceptance checks and regressions, including relevant security risks and release readiness. That gives the implementer a separate review to address. The reviewer would report findings and evidence without silently fixing its own findings or merging the change. Human approval would still be required where the task or repository demands it.

These are the jobs the proposed skills would cover. None requires another Asana seat.

| Coordinator use cases | What the operator gets |
| --- | --- |
| Set up the board; turn an idea or bug report into a task | A reusable structure and an outcome with explicit boundaries. |
| Show what needs attention; choose the next outcome; check readiness | A reasoned priority and the information still missing before work starts. |
| Split independent scopes; start authorized implementation | Named runs with permitted files, prerequisites and stopping conditions. |
| Track a run; coordinate handoffs | Current evidence and enough context for the next worker. |
| Recover blocked work; handle failed or stale evidence | Preserved output and a next step that avoids a competing writer. |
| Prepare release decisions; close accepted work | The exact action requiring consent and proof of the delivered result. |
| Review a pilot or weekly workload | Recorded review effort and rework, with missing measurements left explicit. |
| Maintain the audit trail; generate historical status; reconcile uncertain writes | A dated request-to-outcome record without manual card maintenance or duplicate updates. |

| Reviewer use cases | What the operator gets |
| --- | --- |
| Review the plan and implementation against the request | Concrete gaps before execution or acceptance. |
| Check tests and failure behavior; review the actual website | Observed behavior tied to a build, including what was not tested. |
| Check scope and operational risk | Permission, data and deployment risks that need a decision. |
| Inspect completion records; audit the chronology | Missing or stale evidence separated from product defects. |
| Review documentation and claims | Corrections supported by the source material. |
| Assess release readiness; verify an authorized release | Whether the candidate is ready, then whether it reached its target. |
| Re-review changes; return incomplete reviews honestly | A current finding list rather than an approval inherited from an older revision. |

Specialist work can use skills and tools the operator already has:

| Work | Skill or capability | Use case and value |
| --- | --- | --- |
| Website design | `design-taste-frontend` | Audit the existing interface and design a change against the actual brief. |
| Animation and visual direction | `taste-creative`; `imagegen` when a raster asset is appropriate | Prepare the visual treatment or assets without treating every design task as image generation. |
| Browser checks | Browser tools; `cloudflare:web-perf` for a performance audit | Exercise user paths; measure load performance when it is part of the task. |
| Cloudflare changes | The relevant Cloudflare skill, including Workers best practices or Wrangler | Check runtime code or deployment commands against platform guidance. Deployment still needs authority. |
| Blog, README and release writing | `zero-slop` | Edit prose while preserving the author's facts and voice. It does not supply missing evidence. |
| Evidence gathering | Web research; Deep Research only when explicitly requested | Find sources and check what they support before a claim enters the work. |
| Code and tests | The existing coding assistant, repository `AGENTS.md`, and CI | Implement a scoped change and run the repository's required checks. |

Only load the specialists a packet needs. None of these instructions grants credentials or expands permissions, and a missing connector must be reported rather than worked around through unapproved account access.

## A board cannot guarantee execution

A task assignment does not prevent two coordinators from starting the same work. After a timeout, the old worker may still be writing. Webhooks can miss changes.

Before adding unattended dispatch, a runner needs durable ownership and a way to reject writes from a replaced worker. It needs bounded retries, duplicate protection, and periodic reconciliation with current task state. Asana's webhook documentation explicitly describes possible lost events, so an event should trigger a state check rather than serve as an instruction to execute. [Asana webhook guide](https://developers.asana.com/docs/webhooks-guide).

The initial kit keeps that boundary explicit. Its local validator checks the work-packet structure and recorded prerequisites, including whether a completed task names a reviewer other than the executor. It cannot verify the identity behind a name or the test results a URL points to. GitHub checks, repository permissions, and human judgment remain part of delivery.

That distinction also keeps the framework replaceable. Asana can change its plans, and an assistant can change its models. The packet still has to explain the outcome and preserve enough evidence for the next worker to continue.

## Keep the history behind Done

A task marked Done today cannot tell us what was known yesterday. The audit extension records both when an event happened and when it entered the record. A test result added at 10:30 is absent from a report with a 10:00 cutoff, even if the test ran earlier.

The housekeeper records the original authority and scope, then retains worker handoffs and the checks tied to each revision. Release has its own receipt and target verification. If a deploy is skipped, it stays skipped. If a task reopens, its old closure does not certify the new work.

Asana holds the current summary and dated comments. GitHub holds the underlying code and release evidence. A private JSON record supports the offline command:

```sh
node src/cli.mjs audit examples/audit-trail.json --as-of 2026-01-01T10:10:00Z
```

That command uses an illustrative example. It does not fetch Asana data or authenticate the people and evidence named in the file. It reports missing information explicitly, including legacy tasks with no history. An unknown start time should remain unknown; inventing one would defeat the point of the record.

The agent maintains these checkpoints during an authorized development session. If Asana access fails, it preserves a private pending update and checks the current task before retrying. Ordinary comments and local JSON provide a process audit. They do not provide an immutable compliance archive or a background service that works after the assistant stops.

## Measure what the agents leave for people

Agent activity is easy to count. The useful question is whether accepted work reaches users with less human effort and manageable rework.

METR's February 2026 follow-up illustrates why that is harder to measure than it sounds. Its newer experiment had substantial selection effects, and time measurement became unreliable for some developers using concurrent agents. The researchers described the data as an unreliable signal of the current productivity effect. Neither a universal slowdown claim nor a precise new speedup estimate follows from that result. [METR's follow-up](https://metr.org/blog/2026-02-24-uplift-update/).

For this workflow, I would record elapsed delivery time separately from human working time. Review time, rework, failed changes, and spending belong in the same record. Keep task type and tool version attached so a documentation edit is not compared with a risky release as though they were equivalent.

The proposed Zero Slop preflight pilot is deliberately narrow: check whether the local website preflight includes the native WebMCP regression required by CI, then close any confirmed gap with a test. Its live status needs verification before publication. This framework has not yet produced a measured improvement in delivery performance.

Start with one accepted change and inspect the record afterward. If another person can tell what changed, why it passed, and how to undo it, the next handoff has the information it needs.
