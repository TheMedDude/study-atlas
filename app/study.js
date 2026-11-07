import { completeResponse, scoreActivity } from './model.js';

export const MAX_SAVED_SESSIONS = 10;
export const studyKey = (subjectId, scopeId) => `study-atlas:study:v1:${subjectId}:${scopeId}`;
const MAX_STUDY_BYTES = 1024 * 1024;
const encode = value => JSON.stringify(value);
const canonical = value => JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const bytes = value => new TextEncoder().encode(encode(value)).length;
const token = value => typeof value === 'string' && /^[\w-]{1,200}$/.test(value);
const date = (value, now) => typeof value === 'string' && Number.isFinite(Date.parse(value)) && Date.parse(value) >= Date.UTC(2000,0,1) && Date.parse(value) <= now + 300000;
export const emptyStudy = (subjectId, scopeId) => ({ schemaVersion:1, subjectId, scopeId, bookmarks:[], sessions:[] });

export function validateStudy(value, subjectId, scopeId, now = Date.now()) {
  if (!value || value.schemaVersion !== 1 || value.subjectId !== subjectId || value.scopeId !== scopeId
    || !Array.isArray(value.bookmarks) || !Array.isArray(value.sessions) || value.bookmarks.length > 5000 || value.sessions.length > 2000 || bytes(value) > MAX_STUDY_BYTES) throw new Error('The saved questions or practice sessions are invalid or too large.');
  const bookmarks = new Set(), sessions = new Set();
  for (const b of value.bookmarks) {
    if (!token(b.activityId) || bookmarks.has(b.activityId) || typeof b.saved !== 'boolean' || !date(b.updatedAt, now)) throw new Error('Invalid saved-question record.');
    bookmarks.add(b.activityId);
  }
  for (const s of value.sessions) {
    if (!token(s.id) || sessions.has(s.id) || typeof s.deleted !== 'boolean' || !date(s.updatedAt,now)) throw new Error('Invalid saved-session record.');
    sessions.add(s.id);
    if (s.deleted) continue;
    if (!['practice','drills','review'].includes(s.mode) || !token(s.generation) || !date(s.createdAt,now)
      || !Array.isArray(s.items) || !s.items.length || s.items.length > 2000 || new Set(s.items.map(a=>a.id)).size !== s.items.length
      || !s.items.every(a=>token(a.id) && Number.isInteger(a.revision) && a.revision>0)
      || !Number.isInteger(s.index) || s.index<0 || s.index>=s.items.length || !Number.isFinite(s.elapsedMs) || s.elapsedMs<0 || s.elapsedMs>31536000000
      || !Array.isArray(s.recorded) || !Array.isArray(s.skipped) || !s.orders || !s.responses || !s.attemptIds
      || Array.isArray(s.orders) || Array.isArray(s.responses) || Array.isArray(s.attemptIds)) throw new Error('Invalid practice-session contents.');
    const ids = new Set(s.items.map(a=>a.id));
    for (const list of [s.recorded,s.skipped]) if (new Set(list).size!==list.length || !list.every(id=>ids.has(id))) throw new Error('Invalid session question list.');
    for (const map of [s.orders,s.responses,s.attemptIds]) if (Object.keys(map).some(id=>!ids.has(id))) throw new Error('Invalid session response key.');
    for (const id of ids) {
      if (!token(s.attemptIds[id]) || !Array.isArray(s.orders[id]) || !s.orders[id].length || s.orders[id].length>100 || new Set(s.orders[id]).size!==s.orders[id].length || !s.orders[id].every(token)) throw new Error('Invalid saved answer order.');
      const r=s.responses[id];
      if (r!==undefined && !(token(r) || Array.isArray(r) && r.length<=100 && r.every(token) || r && typeof r==='object' && !Array.isArray(r) && Object.keys(r).length<=100 && Object.entries(r).every(([k,v])=>token(k)&&token(v)))) throw new Error('Invalid saved response.');
    }
    if(s.checkedAttempts!==undefined && (!Array.isArray(s.checkedAttempts)||s.checkedAttempts.length>s.items.length||new Set(s.checkedAttempts.map(a=>a.id)).size!==s.checkedAttempts.length||s.checkedAttempts.some(a=>!token(a.id)||!ids.has(a.activityId)||s.attemptIds[a.activityId]!==a.id||!date(a.at,now)||typeof a.correct!=='boolean'||!Number.isInteger(a.revision)||a.revision<1||!['practice','drill','review'].includes(a.mode))))throw new Error('Invalid checked answers in saved session.');
  }
  if (value.sessions.filter(s=>!s.deleted).length>MAX_SAVED_SESSIONS) throw new Error(`Keep at most ${MAX_SAVED_SESSIONS} unfinished practice sessions; finish or remove one first.`);
  return structuredClone(value);
}

