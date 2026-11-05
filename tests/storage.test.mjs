import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackup, mergeProgress, emptyProgress, resetProgress, appendAttempt, saveProgress, loadProgress, progressKey, normalizeSettings, MAX_ATTEMPTS, MAX_BACKUP_BYTES } from '../app/storage.js';
import { currentAttempts } from '../app/model.js';
const activity = { id: 'q1', revision: 1, type: 'mcq', conceptIds: ['c1'], options: ['a','b','c','d','e'].map(id => ({id})), correctOptionId: 'a' };
const now = Date.now();
const attempt = { id: 'attempt-123', activityId: 'q1', revision: 1, at: new Date(now - 10000).toISOString(), mode: 'practice', response: 'a', correct: true };
const backup = { ...emptyProgress('subject','scope'), attempts: [attempt] };
const parse = value => parseBackup(JSON.stringify(value), 'subject', 'scope', [activity], now);
function memory() { const data = new Map(); return { data, getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) }; }
const freshAttempt = (id, time = now - 1000) => ({ ...attempt, id, at: new Date(time).toISOString() });

test('a progress backup round-trips and recomputes its score', () => { assert.deepEqual(parse(backup), backup); });
test('duplicate imports merge without inflating attempt history', () => { assert.equal(mergeProgress(parse(backup), parse(backup)).attempts.length, 1); });
test('merging conflicting IDs rejects instead of replacing history', () => {
  assert.throws(() => mergeProgress(backup, { ...backup, attempts: [{...attempt,correct:false}] }), /share the same ID/);
});
test('invalid backups are rejected without mutating existing progress', () => {
  const original = structuredClone(backup);
  for (const bad of [{...backup,schemaVersion:2}, {...backup,subjectId:'other'}, {...backup,attempts:[{...attempt,correct:false}]},
    {...backup,attempts:[{...attempt,response:'z'}]}, {...backup,attempts:[{...attempt,at:'2099-01-01'}]},
    {...backup,attempts:[{...attempt,activityId:'unknown'}]}, {...backup,attempts:[attempt,attempt]},
    {...backup,generation:'invalid epoch',clearedAt:null}]) assert.throws(() => parse(bad));
  assert.deepEqual(backup, original);
});
test('malformed JSON and primitive roots cannot become progress', () => {
  for (const raw of ['{','null','4','[]','"hello"']) assert.throws(() => parseBackup(raw,'subject','scope',[activity],now));
});
test('subject and scope have independent storage namespaces', () => {
  assert.notEqual(progressKey('a','scope'),progressKey('b','scope')); assert.notEqual(progressKey('a','one'),progressKey('a','two'));
});
test('storage failures leave the supplied in-memory snapshot unchanged', () => {
  const storage = { getItem:()=>{throw new Error('blocked');}, setItem:()=>{throw new Error('full');} };
  const original = structuredClone(backup);
  assert.equal(saveProgress(storage,backup),false); assert.deepEqual(backup,original);
  const loaded = loadProgress(storage,'subject','scope',[activity]); assert.ok(loaded.warning); assert.deepEqual(loaded.progress.attempts,[]);
});
test('a failed write does not adopt a reconciled snapshot before durability', () => {
  const storage=memory(); const first={...backup,attempts:[freshAttempt('tab-one-000')]}; assert.equal(saveProgress(storage,first),true);
  const second={...emptyProgress('subject','scope'),attempts:[freshAttempt('tab-two-000')]}, original=structuredClone(second);
  storage.setItem=()=>{throw new Error('quota');}; assert.equal(saveProgress(storage,second),false); assert.deepEqual(second,original);
  assert.deepEqual(JSON.parse(storage.getItem(progressKey('subject','scope'))).attempts.map(a=>a.id),['tab-one-000']);
});
test('two stale tab snapshots merge their distinct attempts on successive writes', () => {
  const storage=memory(), one=loadProgress(storage,'subject','scope',[activity]).progress, two=loadProgress(storage,'subject','scope',[activity]).progress;
  one.attempts.push(freshAttempt('tab-one-000',now-2000)); assert.equal(saveProgress(storage,one),true);
  two.attempts.push(freshAttempt('tab-two-000',now-1000)); assert.equal(saveProgress(storage,two),true);
  assert.deepEqual(two.attempts.map(a=>a.id),['tab-one-000','tab-two-000']);
  assert.equal(loadProgress(storage,'subject','scope',[activity]).progress.attempts.length,2);
});
test('a stale tab cannot resurrect attempts after a persisted reset', () => {
  const storage=memory(), saved={...backup}; assert.equal(saveProgress(storage,saved),true);
  const stale=loadProgress(storage,'subject','scope',[activity]).progress;
  const cleared=resetProgress(saved,now-100); assert.equal(saveProgress(storage,cleared),true);
  assert.equal(saveProgress(storage,stale),true); assert.equal(stale.generation,cleared.generation); assert.deepEqual(stale.attempts,[]);
  const loaded=loadProgress(storage,'subject','scope',[activity]).progress;
  assert.equal(loaded.generation,cleared.generation); assert.deepEqual(loaded.attempts,[]);
});
test('a new post-clear response survives a stale tab reconciliation, old history does not', () => {
  const storage=memory(), saved={...backup}; assert.equal(saveProgress(storage,saved),true);
  let stale=loadProgress(storage,'subject','scope',[activity]).progress;
  const cleared=resetProgress(saved,now-500); assert.equal(saveProgress(storage,cleared),true);
  stale=appendAttempt(stale,freshAttempt('after-clear-000',now-100)).progress;
  assert.equal(saveProgress(storage,stale),true); assert.deepEqual(stale.attempts.map(a=>a.id),['after-clear-000']); assert.equal(stale.generation,cleared.generation);
});
test('an unpersisted pre-clear response is not restored from a stale tab', () => {
  const storage=memory(); let stale=emptyProgress('subject','scope'); stale=appendAttempt(stale,freshAttempt('before-clear-000',now-2000)).progress;
  const cleared=resetProgress(emptyProgress('subject','scope'),now-1000); assert.equal(saveProgress(storage,cleared),true);
  assert.equal(saveProgress(storage,stale),true); assert.deepEqual(stale.attempts,[]);
});
test('an explicit backup import can restore history into the current cleared generation', () => {
  const storage=memory(), cleared=resetProgress(emptyProgress('subject','scope'),now-1000); assert.equal(saveProgress(storage,cleared),true);
  const restored=mergeProgress(cleared,parse(backup)); assert.equal(restored.generation,cleared.generation);
  assert.equal(saveProgress(storage,restored),true); assert.deepEqual(restored.attempts,[attempt]);
});
test('local bank migration archives one changed revision and preserves unrelated compatible history', () => {
  const storage=memory(), other={...activity,id:'q2'}, old={...backup,attempts:[attempt,{...attempt,id:'attempt-456',activityId:'q2'}]};
  assert.equal(saveProgress(storage,old),true);
  const bank=[{...activity,revision:2},other], loaded=loadProgress(storage,'subject','scope',bank);
  assert.match(loaded.warning,/archived/); assert.deepEqual(loaded.progress.attempts.map(a=>a.activityId),['q2']);
  assert.deepEqual(loaded.progress.archivedAttempts.map(a=>a.activityId),['q1']);
  assert.equal(currentAttempts(loaded.progress.attempts,bank).length,1);
  assert.equal(saveProgress(storage,loaded.progress),true);
  const reloaded=loadProgress(storage,'subject','scope',bank); assert.equal(reloaded.warning,null);
  assert.equal(reloaded.progress.attempts.length,1); assert.equal(reloaded.progress.archivedAttempts.length,1);
  const restored=parseBackup(JSON.stringify({...reloaded.progress,exportedAt:new Date(now).toISOString()}),'subject','scope',bank,now);
  assert.deepEqual(restored,reloaded.progress);
});
test('removed local activities remain in inert portable archive, never current evidence', () => {
  const storage=memory(); assert.equal(saveProgress(storage,{...backup}),true);
  const loaded=loadProgress(storage,'subject','scope',[]).progress;
  assert.equal(loaded.attempts.length,0); assert.equal(loaded.archivedAttempts.length,1);
  const restored=parseBackup(JSON.stringify(loaded),'subject','scope',[],now);
  assert.equal(restored.attempts.length,0); assert.equal(restored.archivedAttempts.length,1);
  assert.throws(()=>parseBackup(JSON.stringify(backup),'subject','scope',[],now),/unknown or changed/);
});
test('archive entries are still structurally validated and share the attempt-ID namespace', () => {
  assert.throws(()=>parse({...backup,archivedAttempts:[attempt]}),/repeated attempt IDs/);
  assert.throws(()=>parse({...emptyProgress('subject','scope'),archivedAttempts:[{...attempt,response:{bad:5}}]}),/invalid attempt or response/);
});
test('same matching response with different property order is a semantic duplicate', () => {
  const match={...activity,type:'match',pairs:[{id:'p1'},{id:'p2'}]}; delete match.options; delete match.correctOptionId;
  const one={...backup,attempts:[{...attempt,response:{p1:'p1',p2:'p2'}}]}, two={...backup,attempts:[{...attempt,response:{p2:'p2',p1:'p1'}}]};
  const parsed=x=>parseBackup(JSON.stringify(x),'subject','scope',[match],now);
  const merged=mergeProgress(parsed(one),parsed(two)); assert.equal(merged.attempts.length,1);
  const storage=memory(); assert.equal(saveProgress(storage,parsed(one)),true); assert.equal(saveProgress(storage,parsed(two)),true);
  assert.equal(loadProgress(storage,'subject','scope',[match]).progress.attempts.length,1);
});
test('append retention cap and own export/reload remain portable', () => {
  const progress={...emptyProgress('subject','scope'),attempts:Array.from({length:MAX_ATTEMPTS},(_,i)=>freshAttempt(`attempt-${String(i).padStart(6,'0')}`,now-30000+i))};
  const appended=appendAttempt(progress,freshAttempt('attempt-newest',now-1));
  assert.equal(appended.pruned,1); assert.equal(appended.progress.attempts.length,MAX_ATTEMPTS); assert.equal(appended.progress.historyLimited,true);
  assert.equal(appended.progress.attempts.some(a=>a.id==='attempt-000000'),false);
  const storage=memory(); assert.equal(saveProgress(storage,appended.progress),true);
  assert.equal(loadProgress(storage,'subject','scope',[activity]).progress.attempts.length,MAX_ATTEMPTS);
  assert.equal(parseBackup(JSON.stringify({...appended.progress,exportedAt:new Date(now).toISOString()}),'subject','scope',[activity],now).attempts.length,MAX_ATTEMPTS);
});
test('byte compaction prunes oversized historical records and retains portable active data', () => {
  const huge={...attempt,id:'huge-history-000',response:'x'.repeat(MAX_BACKUP_BYTES)};
  const progress={...emptyProgress('subject','scope'),archivedAttempts:[huge]};
  const appended=appendAttempt(progress,freshAttempt('portable-newest',now-1));
  assert.equal(appended.pruned,1); assert.equal(appended.progress.archivedAttempts.length,0);
  assert.ok(new TextEncoder().encode(JSON.stringify(appended.progress)).length<MAX_BACKUP_BYTES-1024);
  assert.equal(parse(appended.progress).attempts.length,1);
});
test('even a single unportable attempt is removed instead of creating an unrestorable export', () => {
  const appended=appendAttempt(emptyProgress('subject','scope'),{...attempt,response:'x'.repeat(MAX_BACKUP_BYTES)});
  assert.equal(appended.pruned,1); assert.equal(appended.progress.historyLimited,true); assert.equal(appended.progress.attempts.length,0);
  assert.equal(parse(appended.progress).attempts.length,0);
});
test('cross-tab union respects the retention window and portable export bound', () => {
  const storage=memory(); const one={...emptyProgress('subject','scope'),attempts:Array.from({length:MAX_ATTEMPTS},(_,i)=>freshAttempt(`attempt-${String(i).padStart(6,'0')}`,now-30000+i))};
  assert.equal(saveProgress(storage,one),true);
  const two={...emptyProgress('subject','scope'),attempts:[freshAttempt('tab-two-newest',now-1)]}; assert.equal(saveProgress(storage,two),true);
  assert.equal(two.attempts.length,MAX_ATTEMPTS); assert.equal(two.historyLimited,true); assert.ok(two.attempts.some(a=>a.id==='tab-two-newest'));
  assert.equal(parse(two).attempts.length,MAX_ATTEMPTS);
});
test('settings accept only supported values', () => {
  assert.deepEqual(normalizeSettings({instantCheck:false,explanationLanguage:'<script>',sourceLayout:'bad',textSize:'huge',reducedMotion:'yes'}),{instantCheck:false,explanationLanguage:'en',sourceLayout:'side',textSize:'normal',reducedMotion:false});
});

