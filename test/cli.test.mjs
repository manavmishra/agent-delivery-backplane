import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, symlink, link, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../src/cli.mjs', import.meta.url));
const fixture = { schemaVersion: '1.0', name: 'Guide', sections: [{ id: 'guide', name: 'Guide' }], tasks: [{ id: 'read', kind: 'reference', name: 'Read first', section: 'guide', owner: 'Manav', instructions: 'Read README.', state: 'intake' }] };
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
const sandbox = async (t) => { const dir = await mkdtemp(join(tmpdir(), 'adbp-test-')); t.after(() => rm(dir, { recursive: true, force: true })); return dir; };

test('CLI validates, summarizes and exports without needing network or credentials', async (t) => {
  const dir = await sandbox(t), input = join(dir, 'manifest.json'), output = join(dir, 'board.csv');
  await writeFile(input, JSON.stringify(fixture));
  assert.equal(run('validate', input).status, 0);
  const summary = run('summary', input);
  assert.equal(summary.status, 0);
  assert.equal(JSON.parse(summary.stdout).references, 1);
  assert.equal(run('export', input, '--csv', output).status, 0);
  assert.match(await readFile(output, 'utf8'), /\[ADBP:read\]/);
  const conflict = run('export', input, '--csv', output);
  assert.equal(conflict.status, 1);
  assert.match(conflict.stderr, /already exists/);
  assert.equal(run('export', input, '--csv', output, '--force').status, 0);
});

test('CLI rejects invalid args, invalid data and oversized files cleanly', async (t) => {
  const dir = await sandbox(t), input = join(dir, 'invalid.json');
  for (const args of [[], ['execute'], ['export', 'missing'], ['summary', 'missing', '--force'], ['validate', 'missing', '--unknown']]) {
    const result = run(...args); assert.equal(result.status, 1); assert.doesNotMatch(result.stderr, /at file:/);
  }
  await writeFile(input, '{');
  assert.match(run('validate', input).stderr, /Invalid JSON/);
  await writeFile(input, JSON.stringify({ ...fixture, schemaVersion: '9.9' }));
  assert.match(run('validate', input).stderr, /schemaVersion/);
  await writeFile(input, ' '.repeat(1024 * 1024 + 1));
  assert.match(run('validate', input).stderr, /1 MiB/);
  await mkdir(join(dir, 'folder'));
  assert.match(run('validate', join(dir, 'folder')).stderr, /regular file/);
});

test('export protects input files and refuses symlink targets even with force', async (t) => {
  const dir = await sandbox(t), input = join(dir, 'manifest.json'), symbolic = join(dir, 'link.csv'), hard = join(dir, 'hard.csv');
  const text = JSON.stringify(fixture); await writeFile(input, text); await symlink(input, symbolic); await link(input, hard);
  assert.equal(run('export', input, '--csv', input, '--force').status, 1);
  assert.equal(run('export', input, '--csv', symbolic, '--force').status, 1);
  assert.equal(run('export', input, '--csv', hard, '--force').status, 1);
  assert.equal(await readFile(input, 'utf8'), text);
});

test('failed validation never touches an existing forced output', async (t) => {
  const dir = await sandbox(t), input = join(dir, 'manifest.json'), output = join(dir, 'board.csv');
  await writeFile(input, JSON.stringify({ ...fixture, schemaVersion: 'unsupported' }));
  await writeFile(output, 'keep this exact content');
  assert.equal(run('export', input, '--csv', output, '--force').status, 1);
  assert.equal(await readFile(output, 'utf8'), 'keep this exact content');
});

test('audit requires an explicit cutoff and writes only a report to stdout', async (t) => {
  const dir = await sandbox(t), input = join(dir, 'manifest.json');
  const value = { ...fixture, tasks: [{ ...fixture.tasks[0], kind: 'delivery', section: 'intake', metadata: { audit: { schemaVersion: '1.0', events: [] } } }], sections: [{ id: 'intake', name: 'Intake' }] };
  const text = JSON.stringify(value); await writeFile(input, text);
  assert.equal(run('audit', input).status, 1);
  assert.equal(run('audit', input, '--as-of', 'now').status, 1);
  const result = run('audit', input, '--as-of', '2026-09-08T10:00:00Z');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).tasks[0].state, 'unknown');
  assert.equal(await readFile(input, 'utf8'), text);
});
