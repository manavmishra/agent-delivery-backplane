# Agent Delivery Backplane

A small Asana workflow for people who ship software with AI agents.

Give each piece of work an owner, a bounded scope, and a way to prove it is finished. Use Asana for coordination, GitHub for code and release evidence, and your existing assistant to run agents.

**Free Asana compatible. No hosted service, model API, or runtime dependencies required.** This is a workflow kit and local validator, not an unattended agent scheduler. Your assistant's normal usage limits and charges still apply.

## Start without code

1. Download [the template CSV](outputs/project.csv). In Asana, create a **new project → Import → CSV**. Map `Name`, `Description`, `Section`, and `Assignee` to the matching fields. Do not create custom fields.
2. Open **Start here · five-minute setup**. Follow the short setup guide. The reference cards are templates to duplicate, not delivery work.
3. Add the empty sections in this order: **Intake, Ready, Active, Review, Release, Done, Blocked**. CSV can only create sections that contain rows. Use List for daily work or Board to see the flow.
4. Duplicate **Copy me · delivery task** into Intake. Give the copy a new packet ID and title, remove its `REFERENCE ONLY` label and template instructions, and fill in the outcome, owner, scope, acceptance checks and budget. Keep the original reference card unchanged. Move the copy to Ready when someone can act without guessing.
5. Ask your connected assistant to take that task. It should confirm the repository and authority, delegate bounded work, and return evidence for review. Nothing runs merely because a card moved.

Import once into a new project. **Reimporting a CSV creates duplicates; it does not synchronize changes.** Keep the reference project unchanged and duplicate cards into your live project, or import a fresh copy for another project. This workflow uses only free Asana features, including for its reusable master project.

Current Asana Personal supports two people; eligible legacy accounts have different limits. Agents are named in task descriptions, not added as seats. Check the account's actual allowance before adding people. This kit does not require trial-only Rules, custom fields, dependencies, or AI Teammates. [Plan details](https://help.asana.com/s/article/asana-personal-plan-details?language=en_US).

## The daily loop

```text
Intake → Ready → Active → Review → Release → Done
                       ↘ Blocked → next safe step
```

Choose one outcome. Split only independent work. Record the executor and checkpoint. Have someone other than the executor review the result. Verify any authorized release before marking the task complete.

Start with one active outcome, up to three workers on disjoint scopes, and a 30-minute/two-attempt limit. Adjust after measuring review effort and accepted results. These are suggested limits; the kit does not enforce runner time or spending.

For a solo project, the human owner can review agent work. A fresh AI reviewer can help, but its output is not a second human approval. Separate worktrees prevent shared-branch writes; they do not remove the need to inspect overlapping files before integration.

## Optional local checks

Requires Node.js 22 or later. No package installation is needed.

```sh
git clone https://github.com/manavmishra/agent-delivery-backplane.git
cd agent-delivery-backplane
node src/cli.mjs validate templates/project.json
node src/cli.mjs summary examples/zero-slop.json
node src/cli.mjs export templates/project.json --csv my-project.csv
npm test
```

The validator checks structure, prerequisite cycles, required packet fields, and completion evidence. It can reject a recorded self-review; it cannot prove a reviewer is independent, authenticate a test result, or enforce Asana transitions. GitHub checks and human review remain necessary. CSV export needs no Asana credentials and does not contact Asana; it does not detect secrets in task text.

The versioned JSON format is the portable work contract. When copying a reference record in JSON, assign a new unique `id`, set `kind` to `delivery`, select the `intake` section/state, and replace the reference instructions with the actual work packet. Complete the required fields before moving it to `ready`, then validate the file. Extra data goes in `metadata`; unsupported schema versions fail explicitly. See [the schema](schema/manifest.schema.json) and [the Zero Slop example](examples/zero-slop.json).

## Choose the guide you need

| I want to… | Read |
| --- | --- |
| Run today's work with copyable prompts | [Quickstart](docs/QUICKSTART.md) |
| Let the assistant maintain the board during development | [Asana housekeeping](docs/ASANA-HOUSEKEEPING.md) |
| Understand the lifecycle and handoffs | [Operating model](docs/OPERATING-MODEL.md) |
| Coordinate Zero Slop's repositories | [Zero Slop profile](docs/ZERO-SLOP.md) |
| Connect an assistant or plan automation | [Adapters](docs/ADAPTERS.md) |
| Understand permissions and recovery | [Security](docs/SECURITY.md) |
| Check what has been tested | [Acceptance checks](docs/ACCEPTANCE.md) |
| Inspect the evidence behind the design | [Research and limits](docs/RESEARCH.md) |
| Consider optional assistant skills | [Skills proposal](docs/SKILLS-PROPOSAL.md) |
| Share or adapt the community templates | [Community distribution](docs/COMMUNITY.md) |

The connector supplies access; the work packet supplies context. Neither grants permission to publish, spend money, change access, or run untrusted commands. An autonomous adapter needs authenticated events, durable ownership, deduplication, reconciliation, and enforced budgets before production use. Those adapters are not implemented here.

## Contribute

Keep the basic path usable on free Asana. Include a failing test for validator changes. Do not add model-specific behavior, a hosted dependency, or an automatic publisher to the baseline. Discuss changes to the work contract before changing its schema version.

MIT licensed. Not affiliated with or endorsed by Asana, GitHub, or an AI provider.
