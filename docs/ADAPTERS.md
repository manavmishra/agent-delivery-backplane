# Optional adapter contract

This is a specification for future integrations. It does not announce a deployed scheduler, webhook receiver, autonomous runner, or synchronization service. The baseline works with manual dispatch and links; local validation does not execute the workflow.

## Responsibilities

| Component | Owns |
| --- | --- |
| Asana adapter | Resolve project/task IDs; read current state; present scope, ownership, decisions, and evidence; reconcile approved board changes. |
| Coordinator | Validate readiness and authority; serialize claims and state updates; allocate budgets; reject stale results. |
| Agent adapter | Accept a bounded packet; execute through an authorized harness; return artifacts, actual checks, usage, and limitations. |
| GitHub/release adapter | Read candidate, review, CI, and release evidence; perform only specifically authorized writes through existing repository controls. |

Keep agents replaceable. A packet and its receipts must survive replacement of the model, tool provider, or worker process. A vendor-specific agent name is metadata, not the lifecycle state.

## Minimal exchange

Use stable IDs and validated structured data. A conceptual request carries `packet_id`, `attempt_id`, `coordinator_revision`, repository, base revision, scope, allowed actions, acceptance checks, budget, and artifact location. A result carries the same IDs, candidate revision, check receipts, actual usage or an explicit unknown value, limitations, and the next proposed state.

A result proposes progress; it does not approve its own promotion. Verify evidence and revision freshness before accepting it. Do not interpolate task text into a shell or treat a tool result as executable policy.

## Required before autonomous production use

1. **Shared ownership.** Use a single coordinator writer and durable atomic compare-and-swap on claims. Fence stale workers with a monotonic revision/token at result acceptance and protected side-effect boundaries. Multiple coordinators need one shared authority, not independent local databases.
2. **Durable identity.** Persist packet, attempt, operation, and provider IDs before issuing side effects. Preserve receipts across crashes. Scope every mapping to the intended account and project.
3. **Safe retries.** Use provider-supported idempotency where available. Otherwise reconcile ambiguous outcomes before retrying; quarantine uncertainty when safe deduplication cannot be established. A retry cannot silently widen authority.
4. **Fresh state.** Treat events as hints to read current state. Reconcile periodically or explicitly so missing events cannot strand work. Reject stale candidates and recheck authority immediately before a consequential action.
5. **Bounded execution.** Enforce time, attempt, spend, and concurrency ceilings outside model instructions. Expose an operator stop path and preserve enough evidence to resume safely.

Test duplicate and missing events, timeouts after successful writes, restarts, expired claims, late worker results, stale approvals, and budget exhaustion. An Asana assignee or status update is not an atomic lease.

## Asana-specific constraints

REST and MCP are separate interfaces with different authorization. Use a deliberately configured credential; keep tokens out of task records and logs. For a reusable multi-user application, prefer [Asana's OAuth flow](https://developers.asana.com/docs/oauth). Discover the current [MCP tool schemas](https://developers.asana.com/docs/mcp-tools-reference) when using MCP; do not assume REST credentials and MCP credentials are interchangeable.

Do not assume ordinary task creation accepts a generic idempotency key. Maintain stable manifest IDs and an explicit mapping to Asana GIDs. After an uncertain creation, inspect the scoped project for the stable marker before another create. CSV import adds tasks and can duplicate them when repeated; it is not synchronization. See [task creation](https://developers.asana.com/reference/createtask) and [CSV preparation](https://help.asana.com/s/article/preparing-data-for-csv-import?language=en_US).

Respect `429` and `Retry-After`, paginate, request only necessary fields, and bound retries. An optional webhook receiver must verify signatures over the raw body, acknowledge after durable enqueue, and reconcile current resource state. Delivery is not a complete replayable history. Follow [rate limits](https://developers.asana.com/docs/rate-limits) and the [webhook guide](https://developers.asana.com/docs/webhooks-guide).

This workflow uses only free features. Do not use paid custom fields, Rules, native dependencies, or GitHub widgets. API availability does not establish plan entitlement. The adapter must work with ordinary descriptions and links or report the precise missing capability.
