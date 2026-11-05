import { completeResponse, scoreActivity } from './model.js';

export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
export const MAX_ATTEMPTS = 20000;
const PORTABLE_BYTES = MAX_BACKUP_BYTES - 1024;
const pendingAttempts = Symbol('pendingAttempts');
export const defaultSettings = { instantCheck: true, explanationLanguage: 'en', textSize: 'normal', reducedMotion: false, sourceLayout: 'side' };
export const progressKey = (subjectId, scopeId) => `study-atlas:v1:${subjectId}:${scopeId}`;
const settingsKey = 'study-atlas:settings:v1';
const bytes = value => new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).length;
const canonical = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const chronological = (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id);

export function normalizeSettings(value = {}) {
  return { instantCheck: value.instantCheck !== false,
    explanationLanguage: typeof value.explanationLanguage === 'string' && /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value.explanationLanguage) ? value.explanationLanguage : 'en',
    textSize: value.textSize === 'large' ? 'large' : 'normal',
    reducedMotion: value.reducedMotion === true,
    sourceLayout: value.sourceLayout === 'full' ? 'full' : 'side' };
}
export function loadSettings(storage) {
  try { return normalizeSettings(JSON.parse(storage.getItem(settingsKey) || '{}')); }
  catch { return { ...defaultSettings }; }
}
export function saveSettings(storage, settings) {
  try { storage.setItem(settingsKey, JSON.stringify(normalizeSettings(settings))); return true; }
  catch { return false; }
}

export function emptyProgress(subjectId, scopeId) {
  return { app: 'Study Atlas', schemaVersion: 1, subjectId, scopeId, generation: 'initial', clearedAt: null,
    historyLimited: false, attempts: [], archivedAttempts: [] };
}

// A reset is a new history generation, not an empty snapshot of the old history.
export function resetProgress(progress, now = Date.now()) {
  const time = Math.max(now, progress.clearedAt ? Date.parse(progress.clearedAt) + 1 : now);
  return { ...emptyProgress(progress.subjectId, progress.scopeId), generation: crypto.randomUUID(), clearedAt: new Date(time).toISOString() };
}

function responseShape(response) {
  const token = v => typeof v === 'string' && v.length > 0 && v.length <= 200;
  if (token(response)) return true;
  if (Array.isArray(response)) return response.length > 0 && response.length <= 100 && response.every(token) && new Set(response).size === response.length;
  return response && typeof response === 'object' && Object.keys(response).length > 0 && Object.keys(response).length <= 100
    && Object.entries(response).every(([key, value]) => token(key) && token(value));
}
function normalizeAttempt(attempt, ids, now) {
  if (!attempt || typeof attempt.id !== 'string' || !/^[\w-]{6,100}$/.test(attempt.id) || ids.has(attempt.id)) throw new Error('The backup contains invalid or repeated attempt IDs.');
  ids.add(attempt.id);
  const time = typeof attempt.at === 'string' ? Date.parse(attempt.at) : NaN;
  if (!Number.isFinite(time) || time < Date.UTC(2000, 0, 1) || time > now + 300000) throw new Error('The backup contains an invalid attempt date.');
  if (typeof attempt.activityId !== 'string' || !attempt.activityId.length || attempt.activityId.length > 200
    || !Number.isInteger(attempt.revision) || attempt.revision < 1
    || !['practice', 'exam', 'drill', 'review'].includes(attempt.mode) || !responseShape(attempt.response)
    || typeof attempt.correct !== 'boolean') throw new Error('The backup contains an invalid attempt or response.');
  return { id: attempt.id, activityId: attempt.activityId, revision: attempt.revision, at: new Date(time).toISOString(), mode: attempt.mode,
    response: structuredClone(attempt.response), correct: attempt.correct };
}
function readEnvelope(text, subjectId, scopeId, now = Date.now()) {
  if (typeof text !== 'string' || bytes(text) > MAX_BACKUP_BYTES) throw new Error('This backup is too large (maximum 8 MB).');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  if (!data || data.app !== 'Study Atlas' || data.schemaVersion !== 1) throw new Error('This is not a supported Study Atlas backup.');
  if (data.subjectId !== subjectId || data.scopeId !== scopeId) throw new Error('This backup belongs to a different subject or scope.');
  if (!Array.isArray(data.attempts) || (data.archivedAttempts !== undefined && !Array.isArray(data.archivedAttempts))
    || data.attempts.length + (data.archivedAttempts?.length || 0) > MAX_ATTEMPTS) throw new Error('The backup has an invalid attempt list.');
  const generation = data.generation ?? 'initial', clearedAt = data.clearedAt ?? null;
  if (typeof generation !== 'string' || !/^[\w-]{1,100}$/.test(generation)
    || (generation === 'initial' ? clearedAt !== null : typeof clearedAt !== 'string' || !Number.isFinite(Date.parse(clearedAt))
      || Date.parse(clearedAt) < Date.UTC(2000, 0, 1) || Date.parse(clearedAt) > now + 300000)) throw new Error('The backup has an invalid history generation.');
  const ids = new Set();
  return { ...emptyProgress(subjectId, scopeId), generation, clearedAt: clearedAt && new Date(clearedAt).toISOString(), historyLimited: data.historyLimited === true,
    attempts: data.attempts.map(a => normalizeAttempt(a, ids, now)), archivedAttempts: (data.archivedAttempts || []).map(a => normalizeAttempt(a, ids, now)) };
}
function verifyCurrent(attempt, activity) {
  if (!completeResponse(activity, attempt.response)) throw new Error('The backup contains an invalid response.');
  if (attempt.correct !== scoreActivity(activity, attempt.response)) throw new Error('A saved score does not match its response. The current progress was not changed.');
}

