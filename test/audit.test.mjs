import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest } from '../src/manifest.mjs';
import { auditManifest } from '../src/audit.mjs';

const sha = 'a'.repeat(40), nextSha = 'b'.repeat(40);
const url = 'https://example.invalid/illustrative/evidence';
const time = minute => `2026-09-08T10:${String(minute).padStart(2, '0')}:00Z`;
const event = (kind, minute, fields = {}) => ({ id: `event-${minute}`, at: time(minute), recordedAt: time(minute), kind,
  actor: { id: 'coordinator-run', role: 'coordinator' }, summary: `Illustrative ${kind}`, evidence: [{ label: 'Illustrative only', url }], ...fields });
const history = () => [
  event('authorization', 0, { actor: { id: 'human-owner', role: 'human' }, actions: ['work', 'release'], target: 'preview' }),
  event('scope', 1, { scope: { repo: 'illustrative/repo', include: ['src/'], exclude: ['credentials/'] }, acceptance: ['Illustrative check passes'], requiredChecks: ['unit'], releaseRequired: true }),
  event('worker', 2, { actor: { id: 'worker-run', role: 'worker' }, runId: 'run-1' }),
  event('state', 3, { state: 'active' }),
  event('candidate', 4, { candidate: sha }),
  event('check', 5, { candidate: sha, name: 'unit', result: 'passed' }),
  event('review', 6, { candidate: sha, actor: { id: 'reviewer-run', role: 'reviewer' }, result: 'approved' }),
  event('release', 7, { candidate: sha, target: 'preview', result: 'verified' }),
  event('verification', 8, { candidate: sha, target: 'preview', result: 'passed' }),
  event('closure', 9, { candidate: sha }),
];
const manifest = (events = history()) => ({ schemaVersion: '1.0', name: 'Illustrative audit',
  sections: [{ id: 'intake', name: 'Intake' }], tasks: [{ id: 'example', kind: 'delivery', name: 'Illustrative work',
    owner: 'Human owner', section: 'intake', state: 'intake', instructions: 'An example, not real delivery evidence.',
    metadata: { audit: { schemaVersion: '1.0', events } } }] });
const failure = (events, expected) => assert.match(validateManifest(manifest(events)).join('\n'), expected);

test('candidate-restricted work authorization cannot authorize a different candidate', () => {
  const events = history(); events[0].candidate = nextSha;
  failure(events, /work_authorization/);
  events[0].candidate = sha;
  assert.deepEqual(validateManifest(manifest(events)), []);
});

test('each closure must certify its own current candidate, not inherit a prior closure', () => {
  failure([...history(), event('closure', 11, { candidate: nextSha })], /closure.*current candidate/);
});

test('a new release invalidates earlier verification even at equal timestamps', () => {
  const events = history();
  events.splice(9, 0, event('release', 8, { id: 'release-again', candidate: sha, target: 'preview', result: 'verified' }));
  failure(events, /closure.*verification/);
  events.splice(10, 0, event('verification', 8, { id: 'verify-again', candidate: sha, target: 'preview', result: 'passed' }));
  assert.deepEqual(validateManifest(manifest(events)), []);
});

test('audit reports historical state only from events known by the explicit cutoff', () => {
  const value = manifest();
  assert.deepEqual(validateManifest(value), []);
  const before = auditManifest(value, time(5)).tasks[0];
  assert.equal(before.state, 'active');
  assert.equal(before.candidate, sha);
  assert.ok(before.gaps.includes('review'));
  assert.equal(before.closureVerified, false);
  const after = auditManifest(value, time(10)).tasks[0];
  assert.equal(after.state, 'done');
  assert.equal(after.closureVerified, true);
  assert.deepEqual(after.gaps, []);
  assert.equal(after.events.length, 10);
});