test('storage-event reconciliation converges overlapping tab writes', () => {
  const storage=memory(); const one={...emptyProgress('subject','scope'),attempts:[freshAttempt('overlap-one-000',now-2000)]};
  const two={...emptyProgress('subject','scope'),attempts:[freshAttempt('overlap-two-000',now-1000)]};
  const get=storage.getItem; let interleave=true;
  storage.getItem=key=>{
    const old=get(key);
    if(interleave){interleave=false;assert.equal(saveProgress(storage,two,[activity]),true);}
    return old;
  };
  assert.equal(saveProgress(storage,one,[activity]),true);
  // Each browser receives the other writer's storage event and reconciles its
  // retained in-memory snapshot, recovering the write hidden by interleaving.
  assert.equal(saveProgress(storage,two,[activity]),true);
  assert.equal(saveProgress(storage,one,[activity]),true);
  assert.deepEqual(loadProgress(storage,'subject','scope',[activity]).progress.attempts.map(a=>a.id),['overlap-one-000','overlap-two-000']);
});
test('live reconciliation with a newer bank archives records from an older tab', () => {
  const storage=memory(), newerBank=[{...activity,revision:2}];
  const current=emptyProgress('subject','scope'); assert.equal(saveProgress(storage,current,newerBank),true);
  const oldTab={...backup}; assert.equal(saveProgress(storage,oldTab,[activity]),true);
  assert.equal(saveProgress(storage,current,newerBank),true);
  assert.equal(current.attempts.length,0); assert.deepEqual(current.archivedAttempts,[attempt]);
  assert.deepEqual(parseBackup(JSON.stringify(current),'subject','scope',newerBank,now),current);
});