export function mergeStudy(a,b) {
  if(a.subjectId!==b.subjectId || a.scopeId!==b.scopeId)throw new Error('Cannot merge study data from different subjects.');
  const merge=(left,right,key,terminal=false)=>{
    const map=new Map();
    for(const r of [...left,...right]){const old=map.get(r[key]);if(terminal&&old?.deleted&&!r.deleted)continue;if(!old || terminal&&r.deleted&&!old.deleted || r.updatedAt>old.updatedAt || r.updatedAt===old.updatedAt && encode(r)>encode(old))map.set(r[key],r);}
    return [...map.values()].sort((x,y)=>x[key].localeCompare(y[key]));
  };
  return {...a,bookmarks:merge(a.bookmarks,b.bookmarks,'activityId'),sessions:merge(a.sessions,b.sessions,'id',true)};
}
export function loadStudy(storage,subjectId,scopeId) {
  try { const raw=storage.getItem(studyKey(subjectId,scopeId));return {study:raw?validateStudy(JSON.parse(raw),subjectId,scopeId):emptyStudy(subjectId,scopeId),warning:null}; }
  catch { return {study:emptyStudy(subjectId,scopeId),warning:'Saved questions or sessions could not be read. The stored copy has not been overwritten; keep a backup.'}; }
}
export function saveStudy(storage,study) {
  try {
    const own=validateStudy(study,study.subjectId,study.scopeId),raw=storage.getItem(studyKey(study.subjectId,study.scopeId));
    const latest=raw?validateStudy(JSON.parse(raw),study.subjectId,study.scopeId):emptyStudy(study.subjectId,study.scopeId);
    const merged=validateStudy(mergeStudy(latest,own),study.subjectId,study.scopeId);
    storage.setItem(studyKey(study.subjectId,study.scopeId),encode(merged));Object.assign(study,merged);return true;
  }catch{return false;}
}
function stamp(study,now) {
  const last=Math.max(0,...study.bookmarks.map(b=>Date.parse(b.updatedAt)),...study.sessions.map(s=>Date.parse(s.updatedAt)));
  return new Date(Math.max(now,last+1)).toISOString();
}
export function bookmark(study,activityId,saved,now=Date.now()) {
  const next=structuredClone(study),updatedAt=stamp(study,now);
  next.bookmarks=next.bookmarks.filter(b=>b.activityId!==activityId);next.bookmarks.push({activityId,saved,updatedAt});validateStudy(next,next.subjectId,next.scopeId,now);return next;
}
export function elapsedSession(session,now=Date.now()) {
  return session.elapsedMs+(session.runningSince===null?0:Math.max(0,now-session.runningSince));
}
export function storeSession(study,session,now=Date.now()) {
  if(study.sessions.some(s=>s.id===session.id&&s.deleted)&&!session.done)throw new Error('This session was finished or removed in another tab.');
  const next=structuredClone(study),snapshot={id:session.id,deleted:session.done===true,updatedAt:stamp(study,now)};
  if(!snapshot.deleted)Object.assign(snapshot,{mode:session.mode,generation:session.generation,createdAt:session.createdAt,
    items:session.items.map(a=>({id:a.id,revision:a.revision})),index:session.index,responses:structuredClone(session.responses),orders:structuredClone(session.orders),
    recorded:[...session.recorded],skipped:[...session.skipped],attemptIds:{...session.attemptIds},checkedAttempts:structuredClone(session.checkedAttempts||[]),elapsedMs:elapsedSession(session,now)});
  next.sessions=next.sessions.filter(s=>s.id!==snapshot.id);next.sessions.push(snapshot);
  validateStudy(next,next.subjectId,next.scopeId,now);return next;
}
export function removeSession(study,id,now=Date.now()) {
  const next=structuredClone(study);next.sessions=next.sessions.filter(s=>s.id!==id);next.sessions.push({id,deleted:true,updatedAt:stamp(study,now)});return next;
}
export function restoreSession(snapshot,activities,progress,now=Date.now()) {
  if(snapshot.deleted || snapshot.generation!==progress.generation)throw new Error('This session belongs to an earlier cleared progress history.');
  const bank=new Map(activities.map(a=>[a.id,a]));
  const items=snapshot.items.map(ref=>{const a=bank.get(ref.id);if(!a || a.revision!==ref.revision)throw new Error('A question in this session changed. Your answer history and saved questions are kept; start a new session.');return a;});
  const session={...structuredClone(snapshot),items,recorded:new Set(snapshot.recorded),skipped:new Set(snapshot.skipped),checkedAttempts:structuredClone(snapshot.checkedAttempts||[]),elapsedMs:snapshot.elapsedMs,runningSince:now,done:false,deadline:null,startedAt:Date.parse(snapshot.createdAt)};
  for(const a of items){
    const validIds=(a.options||a.pairs||a.items).map(v=>v.id),order=session.orders[a.id];
    if(order.length!==validIds.length || new Set(order).size!==order.length || order.some(id=>!validIds.includes(id)))throw new Error('This session has an incompatible answer order.');
    const r=session.responses[a.id];
    if(r!==undefined){
      const valid=a.options?typeof r==='string'&&validIds.includes(r):a.type==='order'?Array.isArray(r)&&r.length===validIds.length&&new Set(r).size===r.length&&r.every(id=>validIds.includes(id)):r&&typeof r==='object'&&!Array.isArray(r)&&Object.entries(r).every(([k,v])=>validIds.includes(k)&&validIds.includes(v))&&new Set(Object.values(r)).size===Object.values(r).length;
      if(!valid)throw new Error('This session has an incompatible response.');
    }
    const attempt=progress.attempts.find(t=>t.id===session.attemptIds[a.id]&&t.activityId===a.id&&t.revision===a.revision);
    if(attempt){session.responses[a.id]=structuredClone(attempt.response);session.recorded.add(a.id);}
    if(session.recorded.has(a.id)&&!completeResponse(a,session.responses[a.id]))throw new Error('A checked question has an incomplete saved response.');
  }
  for(const attempt of session.checkedAttempts){
    const a=bank.get(attempt.activityId),existing=progress.attempts.find(v=>v.id===attempt.id);
    if(attempt.revision!==a.revision||!completeResponse(a,attempt.response)||attempt.correct!==scoreActivity(a,attempt.response)||existing&&canonical(existing)!==canonical(attempt))throw new Error('A session answer does not match its question or saved history.');
    session.responses[a.id]=structuredClone(attempt.response);session.recorded.add(a.id);
  }
  return session;
}
