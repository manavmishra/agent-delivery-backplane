// Offline assertions only: no remote evidence, identity or clock is authenticated.
const kinds = {
  authorization: ['actions', 'target', 'candidate'],
  scope: ['scope', 'acceptance', 'requiredChecks', 'releaseRequired'],
  worker: ['runId'], handoff: ['runId', 'to'], candidate: ['candidate'],
  check: ['candidate', 'name', 'result'], review: ['candidate', 'result'],
  release: ['candidate', 'target', 'result'], verification: ['candidate', 'target', 'result'],
  state: ['state'], blocker: ['nextAction'], closure: ['candidate'], observation: [],
};
const states = ['intake', 'ready', 'active', 'review', 'release', 'blocked'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && /\S/u.test(value) && value.length <= 10000;
const identity = value => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
const sha = value => typeof value === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u.test(value);
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(value);
const strings = value => Array.isArray(value) && value.length > 0 && value.length <= 100 && value.every(text) && new Set(value).size === value.length;
const url = value => {
  if (typeof value !== 'string' || !/^https?:\/\//iu.test(value) || /[\s\u0000-\u001f\u007f]/u.test(value)) return false;
  try { const parsed = new URL(value); return Boolean(parsed.hostname) && !parsed.username && !parsed.password; } catch { return false; }
};

export function auditTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value)) throw new Error('Expected an explicit UTC timestamp: YYYY-MM-DDTHH:mm:ss[.sss]Z');
  const milliseconds = Date.parse(value);
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== normalized) throw new Error('Invalid calendar timestamp');
  return milliseconds;
}

function shape(audit, prefix) {
  const errors = [];
  const fail = message => errors.push(`${prefix}: ${message}`);
  if (!object(audit) || audit.schemaVersion !== '1.0' || !Array.isArray(audit.events) || audit.events.length > 1000) return [`${prefix}: audit requires schemaVersion 1.0 and at most 1000 events`];
  for (const key of Object.keys(audit)) if (!['schemaVersion', 'events'].includes(key)) fail(`unknown field ${key}`);
  const ids = new Set();
  let previousRecorded = -Infinity;
  for (const event of audit.events) {
    if (!object(event)) { fail('event must be an object'); continue; }
    if (!id(event.id)) fail('event id must be a stable safe ID');
    if (ids.has(event.id)) fail(`duplicate event id ${event.id}`);
    ids.add(event.id);
    let at, recorded;
    try { at = auditTimestamp(event.at); recorded = auditTimestamp(event.recordedAt); }
    catch (error) { fail(`${event.id}: ${error.message}`); }
    if (at > recorded) fail(`${event.id}: recordedAt precedes occurrence timestamp`);
    if (recorded < previousRecorded) fail(`${event.id}: recordedAt must be in chronological append order`);
    previousRecorded = recorded;
    if (typeof event.kind !== 'string' || !Object.hasOwn(kinds, event.kind)) { fail(`${event.id}: unsupported event kind`); continue; }
    const allowed = ['id', 'at', 'recordedAt', 'kind', 'actor', 'summary', 'evidence', ...kinds[event.kind]];
    for (const key of Object.keys(event)) if (!allowed.includes(key)) fail(`${event.id}: unknown field ${key}`);
    if (!object(event.actor) || !text(event.actor.id) || !['human', 'coordinator', 'worker', 'reviewer', 'system'].includes(event.actor.role)) fail(`${event.id}: actor needs an ID and actual role`);
    else for (const key of Object.keys(event.actor)) if (!['id', 'role'].includes(key)) fail(`${event.id}: unknown actor field ${key}`);
    if (!text(event.summary)) fail(`${event.id}: summary required`);
    if (!Array.isArray(event.evidence) || event.evidence.length > 20) fail(`${event.id}: evidence array required (at most 20 links)`);
    else for (const item of event.evidence) {
      if (!object(item) || !text(item.label) || !url(item.url)) fail(`${event.id}: evidence needs a label and absolute HTTP(S) URL without credentials`);
      else for (const key of Object.keys(item)) if (!['label', 'url'].includes(key)) fail(`${event.id}: unknown evidence field ${key}`);
    }
    if (['candidate', 'check', 'review', 'release', 'verification', 'closure'].includes(event.kind) && !sha(event.candidate)) fail(`${event.id}: candidate must be a full lowercase 40- or 64-character commit SHA`);
    if (event.kind === 'authorization') {
      if (!strings(event.actions) || event.actions.some(action => !['work', 'release'].includes(action))) fail(`${event.id}: actions must contain work and/or release`);
      if (Array.isArray(event.actions) && event.actions.includes('release') && !text(event.target)) fail(`${event.id}: release authorization needs a target`);
      if (event.target !== undefined && !text(event.target)) fail(`${event.id}: authorization target must be text`);
      if (event.candidate !== undefined && !sha(event.candidate)) fail(`${event.id}: invalid authorization candidate`);
    }
    if (event.kind === 'scope') {
      if (!object(event.scope) || !text(event.scope.repo) || !strings(event.scope.include) || !Array.isArray(event.scope.exclude) || event.scope.exclude.length > 100 || !event.scope.exclude.every(text)) fail(`${event.id}: scope needs repository, includes and explicit exclusions (at most 100 each)`);
      if (object(event.scope)) for (const key of Object.keys(event.scope)) if (!['repo', 'include', 'exclude'].includes(key)) fail(`${event.id}: unknown scope field ${key}`);
      if (!strings(event.acceptance) || !strings(event.requiredChecks) || typeof event.releaseRequired !== 'boolean') fail(`${event.id}: acceptance, requiredChecks and releaseRequired are required`);
    }
    if (['worker', 'handoff'].includes(event.kind) && !text(event.runId)) fail(`${event.id}: actual runId required`);
    if (event.kind === 'handoff' && !text(event.to)) fail(`${event.id}: handoff destination required`);
    if (event.kind === 'check' && !text(event.name)) fail(`${event.id}: named check required`);
    if (event.kind === 'review' && !['human', 'reviewer'].includes(event.actor?.role)) fail(`${event.id}: review actor role must be human or reviewer`);
    const results = { check: ['passed', 'failed', 'skipped'], review: ['approved', 'changes_requested'], release: ['verified', 'failed', 'skipped', 'not_applicable'], verification: ['passed', 'failed', 'skipped'] };
    if (results[event.kind] && !results[event.kind].includes(event.result)) fail(`${event.id}: invalid result`);
    if (['release', 'verification'].includes(event.kind) && !text(event.target)) fail(`${event.id}: target required`);
    if (event.kind === 'state' && !states.includes(event.state)) fail(`${event.id}: state must be intake/ready/active/review/release/blocked; use closure for done`);
    if (event.kind === 'blocker' && !text(event.nextAction)) fail(`${event.id}: blocker nextAction required`);
  }
  return errors;
}

