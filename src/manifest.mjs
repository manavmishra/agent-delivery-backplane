import { readFileSync } from 'node:fs';

const schema = JSON.parse(readFileSync(new URL('../schema/manifest.schema.json', import.meta.url), 'utf8'));
export const MAX_INPUT_BYTES = 1024 * 1024;
const states = ['intake', 'ready', 'active', 'review', 'release', 'done', 'blocked'];
const readyStates = new Set(['ready', 'active', 'review', 'release', 'done']);
const executionStates = new Set(['active', 'review', 'release', 'done']);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const identity = (v) => v.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

function boundedJson(value) {
  const pending = [{ value, depth: 0 }];
  let count = 0;
  while (pending.length) {
    const item = pending.pop();
    if (++count > 50000) return 'manifest exceeds 50000 JSON nodes';
    if (item.depth > 20) return 'manifest exceeds maximum JSON depth 20';
    const current = item.value;
    if (typeof current === 'string' && current.length > 10000) return 'manifest string exceeds 10000 characters';
    if (current !== null && typeof current === 'object') {
      for (const child of Object.values(current)) pending.push({ value: child, depth: item.depth + 1 });
    } else if (!['string', 'boolean', 'number'].includes(typeof current) && current !== null) {
      return 'manifest must contain only JSON values';
    } else if (typeof current === 'number' && !Number.isFinite(current)) return 'manifest number must be finite';
  }
  return null;
}

