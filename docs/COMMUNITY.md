# Share the templates with the community

Use the [GitHub repository](https://github.com/manavmishra/agent-delivery-backplane) as the canonical entry point, with downloadable CSV files for Asana users and versioned JSON for people extending the workflow. This is the recommended free distribution path for this kit: readers can take their own copy without joining the operator's Asana workspace or running a hosted service.

## What to share

| Item | Purpose | Source in this repository |
| --- | --- | --- |
| Generic template CSV | Import the reference cards into a new Asana project | [project.csv](../outputs/project.csv) |
| Editable template JSON | Adapt the packet definitions and regenerate the CSV | [project.json](../templates/project.json) |
| JSON schema and local validator | Check structure and the recorded workflow gates | [Schema](../schema/manifest.schema.json), [CLI instructions](../README.md#optional-local-checks) |
| Quickstart | Start one outcome, delegate bounded work, review it and record delivery | [Quickstart](QUICKSTART.md) |
| Worked example | Show how the same packet format applies to Zero Slop | [Example JSON](../examples/zero-slop.json), [example CSV](../outputs/zero-slop.csv) |
| License | State the terms for copying and adapting the kit | [MIT license](../LICENSE) |
| Changelog | Explain what changed and whether an existing copy needs manual updates | Include a short changelog in each release's notes |

The generic CSV should be the main download. The Zero Slop files are examples to adapt, not instructions to operate Zero Slop's repositories or accounts. Preserve the license notice when redistributing the kit.

For a release, attach the tested CSV, JSON and schema files to the matching GitHub version, alongside the quickstart and license. Keep their content consistent with that tagged revision. GitHub releases can include downloadable files and notes, and GitHub supplies source archives for the tag. [GitHub release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

Link an announcement to a particular released version so a reader can reproduce its instructions. Use the repository link for ongoing development. Release notes should distinguish fixes, changed packet rules, and migration steps. A new release does not update Asana projects that people previously imported.

This document describes the distribution method; it does not certify that a tag, release attachment or announcement has been published. Confirm each public link before announcing it.

## How a community member gets started

1. Download the generic CSV from the selected release, or from this repository while evaluating the current source.
2. In their own Asana account, create a **new project** and import the CSV. Map `Name`, `Description`, `Section` and `Assignee` to the matching fields; custom fields are unnecessary.
3. Review the imported reference cards. Add the empty lifecycle sections manually: **Intake, Ready, Active, Review, Release, Done, Blocked**. The generic CSV contains reference-card rows, not placeholder delivery tasks for those empty sections.
4. Follow [the quickstart](QUICKSTART.md), copy one delivery card, give it a new packet ID and write the actual outcome, scope, owner, acceptance checks and budget.
5. Use their existing assistant to work on the authorized task. Review the result before recording completion.

**Import once into a fresh project.** Asana's CSV importer adds tasks; it does not update existing tasks. Reimporting a new template version into a live project can create duplicates. Review the release changelog and make deliberate updates to an existing project, or start a separate project from the new version. [Asana CSV import guidance](https://help.asana.com/s/article/preparing-data-for-csv-import?language=en_US).

The baseline uses ordinary sections, task descriptions, comments and links. It requires no paid Asana automation, native dependencies, custom fields or AI Teammates. Each reader should check their own account's current plan and seat allowance. Their assistant's normal usage limits and charges still apply.

## Keep the Asana master for internal reuse

The master in Asana is an ordinary reference project. People who already have appropriate access can duplicate its project or cards for internal reuse. Community distribution uses the downloadable files; it does not require a public live board, workspace invitation, or access to active work.

Do not describe a native template's `public` flag as an internet-wide installation mechanism. Asana defines that flag as visibility to the template's team. It does not establish a one-click copy into an unrelated organization. [Asana project-template reference](https://developers.asana.com/reference/project-templates).

Keep private task history, emails, workspace/project identifiers, credentials and private repository links out of community examples. CSV export does not automatically remove sensitive content. Review the files intended for publication, rather than exporting the live delivery queue wholesale.

## Announce the workflow with an honest example

Use [the announcement draft](blog-draft.md) to explain the problem, the handoff model and its limits. Link the published announcement to the repository, the selected release download and the quickstart. Keep the research links in the article so readers can distinguish source evidence from the kit's proposed operating choices. See [research and limits](RESEARCH.md).

A screenshot of the generic board or a short import-to-first-task GIF could help later. These are optional additions, not media supplied by this guide. Capture a clean demonstration project, remove private account details, and show only behavior that actually works. Do not imply that moving a card launches an agent or that a workflow diagram proves a productivity gain.

Accept improvement reports through the repository's available contribution channels. A useful report includes the template version, the failing step, expected and observed behavior, and a sanitized example. Keep account credentials and private work out of public reports.

## Optional housekeeping during development

The operator can add this instruction to the development session they are already running:

```text
Before ending this session, compare the selected delivery tasks with the
actual revisions, run results and review evidence. Report stale status,
missing evidence, unresolved blockers and each next action. Update only
the task records covered by this work request. Preserve reference cards.
Do not start another worker, publish, change access or schedule a monitor
as part of this housekeeping step.
```

The repository's `CLAUDE.md` instructs the coordinator to perform this housekeeping during authorized development sessions. It is not a daemon, installed scheduler or recurring automation. If live Asana access is unavailable, the agent preserves a private pending handoff, reports pending synchronization, and reconciles in a later authorized session after access returns. The user need not paste updates manually. See [Asana housekeeping](ASANA-HOUSEKEEPING.md). Creating a recurring monitor or an automated adapter would be a separate request with its own implementation and authorization.