function replay(events) {
  let state = 'unknown', candidate = null, scope = null, review = null, release = null, verification = null, closure = null, blocker = null;
  let releaseReady = false;
  const checks = new Map(), workers = [], authorizations = [];
  const evidence = event => Boolean(event?.evidence.length);
  const sorted = [...events].sort((a, b) => auditTimestamp(a.at) - auditTimestamp(b.at) || auditTimestamp(a.recordedAt) - auditTimestamp(b.recordedAt));
  for (const event of sorted) {
    if (event.kind === 'authorization') authorizations.push(event);
    if (event.kind === 'scope' || event.kind === 'candidate') {
      checks.clear(); review = release = verification = closure = null; releaseReady = false;
      if (event.kind === 'scope') scope = event; else candidate = event.candidate;
    }
    if (event.kind === 'worker') workers.push(event);
    if (event.kind === 'state') { state = event.state; blocker = null; closure = null; }
    if (event.kind === 'blocker') { state = 'blocked'; blocker = event; closure = null; }
    if (event.candidate === candidate) {
      if (event.kind === 'check') checks.set(event.name, event);
      if (event.kind === 'review') review = event;
      if (event.kind === 'release') {
        verification = null;
        const knownBeforeRelease = item => evidence(item) && auditTimestamp(item.at) <= auditTimestamp(event.at) && auditTimestamp(item.recordedAt) <= auditTimestamp(event.recordedAt);
        releaseReady = Boolean(scope && review?.result === 'approved' && knownBeforeRelease(review) &&
          scope.requiredChecks.every(name => checks.get(name)?.result === 'passed' && knownBeforeRelease(checks.get(name))));
        release = event;
      }
      if (event.kind === 'verification') verification = event;
      if (event.kind === 'closure') { closure = event; if (state !== 'blocked') state = 'done'; }
    }
  }
  const gaps = [];
  if (!authorizations.some(event => event.actor.role === 'human' && event.actions.includes('work') && (!event.candidate || event.candidate === candidate) && evidence(event) && (!workers.length || auditTimestamp(event.at) <= Math.min(...workers.map(worker => auditTimestamp(worker.at)))))) gaps.push('work_authorization');
  if (!scope || !evidence(scope)) gaps.push('scope');
  if (!workers.length) gaps.push('workers');
  if (!candidate) gaps.push('candidate');
  for (const name of scope?.requiredChecks ?? []) if (checks.get(name)?.result !== 'passed' || !evidence(checks.get(name))) gaps.push(`check:${name}`);
  if (!review || review.result !== 'approved' || !evidence(review) || workers.some(worker => identity(worker.actor.id) === identity(review.actor.id))) gaps.push('review');
  if (!release || !evidence(release) || (scope?.releaseRequired ? release.result !== 'verified' : release.result !== 'not_applicable')) gaps.push('release');
  if (scope?.releaseRequired) {
    if (release?.result === 'verified' && !releaseReady) gaps.push('release_readiness');
    if (!authorizations.some(event => event.actor.role === 'human' && event.actions.includes('release') && event.target === release?.target && (!event.candidate || event.candidate === candidate) && evidence(event) && auditTimestamp(event.at) <= auditTimestamp(release.at))) gaps.push('release_authorization');
    if (!verification || verification.result !== 'passed' || !evidence(verification) || verification.target !== release?.target || (release && auditTimestamp(verification.at) < auditTimestamp(release.at))) gaps.push('verification');
  }
  if (blocker || state === 'blocked') gaps.push('unresolved_blocker');
  const closureVerified = Boolean(state === 'done' && closure && evidence(closure) && gaps.length === 0);
  if (!closure || !evidence(closure)) gaps.push('closure');
  if (state === 'done' && !closureVerified) state = 'unverified_completion';
  return { state, candidate, closureVerified, gaps, scope, workers, handoffs: sorted.filter(event => event.kind === 'handoff'),
    checks: [...checks.values()], review, release, verification, blocker, events: sorted };
}