test('late-recorded evidence is absent before its recordedAt time', () => {
  const events = history().slice(0, 6);
  events[5].recordedAt = time(12);
  const before = auditManifest(manifest(events), time(10)).tasks[0];
  assert.ok(before.gaps.includes('check:unit'));
  assert.equal(before.events.length, 5);
  assert.equal(auditManifest(manifest(events), time(13)).tasks[0].checks[0].result, 'passed');
});

test('missing audit stays compatible but does not borrow current state or invent history', () => {
  const value = manifest(); delete value.tasks[0].metadata;
  assert.deepEqual(validateManifest(value), []);
  const record = auditManifest(value, time(20)).tasks[0];
  assert.equal(record.state, 'unknown');
  assert.equal(record.closureVerified, false);
  assert.ok(record.gaps.includes('audit_trail'));
  assert.deepEqual(record.events, []);
});

test('audit rejects invalid dates, duplicates, unsupported fields and bad evidence URLs', () => {
  for (const date of ['2026-02-30T10:00:00Z', 'yesterday', '2026-09-08', '2026-09-08T10:00:00+00:00']) {
    const events = history(); events[0].at = date; failure(events, /timestamp/);
  }
  const duplicate = history(); duplicate[1].id = duplicate[0].id; failure(duplicate, /duplicate event/);
  const badOrder = history(); badOrder[3].recordedAt = time(0); failure(badOrder, /recordedAt|chronolog/);
  const bad = history(); bad[0].evidence[0].url = 'https://user:secret@example.invalid'; failure(bad, /URL/);
  const field = history(); field[1].requiredCheks = ['forgotten']; failure(field, /unknown field/);
  assert.throws(() => auditManifest(manifest(), 'today'), /timestamp/);
});

test('closure rejects stale candidates, failed or skipped required checks and self-review', () => {
  for (const result of ['failed', 'skipped']) {
    const events = history(); events[5].result = result; failure(events, /closure.*check:unit/);
  }
  const stale = history(); stale[5].candidate = nextSha; failure(stale, /closure.*check:unit/);
  const self = history(); self[6].actor.id = ' WORKER-RUN '; failure(self, /independent|self-review/);
  const changed = history(); changed.splice(9, 0, event('candidate', 9, { id: 'new-candidate', candidate: nextSha }));
  changed[10] = event('closure', 10, { candidate: nextSha }); failure(changed, /closure.*check:unit/);
});

test('release closure needs authorization and matching target verification; non-release is explicit', () => {
  const missing = history(); missing[0].actions = ['work']; failure(missing, /closure.*release_authorization/);
  const skipped = history(); skipped[7].result = 'skipped'; failure(skipped, /closure.*release/);
  const wrongTarget = history(); wrongTarget[8].target = 'other'; failure(wrongTarget, /closure.*verification/);
  const noRelease = history().filter(e => e.kind !== 'verification');
  noRelease[1].releaseRequired = false;
  noRelease.find(e => e.kind === 'release').result = 'not_applicable';
  assert.deepEqual(validateManifest(manifest(noRelease)), []);
  assert.equal(auditManifest(manifest(noRelease), time(20)).tasks[0].closureVerified, true);
});

test('new candidate or scope after closure invalidates the prior completion claim', () => {
  const events = [...history(), event('candidate', 11, { candidate: nextSha })];
  const record = auditManifest(manifest(events), time(12)).tasks[0];
  assert.equal(record.closureVerified, false);
  assert.equal(record.state, 'unverified_completion');
  assert.ok(record.gaps.includes('check:unit'));
});

test('a later failed check invalidates completion and opt-in done packets reject stale history', () => {
  const events = [...history(), event('check', 11, { candidate: sha, name: 'unit', result: 'failed' })];
  const value = manifest(events);
  assert.equal(auditManifest(value, time(12)).tasks[0].closureVerified, false);
  Object.assign(value.tasks[0], { section: 'done', state: 'done', outcome: 'Illustrative outcome',
    scope: { repo: 'illustrative/repo', include: ['src/'], exclude: [] }, acceptance: ['A check'], risk: 'low',
    budget: { maxMinutes: 30, maxAttempts: 2 }, run: { executor: 'worker-run' },
    review: { reviewer: 'reviewer-run', decision: 'approved', evidenceUrl: url }, delivery: { status: 'verified', evidenceUrl: url } });
  value.sections.push({ id: 'done', name: 'Done' });
  assert.match(validateManifest(value).join('\n'), /done requires.*closure/);
});

