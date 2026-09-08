import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditManifest } from '../src/audit.mjs';
import { validateManifest, toCsv } from '../src/manifest.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

test('documented example covers active, supported closure and reopened blocked work', () => {
  const value = read('../examples/audit-trail.json');
  assert.equal(value.metadata.exampleOnly, true);
  assert.deepEqual(validateManifest(value), []);
  const records = ['05', '10', '18'].map(minute => auditManifest(value, `2026-01-01T10:${minute}:00Z`).tasks[0]);
  assert.deepEqual(records.map(record => record.state), ['active', 'done', 'blocked']);
  assert.deepEqual(records.map(record => record.closureVerified), [false, true, false]);
  assert.ok(records[2].handoffs.length > 0);
  for (const event of records[2].events) for (const evidence of event.evidence) assert.equal(new URL(evidence.url).hostname, 'example.invalid');
});

test('audit structural schema documents every example event with exact fields', () => {
  const schema = read('../schema/audit.schema.json');
  assert.equal(schema.$id, 'urn:agent-delivery-backplane:audit:1.0');
  for (const event of read('../examples/audit-trail.json').tasks[0].metadata.audit.events) {
    const rule = schema.$defs[event.kind];
    assert.equal(rule.properties.kind.const, event.kind);
    assert.equal(rule.additionalProperties, false);
    for (const name of rule.required) assert.ok(Object.hasOwn(event, name));
    for (const name of Object.keys(event)) assert.ok(Object.hasOwn(rule.properties, name));
  }
});

test('community template explains audit history without fabricating completed runs', () => {
  const value = read('../templates/project.json');
  assert.deepEqual(validateManifest(value), []);
  assert.ok(value.tasks.every(task => task.kind === 'reference' && !task.metadata?.audit));
  const task = value.tasks.find(task => task.id === 'TASK-TEMPLATE');
  assert.match(task.instructions, /AUDIT TRAIL/);
  assert.match(task.instructions, /recording time/);
  assert.match(toCsv(value), /AUDIT TRAIL/);
});

test('scope payload resolves to repository fields instead of recursively requiring an event', () => {
  const schema = read('../schema/audit.schema.json');
  const ref = schema.$defs.scope.properties.scope.$ref;
  const payload = schema.$defs[ref.split('/').at(-1)];
  assert.deepEqual(payload.required, ['repo', 'include', 'exclude']);
  assert.equal(payload.additionalProperties, false);
  const example = read('../examples/audit-trail.json').tasks[0].metadata.audit.events.find(e => e.kind === 'scope').scope;
  for (const name of payload.required) assert.ok(Object.hasOwn(example, name));
  for (const name of Object.keys(example)) assert.ok(Object.hasOwn(payload.properties, name));
  assert.equal(payload.properties.include.minItems, 1);
  assert.equal(payload.properties.exclude.maxItems, 100);
});