export function validateAudit(audit, prefix = 'audit', requireClosure = false) {
  const errors = shape(audit, prefix);
  if (errors.length) return errors;
  const known = [];
  for (const event of audit.events) {
    known.push(event);
    if (event.kind === 'review' && known.some(previous => previous.kind === 'worker' && identity(previous.actor.id) === identity(event.actor.id))) errors.push(`${prefix}.${event.id}: independent review cannot be self-review`);
    if (event.kind === 'closure') {
      const record = replay(known.filter(previous => auditTimestamp(previous.at) <= auditTimestamp(event.at)));
      if (record.candidate !== event.candidate) errors.push(`${prefix}.${event.id}: closure must match the current candidate`);
      if (!record.closureVerified) errors.push(`${prefix}.${event.id}: closure missing ${record.gaps.join(', ') || 'current candidate'}`);
    }
  }
  if (requireClosure) {
    const record = replay(audit.events);
    if (!record.closureVerified) errors.push(`${prefix}: done requires a current valid closure; missing ${record.gaps.join(', ')}`);
  }
  return errors;
}

export function auditManifest(manifest, asOf) {
  const cutoff = auditTimestamp(asOf);
  const tasks = manifest.tasks.filter(task => task.kind === 'delivery').map(task => {
    const audit = task.metadata?.audit;
    if (!audit) return { id: task.id, state: 'unknown', candidate: null, closureVerified: false, gaps: ['audit_trail'], events: [] };
    const errors = validateAudit(audit, task.id);
    if (errors.length) throw new Error(errors.join('\n'));
    const events = audit.events.filter(event => auditTimestamp(event.at) <= cutoff && auditTimestamp(event.recordedAt) <= cutoff);
    return { id: task.id, ...replay(events) };
  });
  return { schemaVersion: '1.0', asOf, basis: 'Recorded local assertions known by cutoff; remote evidence and identities are not authenticated.', tasks };
}