export function parseBackup(text, subjectId, scopeId, activities, now = Date.now()) {
  const data = readEnvelope(text, subjectId, scopeId, now), bank = new Map(activities.map(a => [a.id, a]));
  for (const attempt of data.attempts) {
    const activity = bank.get(attempt.activityId);
    if (!activity || attempt.revision !== activity.revision) throw new Error('The backup contains an unknown or changed activity. Keep the file for a compatible bank version.');
    verifyCurrent(attempt, activity);
  }
  // archivedAttempts are bounded, structurally checked historical data only. They
  // never enter attempts, so an unverifiable historical score cannot add evidence.
  return data;
}

export function loadProgress(storage, subjectId, scopeId, activities) {
  try {
    const raw = storage.getItem(progressKey(subjectId, scopeId));
    if (!raw) return { progress: emptyProgress(subjectId, scopeId), warning: null };
    const progress = readEnvelope(raw, subjectId, scopeId), bank = new Map(activities.map(a => [a.id, a]));
    let migrated = 0;
    progress.attempts = progress.attempts.filter(attempt => {
      const a = bank.get(attempt.activityId);
      if (!a || a.revision !== attempt.revision) { progress.archivedAttempts.push(attempt); migrated++; return false; }
      verifyCurrent(attempt, a); return true;
    });
    return { progress, warning: migrated ? `${migrated} earlier attempt${migrated === 1 ? ' was' : 's were'} archived after activity-bank changes. Current evidence uses compatible activities; backups retain the archive.` : null };
  } catch (error) {
    return { progress: emptyProgress(subjectId, scopeId), warning: `Saved progress could not be read: ${error.message} You can restore a compatible backup.` };
  }
}

