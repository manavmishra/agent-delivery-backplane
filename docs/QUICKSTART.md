# Run today's work

Tell your existing assistant what you want changed. During authorized development, the coordinator invokes the [Asana housekeeping agent](ASANA-HOUSEKEEPING.md) to find or create the delivery task, maintain its status, and close it after verification. You do not need to manage cards. No skill installation is needed.

The basic project uses only free Asana features: ordinary tasks, subtasks, descriptions, comments, links, List/Board views, and seven sections: **Intake, Ready, Active, Review, Release, Done, Blocked**. The agent can follow the [initial setup in the README](../README.md#start-without-code) when setup is authorized. Card moves do not dispatch agents. These instructions apply during active sessions; they do not install a background service.

Use one coordinator, which delegates board mutations to one housekeeping writer. Start with one active outcome and up to three workers on disjoint scopes, each with a separate branch/worktree. The starting recommendation is 30 minutes total per packet and at most two attempts within that total. Child packets share the parent's time, attempt, and spending limits; delegation does not multiply the budget. Set a spending or token ceiling for metered tools. Written budgets guide the operator; this kit does not enforce runner time or spending.

## 1. Prepare and assign a packet

Ask for the outcome and any constraints. The housekeeping agent resolves the configured project and workspace, matches existing work by task URL or stable packet ID, and creates a task only when needed. For Zero Slop, the project is **Zero Slop — Delivery**. It records the real human owner, repository, outcome, scope, prerequisites, checks, budget, and release owner without uploading credentials or private drafts.

The agent moves the task to Ready when prerequisites are satisfied. A detailed request can look like this; replace the brackets:

```text
Implement this outcome and maintain its Asana delivery record: [request].
Repository: [repository]. Outcome: [observable behavior].
Allowed scope: [files or subsystem]. Exclusions: [out-of-scope work].
Acceptance checks: [commands or user paths and expected results].
Budget: [timebox, attempt limit, spending or token ceiling].

Read the repository instructions and confirm the scope and existing authority.
Have the housekeeping agent match or create the task and maintain its record.
Record the base revision, executor/run, branch/worktree, and next checkpoint.
Then begin the authorized work and move the packet to Active.
Delegate only independent scopes your harness can isolate. Keep one writer
per branch and return worker results to the coordinator.
Return the diff, candidate revision, actual check results, and limitations
for review. Release is a separate step.
```

The housekeeping agent uses the authorized connector first and already-authorized Chrome UI as fallback. If neither works, it saves a private pending handoff, reports that synchronization is pending, and reconciles during a later authorized session when access returns. You do not need to paste updates. Paid Rules, custom fields, native dependencies, AI Teammates, and trial-only features are not used.

## 2. Check progress

Ask the coordinator:

```text
Report the current state of [packet]. Include the current revision, work
completed, checks actually run, remaining budget or unknown usage, blockers,
and next safe action. Keep this status check read-only.
```

During authorized development, the housekeeping agent moves the task to Blocked when a dependency, missing decision, or exhausted budget prevents progress and records the resume condition. Status or review-only requests do not authorize board writes unless you ask for recording. Before replacing a stalled worker, the coordinator checks its process and preserves its changes; a timeout does not establish that it stopped writing.

## 3. Review the result independently

The coordinator arranges a different reviewer or fresh agent run and has housekeeping move the task to Review when the candidate and evidence are available. A review request can say:

```text
Review [packet] at candidate revision [SHA] against its acceptance criteria.
Inspect the diff and the actual check evidence. Run the relevant independent
checks you are authorized to run. Report defects, limitations, your identity
and role, the revision reviewed, and the evidence supporting your decision.
```

The executor cannot approve its own output. A separate AI review is an AI review, not another human sign-off. During the development workflow, the coordinator returns failures to Active with specific corrections and checks affected evidence again after the revision changes.

## 4. Authorize release

The housekeeping agent moves the reviewed candidate to Release. The coordinator prepares the concrete release decision:

```text
Prepare [packet] for release. Show the exact revision and target, current
review and CI evidence, release action, and recovery plan. Identify existing
release authorization or the precise decision the human release owner needs
to make. Do not trigger an action outside that authority.
```

The human release owner authorizes the action; valid prior authorization carries forward within its scope. A merge that automatically deploys is a release action. Use the repository's existing release controls.

When a decision is needed, the human owner can reply:

```text
I authorize [exact release action] for [SHA] to [target]. Use the repository's
release controls and return the run URL and outcome. Stop if the candidate,
target, required checks, or authorized scope has changed.
```

## 5. Verify and finish

After an authorized release, the coordinator verifies the result and has housekeeping record it. An explicit verification request can say:

```text
Verify [packet] in [target environment]. Record the release/deploy run,
shipped revision or version, acceptance checks and observed results, and
remaining limitations. Mark Done only when the required evidence is present.
```

The housekeeping agent attaches the diff/PR, reviewed revision, check results, release receipt, and target verification before marking Done and completing the task. It reads the result back before reporting success. A skipped or failed deploy stays unfinished. For work requiring no release, it records why release is not applicable and retains acceptance evidence.

For detailed gates and recovery rules, see the [operating model](OPERATING-MODEL.md) and [security guide](SECURITY.md).
