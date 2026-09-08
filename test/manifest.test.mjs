import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest, summarizeManifest, toCsv } from '../src/manifest.mjs';

const task = (overrides = {}) => ({
  id: 'fix-1', name: 'Fix a regression', section: 'ready', kind: 'delivery',
  owner: 'Manav', instructions: 'Inspect the failing case before editing.', state: 'ready',
  outcome: 'The regression case returns the documented result.',
  scope: { repo: 'owner/repo', include: ['src/'], exclude: ['credentials/'] },
  acceptance: ['Regression test passes'], risk: 'low', dependsOn: [], evidence: [],
  budget: { maxMinutes: 30, maxAttempts: 2 }, ...overrides,
  section: overrides.section ?? overrides.state ?? 'ready',
});
const manifest = (tasks = [task()]) => ({
  schemaVersion: '1.0', name: 'Delivery board', sections: ['intake', 'ready', 'active', 'review', 'release', 'done', 'blocked'].map((id) => ({ id, name: id[0].toUpperCase() + id.slice(1) })), tasks,
});
const reference = () => task({ kind: 'reference', state: 'intake' });
const done = (overrides = {}) => task({
  state: 'done', run: { executor: 'Coding assistant', runId: 'run-1', branch: 'feature/fix' },
  review: { reviewer: 'Manav', decision: 'approved', evidenceUrl: 'https://example.org/review/1' },
  delivery: { status: 'verified', evidenceUrl: 'https://example.org/releases/1' }, ...overrides,
});
const fails = (value, text) => assert.match(validateManifest(value).join('\n'), text);

test('minimal reference and ready delivery packets validate', () => {
  const minimal = { id: 'guide', name: 'Read me', kind: 'reference', section: 'ready', owner: 'Manav', instructions: 'Read the workflow.', state: 'intake' };
  assert.deepEqual(validateManifest(manifest([minimal, task()])), []);
  assert.deepEqual(validateManifest(manifest([done()])), []);
});

test('schema versions, structural fields, IDs and sections are checked', () => {
  fails({ ...manifest(), schemaVersion: '2.0' }, /schemaVersion/);
  fails({ ...manifest(), nmae: 'typo' }, /nmae.*unknown/);
  fails(manifest([task({ scope: { repo: 'r', include: ['src'], excude: [] } })]), /excude.*unknown/);
  fails(manifest([task({ id: '../unsafe' })]), /id/);
  fails(manifest([task(), task()]), /duplicate task id/);
  fails({ ...manifest(), sections: [{ id: 'ready', name: 'A' }, { id: 'ready', name: 'B' }] }, /duplicate section id/);
  fails(manifest([task({ section: 'missing' })]), /unknown section/);
});

test('section placement cannot visually bypass state gates in a CSV board', () => {
  fails(manifest([task({ state: 'intake', section: 'done' })]), /section.*match.*state/);
  const duplicated = manifest(); duplicated.sections.push({ id: 'other', name: ' READY ' });
  fails(duplicated, /duplicate section name/);
  const mislabeled = manifest(); mislabeled.sections.find((s) => s.id === 'intake').name = 'Done';
  fails(mislabeled, /reserved.*Done|reserved.*done/);
  const custom = manifest(); custom.sections.find((s) => s.id === 'ready').name = 'Prepared work';
  assert.deepEqual(validateManifest(custom), []);
});

test('metadata is extensible while malformed JSON-shaped data remains bounded', () => {
  const value = manifest([task({ metadata: { project: { label: 'v1' } } })]);
  value.metadata = { source: 'local' };
  assert.deepEqual(validateManifest(value), []);
  fails(manifest([task({ name: ' '.repeat(3) })]), /non-whitespace/);
  fails(manifest([task({ budget: { maxMinutes: 0, maxAttempts: 1.5 } })]), /maxMinutes|integer/);
  fails(manifest(Array.from({ length: 1001 }, (_, i) => task({ id: `task-${i}` }))), /1000/);
  let nested = {};
  for (let i = 0; i < 25; i++) nested = { child: nested };
  fails({ ...manifest(), metadata: nested }, /depth/);
});

test('readiness fields must have meaningful content and explicit scope', () => {
  for (const key of ['outcome', 'scope', 'acceptance', 'risk', 'budget']) {
    const value = task(); delete value[key];
    fails(manifest([value]), new RegExp(key));
  }
  fails(manifest([task({ acceptance: [] })]), /acceptance/);
  fails(manifest([task({ scope: { repo: 'repo', include: [], exclude: [] } })]), /include/);
  fails(manifest([task({ outcome: '  ' })]), /non-whitespace/);
  fails(manifest([reference(), task({ id: 'ref2', kind: 'reference', state: 'active' })]), /reference.*intake/);
});