function mergedHistory(existing, incoming) {
  const map = new Map();
  for (const progress of [existing, incoming]) for (const [kind, records] of [['attempts', progress.attempts], ['archivedAttempts', progress.archivedAttempts || []]]) {
    for (const value of records) {
      const previous = map.get(value.id);
      if (previous && canonical(previous.value) !== canonical(value)) throw new Error('Two different attempts share the same ID. The current progress was not changed.');
      // Migration to the inert archive wins over a stale copy of that same attempt.
      map.set(value.id, { value, archived: kind === 'archivedAttempts' || previous?.archived === true });
    }
  }
  const rows = [...map.values()].sort((a, b) => chronological(a.value, b.value));
  return { ...existing, historyLimited: existing.historyLimited || incoming.historyLimited,
    attempts: rows.filter(r => !r.archived).map(r => r.value), archivedAttempts: rows.filter(r => r.archived).map(r => r.value) };
}
function compactHistory(progress) {
  const rows = [...progress.attempts.map(value => ({ value, archived: false })), ...(progress.archivedAttempts || []).map(value => ({ value, archived: true }))]
    .sort((a, b) => chronological(a.value, b.value));
  let start = Math.max(0, rows.length - MAX_ATTEMPTS);
  const build = () => ({ ...progress, historyLimited: progress.historyLimited || start > 0,
    attempts: rows.slice(start).filter(r => !r.archived).map(r => r.value), archivedAttempts: rows.slice(start).filter(r => r.archived).map(r => r.value) });
  let result = build(), length = bytes(result);
  while (length > PORTABLE_BYTES && start < rows.length) {
    // Estimate removals in one pass, then verify the complete envelope again.
    while (length > PORTABLE_BYTES && start < rows.length) length -= bytes(rows[start++].value) + 1;
    result = build(); length = bytes(result);
  }
  return { progress: result, pruned: start };
}
function generationOrder(a, b) {
  return (a.clearedAt ? Date.parse(a.clearedAt) : 0) - (b.clearedAt ? Date.parse(b.clearedAt) : 0) || a.generation.localeCompare(b.generation);
}
function reconcile(latest, incoming, pending = new Map()) {
  const order = generationOrder(incoming, latest);
  if (!order) return mergedHistory(latest, incoming);
  if (order > 0) return incoming;
  // An old tab cannot restore its pre-clear snapshot. Only responses newly
  // appended after the reset (or an explicit user import) may enter the new epoch.
  const retain = a => pending.has(a.id) && (pending.get(a.id) === 'import' || Date.parse(a.at) > Date.parse(latest.clearedAt));
  return mergedHistory(latest, { ...latest, attempts: incoming.attempts.filter(retain), archivedAttempts: incoming.archivedAttempts.filter(retain) });
}

export function saveProgress(storage, progress, activities = null) {
  try {
    const incoming = readEnvelope(JSON.stringify(compactHistory(progress).progress), progress.subjectId, progress.scopeId);
    const raw = storage.getItem(progressKey(progress.subjectId, progress.scopeId));
    const latest = raw ? readEnvelope(raw, progress.subjectId, progress.scopeId) : emptyProgress(progress.subjectId, progress.scopeId);
    let merged = reconcile(latest, incoming, progress[pendingAttempts]);
    if (activities) {
      const bank = new Map(activities.map(a => [a.id, a]));
      merged.attempts = merged.attempts.filter(attempt => {
        const a = bank.get(attempt.activityId);
        if (!a || a.revision !== attempt.revision) { merged.archivedAttempts.push(attempt); return false; }
        verifyCurrent(attempt, a); return true;
      });
    }
    merged = compactHistory(merged).progress;
    storage.setItem(progressKey(progress.subjectId, progress.scopeId), JSON.stringify(merged));
    Object.assign(progress, merged);
    delete progress[pendingAttempts];
    return true;
  } catch { return false; }
}

export function appendAttempt(progress, attempt) {
  const pending = new Map(progress[pendingAttempts]); pending.set(attempt.id, 'response');
  const result = compactHistory({ ...progress, attempts: [...progress.attempts, attempt] });
  result.progress[pendingAttempts] = pending;
  return result;
}

export function mergeProgress(existing, incoming) {
  if (existing.subjectId !== incoming.subjectId || existing.scopeId !== incoming.scopeId) throw new Error('Cannot merge different subjects or scopes.');
  const merged = mergedHistory(existing, incoming);
  if (merged.attempts.length + merged.archivedAttempts.length > MAX_ATTEMPTS) throw new Error('The merged backup exceeds 20,000 attempts. The current progress was not changed.');
  if (bytes(merged) > PORTABLE_BYTES) throw new Error('The merged history exceeds the portable backup limit. The current progress was not changed.');
  // Import is explicit restoration into the current local generation, regardless
  // of which generation the portable file originated from.
  const pending = new Map(existing[pendingAttempts]);
  for (const attempt of [...incoming.attempts, ...(incoming.archivedAttempts || [])]) pending.set(attempt.id, 'import');
  merged[pendingAttempts] = pending;
  return merged;
}

export function createAttempt(activity, response, mode) {
  if (!completeResponse(activity, response)) throw new Error('Complete this activity before scoring.');
  return { id: crypto.randomUUID(), activityId: activity.id, revision: activity.revision,
    at: new Date().toISOString(), mode, response: structuredClone(response), correct: scoreActivity(activity, response) };
}