function validUrl(value) {
  if (value !== value.trim() || /[\s\u0000-\u001f\u007f]/u.test(value) || !/^https?:\/\//iu.test(value)) return false;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

// Only the JSON Schema keywords used by the bundled structural schema are
// interpreted here. Semantic workflow gates below are intentionally explicit.
function checkShape(rule, value, path, errors) {
  if (rule.$ref) return checkShape(schema.$defs[rule.$ref.split('/').at(-1)], value, path, errors);
  const matches = rule.type === 'object' ? isObject(value)
    : rule.type === 'array' ? Array.isArray(value)
      : rule.type === 'integer' ? Number.isInteger(value)
        : typeof value === rule.type;
  if (!matches) { errors.push(`${path}: expected ${rule.type}`); return; }
  if (rule.enum && !rule.enum.includes(value)) errors.push(`${path}: expected one of ${rule.enum.join(', ')}`);
  if (rule.type === 'object') {
    for (const required of rule.required ?? []) if (!Object.hasOwn(value, required)) errors.push(`${path}.${required}: required`);
    for (const [key, child] of Object.entries(value)) {
      if (Object.hasOwn(rule.properties ?? {}, key)) checkShape(rule.properties[key], child, `${path}.${key}`, errors);
      else if (rule.additionalProperties === false) errors.push(`${path}.${key}: unknown field; use metadata for extensions`);
    }
  } else if (rule.type === 'array') {
    if (rule.minItems !== undefined && value.length < rule.minItems) errors.push(`${path}: needs at least ${rule.minItems} item(s)`);
    if (rule.maxItems !== undefined && value.length > rule.maxItems) errors.push(`${path}: exceeds ${rule.maxItems} items`);
    for (let i = 0; i < Math.min(value.length, rule.maxItems ?? 1000); i++) checkShape(rule.items, value[i], `${path}[${i}]`, errors);
  } else if (rule.type === 'string') {
    if (rule.maxLength !== undefined && [...value].length > rule.maxLength) errors.push(`${path}: exceeds ${rule.maxLength} characters`);
    if (rule.pattern && !new RegExp(rule.pattern, 'u').test(value)) errors.push(`${path}: invalid format (must contain non-whitespace text and match ${rule.pattern})`);
    if (rule.format === 'http-url' && !validUrl(value)) errors.push(`${path}: expected absolute HTTP(S) URL without credentials or whitespace`);
    if (rule.format === 'email' && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/u.test(value)) errors.push(`${path}: expected one email address`);
  } else if (rule.type === 'integer') {
    if (value < rule.minimum || value > rule.maximum) errors.push(`${path}: expected integer from ${rule.minimum} to ${rule.maximum}`);
  }
}

export function validateManifest(value) {
  const boundError = boundedJson(value);
  if (boundError) return [boundError];
  const errors = [];
  checkShape(schema, value, 'manifest', errors);
  if (errors.length) return errors;
  const sections = new Set();
  const sectionNames = new Set();
  for (const section of value.sections) {
    if (sections.has(section.id)) errors.push(`duplicate section id: ${section.id}`);
    const normalizedName = identity(section.name);
    if (sectionNames.has(normalizedName)) errors.push(`duplicate section name: ${section.name}`);
    if (states.includes(normalizedName) && normalizedName !== section.id) errors.push(`${section.id}: reserved lifecycle name ${section.name} must match its canonical section id`);
    sections.add(section.id);
    sectionNames.add(normalizedName);
  }
  const tasks = new Map();
  for (const task of value.tasks) {
    if (tasks.has(task.id)) errors.push(`duplicate task id: ${task.id}`);
    tasks.set(task.id, task);
    if (!sections.has(task.section)) errors.push(`${task.id}: unknown section ${task.section}`);
  }
  for (const task of value.tasks) {
    const dependencies = new Set();
    for (const id of task.dependsOn ?? []) {
      if (dependencies.has(id)) errors.push(`${task.id}: duplicate dependency ${id}`);
      dependencies.add(id);
      const dependency = tasks.get(id);
      if (!dependency) errors.push(`${task.id}: unknown dependency ${id}`);
      else if (dependency.kind === 'reference') errors.push(`${task.id}: reference task ${id} cannot be a dependency`);
      else if (readyStates.has(task.state) && dependency.state !== 'done') errors.push(`${task.id}: dependency ${id} must be done before ${task.state}`);
      if (id === task.id) errors.push(`${task.id}: task cannot depend on itself`);
    }
    if (task.kind === 'reference') {
      if (task.state !== 'intake') errors.push(`${task.id}: reference task state must be intake`);
      if (dependencies.size) errors.push(`${task.id}: reference task cannot have delivery dependencies`);
      continue;
    }
    if (task.section !== task.state) errors.push(`${task.id}: delivery section must match state (${task.state})`);
    if (readyStates.has(task.state)) {
      for (const field of ['outcome', 'scope', 'acceptance', 'risk', 'budget']) if (!Object.hasOwn(task, field)) errors.push(`${task.id}: ${field} required in ${task.state}`);
    }
    if (executionStates.has(task.state) && task.risk === 'high' && !task.approvedBy) errors.push(`${task.id}: approvedBy required for high-risk ${task.state}`);
    if (task.state === 'blocked' && !task.blocked) errors.push(`${task.id}: blocked.reason and blocked.nextAction required`);
    if (task.state === 'done') {
      if (!task.run?.executor) errors.push(`${task.id}: run.executor required for done`);
      if (task.review?.decision !== 'approved') errors.push(`${task.id}: done requires approved review and review evidence`);
      if (task.run?.executor && task.review?.reviewer && identity(task.run.executor) === identity(task.review.reviewer)) errors.push(`${task.id}: reviewer must differ from run executor`);
      if (!task.delivery) errors.push(`${task.id}: done requires delivery status and evidence URL`);
    }
  }
  const colors = new Map();
  function visit(id, trail) {
    if (colors.get(id) === 2) return;
    if (colors.get(id) === 1) { errors.push(`dependency cycle: ${[...trail.slice(trail.indexOf(id)), id].join(' -> ')}`); return; }
    colors.set(id, 1);
    for (const dependency of tasks.get(id)?.dependsOn ?? []) if (tasks.has(dependency)) visit(dependency, [...trail, id]);
    colors.set(id, 2);
  }
  for (const id of tasks.keys()) visit(id, []);
  return errors;
}

export function assertValid(value) {
  const errors = validateManifest(value);
  if (errors.length) throw new Error(`Manifest is invalid:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  return value;
}

export function summarizeManifest(value) {
  assertValid(value);
  const delivery = value.tasks.filter((task) => task.kind === 'delivery');
  const counts = Object.fromEntries(states.map((state) => [state, 0]));
  for (const task of delivery) counts[task.state]++;
  return {
    name: value.name, total: value.tasks.length,
    references: value.tasks.length - delivery.length, delivery: delivery.length, states: counts,
    blocked: delivery.filter((task) => task.state === 'blocked').map((task) => ({ id: task.id, name: task.name, reason: task.blocked.reason, nextAction: task.blocked.nextAction })),
  };
}

function description(task) {
  const lines = [`[ADBP:${task.id}]`, task.kind === 'reference' ? 'REFERENCE ONLY — workflow instructions, not active delivery work.' : 'DELIVERY WORK PACKET', `Owner: ${task.owner}`, `State: ${task.state}`, `Instructions: ${task.instructions}`];
  if (task.outcome) lines.push(`Outcome: ${task.outcome}`);
  if (task.scope) lines.push(`Repository: ${task.scope.repo}`, `Include: ${task.scope.include.join(', ')}`, `Exclude: ${task.scope.exclude.join(', ') || '(none recorded)'}`);
  if (task.acceptance) lines.push('Acceptance:', ...task.acceptance.map((item) => `- ${item}`));
  if (task.risk) lines.push(`Risk: ${task.risk}`);
  if (task.approvedBy) lines.push(`High-risk approval recorded by: ${task.approvedBy}`);
  if (task.budget) lines.push(`Budget: ${task.budget.maxMinutes} minutes; ${task.budget.maxAttempts} attempts`);
  if (task.dependsOn?.length) lines.push(`Requires completed delivery tasks: ${task.dependsOn.map((id) => `[ADBP:${id}]`).join(', ')}`);
  for (const item of task.evidence ?? []) lines.push(`Evidence — ${item.label}: ${item.url}`);
  if (task.run) lines.push(`Run executor: ${task.run.executor}`, ...(task.run.runId ? [`Run ID: ${task.run.runId}`] : []), ...(task.run.branch ? [`Branch: ${task.run.branch}`] : []));
  if (task.review) lines.push(`Review: ${task.review.decision} by ${task.review.reviewer}`, `Review evidence: ${task.review.evidenceUrl}`);
  if (task.delivery) lines.push(`Delivery: ${task.delivery.status}`, `Delivery evidence: ${task.delivery.evidenceUrl}`);
  if (task.blocked) lines.push(`Blocked: ${task.blocked.reason}`, `Next action: ${task.blocked.nextAction}`);
  if (task.metadata) lines.push(`Metadata: ${JSON.stringify(task.metadata)}`);
  return lines.join('\n');
}

function csvCell(value) {
  const safe = /^[\s\u0000-\u001f\u007f-\u009f]*[=+\-@]/u.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/gu, '""')}"`;
}

export function toCsv(value) {
  assertValid(value);
  const sections = new Map(value.sections.map((section) => [section.id, section.name]));
  const rows = value.tasks.map((task) => [task.name, description(task), sections.get(task.section), task.ownerEmail ?? ''].map(csvCell).join(','));
  return `Name,Description,Section,Assignee\r\n${rows.length ? `${rows.join('\r\n')}\r\n` : ''}`;
}
