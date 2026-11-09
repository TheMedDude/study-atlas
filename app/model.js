export const EVIDENCE_LABELS = {
  untested: 'Untested', limited: 'Limited evidence', inconsistent: 'Inconsistent results', consistent: 'Consistent performance',
};

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function completeResponse(activity, response) {
  if (activity.type === 'mcq' || activity.type === 'diagram') return activity.options.some(o => o.id === response);
  if (activity.type === 'match') {
    return response && typeof response === 'object' && !Array.isArray(response)
      && Object.keys(response).length === activity.pairs.length
      && activity.pairs.every(p => activity.pairs.some(q => q.id === response[p.id]))
      && new Set(Object.values(response)).size === activity.pairs.length;
  }
  if (activity.type === 'order') {
    return Array.isArray(response) && response.length === activity.items.length
      && new Set(response).size === activity.items.length
      && response.every(id => activity.items.some(i => i.id === id));
  }
  return false;
}

export function scoreActivity(activity, response) {
  if (!completeResponse(activity, response)) return false;
  if (activity.type === 'mcq' || activity.type === 'diagram') return response === activity.correctOptionId;
  if (activity.type === 'match') return activity.pairs.every(pair => response[pair.id] === pair.id);
  const ranks = new Map(activity.acceptedGroups.flatMap((group, rank) => group.map(id => [id, rank])));
  return response.every((id, i) => i === 0 || ranks.get(response[i - 1]) <= ranks.get(id));
}

export function currentAttempts(attempts, activities) {
  const bank = activities instanceof Map ? activities : new Map(activities.map(a => [a.id, a]));
  const ids = new Set();
  return attempts.filter(attempt => {
    const a = bank.get(attempt.activityId);
    if (!a || a.revision !== attempt.revision || ids.has(attempt.id)) return false;
    ids.add(attempt.id);
    return true;
  });
}

export function conceptEvidence(conceptId, attempts, activities) {
  const bank = activities instanceof Map ? activities : new Map(activities.map(a => [a.id, a]));
  const latest = new Map();
  for (const attempt of currentAttempts(attempts, bank)) {
    if (!bank.get(attempt.activityId).conceptIds.includes(conceptId)) continue;
    const previous = latest.get(attempt.activityId);
    if (!previous || attempt.at > previous.at) latest.set(attempt.activityId, attempt);
  }
  const items = [...latest.values()].sort((a, b) => b.at.localeCompare(a.at));
  const distinct = items.length;
  const correct = items.filter(a => a.correct).length;
  const accuracy = distinct ? correct / distinct : null;
  const recentError = items.slice(0, 3).some(a => !a.correct);
  const state = !distinct ? 'untested' : distinct < 3 ? 'limited'
    : accuracy >= 0.8 && !recentError ? 'consistent' : 'inconsistent';
  return { state, distinct, correct, accuracy, recentError, latest: items[0] ?? null };
}

export function progressSummary(concepts, attempts, activities) {
  const bank = new Map(activities.map(a => [a.id, a]));
  const evidence = new Map(concepts.map(c => [c.id, conceptEvidence(c.id, attempts, bank)]));
  const counts = { untested: 0, limited: 0, inconsistent: 0, consistent: 0 };
  for (const value of evidence.values()) counts[value.state]++;
  const available = new Set(activities.flatMap(a => a.conceptIds));
  return { counts, evidence, total: concepts.length, encountered: concepts.length - counts.untested,
    available: concepts.filter(c => available.has(c.id)).length };
}

export function selectActivities(activities, concepts, attempts, options = {}) {
  const { types = ['mcq'], lectureIds = [], conceptIds = [], excludeIds = [], count = 10, random = Math.random, bankFilter = 'all' } = options;
  const summary = progressSummary(concepts, attempts, activities);
  const core = new Set(concepts.filter(c => c.priority === 'core').map(c => c.id));
  const excluded = new Set(excludeIds);
  let candidates = activities.filter(a => a.status === 'validated' && types.includes(a.type)
    && (!lectureIds.length || lectureIds.includes(a.lectureId))
    && (!conceptIds.length || a.conceptIds.some(c => conceptIds.includes(c))) && !excluded.has(a.id));
  const currentAtts = currentAttempts(attempts, activities);
  const seen = new Set(currentAtts.map(a => a.activityId));
  const latestByActivity = new Map();
  for (const att of currentAtts) {
    const prev = latestByActivity.get(att.activityId);
    if (!prev || att.at > prev.at) latestByActivity.set(att.activityId, att);
  }
  const missedIds = new Set([...latestByActivity.values()].filter(att => !att.correct).map(att => att.activityId));

  if (bankFilter === 'unpracticed') {
    candidates = candidates.filter(a => !seen.has(a.id));
  } else if (bankFilter === 'missed') {
    candidates = candidates.filter(a => missedIds.has(a.id));
  } else if (bankFilter === 'practiced') {
    candidates = candidates.filter(a => seen.has(a.id));
  }

  const latestPenalty = a => a.conceptIds.some(id => summary.evidence.get(id)?.latest?.activityId === a.id
    && candidates.some(other => other.id !== a.id && other.conceptIds.includes(id))) ? 40 : 0;
  const base = new Map(candidates.map(a => [a.id, Math.max(...a.conceptIds.map(id => {
    const e = summary.evidence.get(id);
    return (!e || !e.distinct ? 60 : e.recentError ? 100 : e.state === 'limited' ? 35 : e.state === 'inconsistent' ? 65 : 5)
      + (core.has(id) ? 5 : 0);
  })) + random() * 12 - (seen.has(a.id) ? 15 : 0) - latestPenalty(a)]));
  const chosen = [], uses = new Map();
  const limit = Math.max(0, Math.min(Math.floor(Number(count) || 0), candidates.length));
  while (chosen.length < limit) {
    candidates.sort((a, b) => {
      const score = x => base.get(x.id) - x.conceptIds.reduce((n, id) => n + (uses.get(id) || 0) * 32, 0) / x.conceptIds.length;
      return score(b) - score(a);
    });
    const next = candidates.shift();
    chosen.push(next);
    for (const id of next.conceptIds) uses.set(id, (uses.get(id) || 0) + 1);
  }
  return chosen;
}

export function examResult(items, responses) {
  return items.map(a => ({ activity: a, response: responses[a.id] ?? null,
    answered: completeResponse(a, responses[a.id]), correct: scoreActivity(a, responses[a.id]) }));
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