test('dependencies detect missing IDs, self-links, cycles and reference links', () => {
  fails(manifest([task({ dependsOn: ['unknown'] })]), /unknown dependency/);
  fails(manifest([task({ dependsOn: ['fix-1'] })]), /itself|cycle/);
  fails(manifest([task({ dependsOn: ['b'] }), task({ id: 'b', dependsOn: ['fix-1'] })]), /cycle/);
  fails(manifest([reference(), task({ id: 'b', dependsOn: ['fix-1'] })]), /reference.*dependency|dependency.*reference/);
  fails(manifest([task({ dependsOn: ['b', 'b'] }), task({ id: 'b' })]), /duplicate dependency/);
});

test('execution requires completed prerequisites and high risk signoff', () => {
  fails(manifest([task({ id: 'first' }), task({ dependsOn: ['first'] })]), /dependency.*done/);
  for (const state of ['active', 'review', 'release', 'done']) {
    fails(manifest([task({ id: 'first' }), done({ state, dependsOn: ['first'] })]), /dependency.*done/);
    fails(manifest([done({ state, risk: 'high' })]), /approvedBy/);
  }
  assert.deepEqual(validateManifest(manifest([done({ id: 'first' }), task({ state: 'active', risk: 'high', approvedBy: 'Manav', dependsOn: ['first'] })])), []);
});

test('done requires independently named review and delivery evidence', () => {
  fails(manifest([task({ state: 'done' })]), /run.executor/);
  fails(manifest([done({ review: { reviewer: 'coding ASSISTANT', decision: 'approved', evidenceUrl: 'https://example.org/review' } })]), /reviewer.*executor/);
  fails(manifest([done({ review: { reviewer: 'Manav', decision: 'changes_requested', evidenceUrl: 'https://example.org/review' } })]), /approved review/);
  const noDelivery = done(); delete noDelivery.delivery;
  fails(manifest([noDelivery]), /delivery/);
  assert.deepEqual(validateManifest(manifest([done({ delivery: { status: 'not_applicable', evidenceUrl: 'https://example.org/reviewed-document' } })])), []);
});

test('blocking, owner email and evidence URLs are validated', () => {
  fails(manifest([task({ state: 'blocked' })]), /blocked.reason/);
  fails(manifest([task({ state: 'blocked', blocked: { reason: 'Tests fail' } })]), /nextAction/);
  assert.deepEqual(validateManifest(manifest([task({ state: 'blocked', blocked: { reason: 'Tests fail', nextAction: 'Inspect the log' } })])), []);
  for (const url of ['javascript:alert(1)', '/relative', 'https://user:pass@example.org/']) {
    fails(manifest([task({ evidence: [{ label: 'Proof', url }] })]), /URL/);
  }
  fails(manifest([task({ ownerEmail: 'not an email' })]), /email/);
});

test('CSV uses standard columns, stable IDs, explicit reference labels and safe cells', () => {
  const value = manifest([task({ name: ' =SUM(1,2)', instructions: 'Line one, "quoted"\nLine two' }), reference()]);
  value.tasks[1].id = 'reference';
  const csv = toCsv(value);
  assert.ok(csv.startsWith('Name,Description,Section,Assignee\r\n'));
  assert.match(csv, /' =SUM\(1,2\)/);
  assert.match(csv, /\[ADBP:fix-1\]/);
  assert.match(csv, /REFERENCE ONLY/);
  assert.match(csv, /""quoted""/);
  assert.match(csv, /Owner: Manav/);
  assert.ok(csv.endsWith(',""\r\n'));
  for (const prefix of ['=', '+', '-', '@', '\t=', '\r@']) {
    const injected = toCsv(manifest([task({ name: `${prefix}formula` })]));
    assert.match(injected.split('\r\n')[1], /^"'/);
  }
  assert.match(toCsv(manifest([task({ ownerEmail: 'owner@example.org' })])), /"owner@example.org"\r\n$/);
});

test('summary separates references, delivery states and blockers without productivity claims', () => {
  const value = manifest([reference(), task({ id: 'b', state: 'blocked', blocked: { reason: 'Missing fixture', nextAction: 'Add fixture' } }), done({ id: 'c' })]);
  const summary = summarizeManifest(value);
  assert.equal(summary.references, 1);
  assert.equal(summary.delivery, 2);
  assert.equal(summary.states.done, 1);
  assert.equal(summary.states.blocked, 1);
  assert.equal(summary.states.intake, 0);
  assert.deepEqual(summary.blocked, [{ id: 'b', name: 'Fix a regression', reason: 'Missing fixture', nextAction: 'Add fixture' }]);
});