test('review regression: restarting a completed packet clears closure', () => {
  const events = [...history(), event('state', 11, { state: 'active' })];
  const record = auditManifest(manifest(events), time(12)).tasks[0];
  assert.equal(record.state, 'active');
  assert.equal(record.closureVerified, false);
  assert.ok(record.gaps.includes('closure'));
});

test('review regression: release cannot predate its required checks or review', () => {
  const events = history(); events[7].at = '2026-09-08T10:04:30Z';
  failure(events, /closure.*release_readiness/);
});

test('review regression: repeated worker records cannot hide work before authorization', () => {
  const events = history(); events[0].actions = ['release'];
  events.splice(4, 0,
    event('authorization', 3, { id: 'late-work-authority', actor: { id: 'human-owner', role: 'human' }, actions: ['work'] }),
    event('worker', 3, { id: 'worker-repeat', actor: { id: 'worker-run', role: 'worker' }, runId: 'run-2' }));
  failure(events, /closure.*work_authorization/);
});

test('review regression: work approval is recorded from a human and malformed fields fail cleanly', () => {
  const events = history(); events[0].actor.role = 'worker'; failure(events, /closure.*work_authorization/);
  const malformed = history(); malformed[0].actions = {};
  assert.doesNotThrow(() => failure(malformed, /actions/));
  const kind = history(); kind.push(event(['observation'], 11)); failure(kind, /unsupported event kind/);
});

test('audit rejects misspelled scope, oversized lists and ambiguous actor roles', () => {
  const scope = history(); scope[1].scope.exlcude = ['secret/']; failure(scope, /unknown scope field/);
  const excludes = history(); excludes[1].scope.exclude = Array.from({ length: 101 }, (_, i) => `file-${i}`); failure(excludes, /exclusions/);
  const role = history(); role[6].actor.role = 'system'; failure(role, /review.*role/);
  const target = history(); target[0].target = {}; failure(target, /target/);
});

test('blocked, changed review and target mismatches cannot look complete', () => {
  const blocked = [...history(), event('blocker', 11, { nextAction: 'Wait for approved correction.' })];
  const record = auditManifest(manifest(blocked), time(12)).tasks[0];
  assert.equal(record.state, 'blocked'); assert.equal(record.closureVerified, false);
  assert.ok(record.gaps.includes('unresolved_blocker'));
  const rejected = [...history(), event('review', 11, { candidate: sha, actor: { id: 'reviewer-run', role: 'reviewer' }, result: 'changes_requested' })];
  assert.ok(auditManifest(manifest(rejected), time(12)).tasks[0].gaps.includes('review'));
  const target = history(); target[0].target = 'different'; failure(target, /release_authorization/);
});

test('backfilled checks cannot retroactively authorize a release that happened first', () => {
  const events = history(); const check = events.splice(5, 1)[0];
  check.recordedAt = time(8); events.splice(8, 0, check);
  failure(events, /release_readiness/);
});

test('audit event volume has a hard bound and valid large histories stay deterministic', () => {
  const events = Array.from({ length: 1000 }, (_, i) => event('observation', 0, { id: `observation-${i}`, evidence: [] }));
  const value = manifest(events);
  assert.deepEqual(validateManifest(value), []);
  assert.equal(auditManifest(value, time(1)).tasks[0].events.length, 1000);
  assert.equal(JSON.stringify(auditManifest(value, time(1))), JSON.stringify(auditManifest(value, time(1))));
  events.push(event('observation', 1)); failure(events, /at most 1000/);
});
