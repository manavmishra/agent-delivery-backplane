#!/usr/bin/env node
import { lstat, open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { MAX_INPUT_BYTES, assertValid, summarizeManifest, toCsv } from './manifest.mjs';

const usage = 'Usage:\n  adbp validate <manifest.json>\n  adbp summary <manifest.json>\n  adbp export <manifest.json> --csv <output.csv> [--force]';

function parseArgs(args) {
  const [command, input, ...rest] = args;
  if (!['validate', 'summary', 'export'].includes(command) || !input || input.startsWith('--')) throw new Error(usage);
  if (command !== 'export') {
    if (rest.length) throw new Error(usage);
    return { command, input };
  }
  let output, force = false;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--csv' && !output && rest[i + 1] && !rest[i + 1].startsWith('--')) output = rest[++i];
    else if (rest[i] === '--force' && !force) force = true;
    else throw new Error(usage);
  }
  if (!output) throw new Error(usage);
  return { command, input, output, force };
}

async function loadManifest(path) {
  const handle = await open(path, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error('Manifest input must be a regular file');
    if (stat.size > MAX_INPUT_BYTES) throw new Error('Manifest exceeds 1 MiB input limit');
    const buffer = Buffer.alloc(MAX_INPUT_BYTES + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await handle.read(buffer, length, buffer.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > MAX_INPUT_BYTES) throw new Error('Manifest exceeds 1 MiB input limit');
    let manifest;
    try { manifest = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length))); }
    catch { throw new Error('Invalid JSON: input must be a UTF-8 JSON manifest'); }
    return { manifest: assertValid(manifest), stat };
  } finally { await handle.close(); }
}

async function writeCsv(path, text, force, input, inputStat) {
  if (resolve(path) === resolve(input)) throw new Error('CSV output must differ from manifest input');
  let handle;
  try {
    // Also refuse existing symlinks on platforms without O_NOFOLLOW.
    const existing = await lstat(path).catch((error) => { if (error.code === 'ENOENT') return null; throw error; });
    if (existing?.isSymbolicLink()) throw new Error('Refusing symbolic-link CSV output target');
    const flags = constants.O_WRONLY | constants.O_CREAT | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0) | (force ? 0 : constants.O_EXCL);
    handle = await open(path, flags, 0o600);
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error('CSV output must be a regular file');
    if (stat.dev === inputStat.dev && stat.ino === inputStat.ino) throw new Error('CSV output must not refer to manifest input');
    await handle.truncate(0);
    await handle.writeFile(text, 'utf8');
    await handle.sync();
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('CSV output already exists; use --force to overwrite explicitly');
    if (error.code === 'ELOOP') throw new Error('Refusing symbolic-link CSV output target');
    throw error;
  } finally { await handle?.close(); }
}

try {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Agent Delivery Backplane requires Node.js 22 or newer');
  const options = parseArgs(process.argv.slice(2));
  const { manifest, stat } = await loadManifest(options.input);
  if (options.command === 'validate') process.stdout.write(`Valid manifest: ${manifest.tasks.length} task(s)\n`);
  else if (options.command === 'summary') process.stdout.write(`${JSON.stringify(summarizeManifest(manifest), null, 2)}\n`);
  else {
    await writeCsv(options.output, toCsv(manifest), options.force, options.input, stat);
    process.stdout.write(`Exported ${manifest.tasks.length} task(s) to ${options.output}\n`);
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
