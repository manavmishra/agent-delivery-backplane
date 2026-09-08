# Research and limits

Reviewed through September 8, 2026. The framework combines established delivery practices with published agent-engineering experience. No cited study tests Agent Delivery Backplane or establishes that an Asana board improves productivity.

## Evidence that informs the design

| Source and evidence type | Useful finding | Limit |
| --- | --- | --- |
| [DORA capability model](https://dora.dev/ai/capabilities-model/questions/), 2025; survey-based research | Versioned artifacts, small batches, usable organizational context, and other working conditions feature in its model of effective AI adoption. | Associations and reported outcomes do not establish the causal value of our board or worker limits. |
| [METR developer study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), July 2025; randomized experiment | Sixteen experienced contributors completing 246 tasks in familiar repositories took 19% longer when allowed early-2025 AI tools, despite believing they had gained speed. | A specific population, task set, and tool generation; not a universal or current slowdown estimate. |
| [METR follow-up](https://metr.org/blog/2026-02-24-uplift-update/), February 2026; experiment with important limitations | Participant/task selection and concurrent-agent time measurement made newer results unreliable as an estimate of current impact. | It is not a clean reversal of the earlier result or a precise new productivity estimate. |
| [METR technical-worker survey](https://metr.org/blog/2026-05-11-ai-usage-survey/), May 2026; convenience-sample survey | Among 349 respondents, median reported value gains ranged from 1.4–2× across measures. Reported speed and value were different. | These are beliefs, not experimentally verified multipliers. |
| [Anthropic long-running harness](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), November 2025; vendor engineering | Incremental work, persisted handoffs, git history, and user-path testing helped address incomplete sessions and premature completion. | One implementation, with model-specific choices. |
| [Anthropic application harness](https://www.anthropic.com/engineering/harness-design-long-running-apps), March 2026; vendor demonstrations | Explicit contracts and a separate evaluator supported iterative implementation and application testing. | Model reviewers still need calibration; examples used unequal scope, time, and spend. |
| [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), June 2025; vendor production report and internal evaluation | Parallel workers suit separable research; detailed delegation and effort budgets matter. | Its research-evaluation gains do not measure coding productivity. Tightly coupled work is a poorer fit. |
| [Anthropic managed-agent architecture](https://www.anthropic.com/engineering/managed-agents), April 2026; vendor infrastructure report | Durable session records and replaceable execution components support recovery. | Writing a progress comment does not provide equivalent infrastructure guarantees. |
| [OpenAI harness engineering](https://openai.com/index/harness-engineering/), February 2026; vendor case study | Inspectable application behavior, worktree isolation, repository context, and enforced checks supported agent work. | The estimated development-time gain is a vendor counterfactual, not a controlled comparison. |
| [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1), July 2024; voluntary guidance | Define oversight, retain verification history, and scale evaluation and recovery to risk. | Does not prescribe this lifecycle or certify it. |
| [OWASP agentic risks](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), December 2025; security guidance | Task content, privileges, tool use, shared memory, and cascading failures need controls. | A taxonomy and mitigations are not evidence of implemented security. |
| [OWASP Agent Control Standard](https://genai.owasp.org/resource/agent-control-standard-acs/), September 2026; new standard announcement | Runtime hooks and declarative action controls distinguish enforcement from written instructions. | Announcement-level review only; no adoption, maturity, or compatibility claim. |

## Our recommendations

The seven sections, packet format, one active parent, three-worker ceiling, 30-minute starting timebox, and two-attempt starting limit are design choices. They are configurable and must be tested against the team's work. Independent review and release evidence make progress inspectable; their exact productivity effect here is unknown.

Use a baseline and compare similarly scoped accepted outcomes. Record elapsed delivery time, human active and review time, review queue age, rework, failed changes, recovery time, and spend. Retain task type, risk, model/tool version, and concurrency so comparisons remain interpretable. Check whether the intended user problem was solved after release.

Small samples can improve a local process without supporting a broad causal claim. Do not equate agents with engineers, closed tasks with shipped value, PR volume with quality, or vendor demonstrations with independent productivity experiments. This project makes no claim of being state of the art, proven at enterprise scale, certified, or compatible with an unimplemented standard.
