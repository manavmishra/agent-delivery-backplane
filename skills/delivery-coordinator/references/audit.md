# Audit contract 1.0 · framework 0.2.0

Keep one private, chronological record per delivery packet. Asana contains the current summary and checkpoint history; GitHub provides revisions, review/check output and release receipts. Do not copy private task exports into a public template or blog.

Record both occurrence time and recording time in explicit UTC. A missing historical time remains unknown: add a present-time observation explaining the gap, not a fabricated approval. Keep actual actors/run IDs, request authority, scoped decisions, handoffs, exact revisions, checks, independent reviews, releases and closure/blockers. A new candidate, reopened task, failed check or changed scope invalidates the affected completion evidence.

For machine-readable reporting, use a checked-out Agent Delivery Backplane version compatible with audit contract1.0. Read its `docs/AUDIT-TRAIL.md` and `schema/audit.schema.json` before constructing events. Initialize new private delivery records with `metadata.audit = {schemaVersion: "1.0", events: []}`. Stable event IDs support deduplication; never truncate history to satisfy an input limit.

Run `node src/cli.mjs audit <private-manifest.json> --as-of <explicit-UTC-cutoff>` from the framework checkout. Save the report with the input digest and framework commit. Report only events whose occurrence and recording times are at or before the cutoff. The CLI is offline: it neither reads nor writes Asana. The housekeeping role reconciles the external task separately.

Exit0 means a report was generated, not that the work passed. Inspect `closureVerified` and `gaps`. Legacy records may legitimately report unknown history. Names and URLs are assertions until checked at their source; the report is not identity authentication, regulatory certification, an immutable ledger, or proof that omitted events never happened.

After uncertain external writes, retain a private pending entry with stable packet/checkpoint ID, intended action, exact target, last observed state, evidence and error. At the next authorized work session, read current state before applying only still-valid changes. Never queue or replay release actions through housekeeping.
