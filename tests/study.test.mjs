import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyStudy, bookmark, mergeStudy, loadStudy, saveStudy, studyKey, storeSession, removeSession, restoreSession, elapsedSession, validateStudy } from '../app/study.js';
import { emptyProgress, appendAttempt, saveProgress, loadProgress, parseBackup, mergeProgress } from '../app/storage.js';
import { studyNotes } from '../app/notes.js';
import { assemblePdf } from '../app/pdf.js';
const now=Date.now();
const question=(id='q1')=>({id,revision:1,type:'mcq',conceptIds:['c1'],lectureId:'l1',prompt:'Which option?',options:['a','b','c','d','e'].map(id=>({id,text:id})),correctOptionId:'a',explanation:{en:'DNA stores genetic information.',ar:'يحمل DNA المعلومات الوراثية.'},sourceRefs:[{lectureId:'l1',pdfPage:2}]});
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const session=(items=[question()])=>({id:'session-one',mode:'practice',generation:'initial',createdAt:new Date(now-60000).toISOString(),items,index:0,responses:{},orders:Object.fromEntries(items.map(a=>[a.id,['c','a','e','b','d']])),recorded:new Set(),skipped:new Set(),checkedAttempts:[],attemptIds:Object.fromEntries(items.map(a=>[a.id,'attempt-'+a.id])),elapsedMs:12000,runningSince:now-1000,done:false});
const attempt=(a,time=now)=>({id:'attempt-'+a.id,activityId:a.id,revision:1,at:new Date(time).toISOString(),mode:'practice',response:'a',correct:true});

test('leaving a 234-question practice keeps every checked answer without finishing',()=>{
  const storage=memory(),items=Array.from({length:234},(_,i)=>question('q'+i));let progress=emptyProgress('subject','scope');const active=session(items);
  for(const a of items){const record=attempt(a);progress=appendAttempt(progress,record).progress;assert.equal(saveProgress(storage,progress,items),true);active.responses[a.id]='a';active.recorded.add(a.id);active.checkedAttempts.push(record);}
  const study=storeSession(emptyStudy('subject','scope'),active,now);assert.equal(saveStudy(storage,study),true);
  const reloaded=loadProgress(storage,'subject','scope',items).progress,resumed=restoreSession(loadStudy(storage,'subject','scope').study.sessions[0],items,reloaded,now+1000);
  assert.equal(reloaded.attempts.length,234);assert.equal(resumed.recorded.size,234);assert.equal(resumed.checkedAttempts.length,234);
  assert.equal(mergeProgress(reloaded,parseBackup(JSON.stringify(reloaded),'subject','scope',items)).attempts.length,234);
});
test('resume preserves question order, shuffled choices, partial selections and skipped questions',()=>{
  const items=[question('q1'),question('q2')],active=session(items);active.index=1;active.responses.q2='d';active.skipped.add('q1');
  const snapshot=storeSession(emptyStudy('subject','scope'),active,now).sessions[0],resumed=restoreSession(snapshot,items,emptyProgress('subject','scope'),now+86400000);
  assert.equal(resumed.index,1);assert.deepEqual(resumed.orders,active.orders);assert.equal(resumed.responses.q2,'d');assert.ok(resumed.skipped.has('q1'));assert.equal(resumed.recorded.size,0);
  assert.equal(elapsedSession(resumed,now+86401000),14000);
});
test('skipping and saving a question never create performance evidence',()=>{
  const p=emptyProgress('subject','scope'),active=session();active.skipped.add('q1');
  const study=storeSession(bookmark(emptyStudy('subject','scope'),'q1',true,now),active,now+1);
  assert.equal(study.bookmarks[0].saved,true);assert.equal(p.attempts.length,0);assert.equal(study.sessions[0].recorded.length,0);
});
test('saved checked answers can bridge an interrupted history write and keep the same attempt IDs',()=>{
  const active=session();active.responses.q1='a';active.recorded.add('q1');active.checkedAttempts=[attempt(question())];
  const snapshot=storeSession(emptyStudy('subject','scope'),active,now).sessions[0];
  const resumed=restoreSession(snapshot,[question()],emptyProgress('subject','scope'),now+1000);
  assert.equal(resumed.checkedAttempts[0].id,'attempt-q1');assert.ok(resumed.recorded.has('q1'));
  const p={...emptyProgress('subject','scope'),attempts:[attempt(question())]};assert.equal(restoreSession(snapshot,[question()],p,now+1000).checkedAttempts.length,1);
  assert.throws(()=>restoreSession({...snapshot,checkedAttempts:[{...attempt(question()),response:'b',correct:false}]},[question()],p,now+1000),/does not match/);
});
test('old progress backups remain compatible and combined backups retain bookmarks and sessions',()=>{
  const p={...emptyProgress('subject','scope'),attempts:[attempt(question())]},study=storeSession(bookmark(emptyStudy('subject','scope'),'q1',true,now),session(),now+1);
  assert.deepEqual(parseBackup(JSON.stringify(p),'subject','scope',[question()]),p);
  const combined=parseBackup(JSON.stringify({...p,studyState:study}),'subject','scope',[question()]);assert.deepEqual(combined.studyState,study);
  assert.throws(()=>parseBackup(JSON.stringify({...p,studyState:{...study,subjectId:'other'}}),'subject','scope',[question()]));assert.equal(p.attempts.length,1);
});
test('two stale tabs merge bookmarks and keep removals without resurrecting saved items',()=>{
  const storage=memory(),a=bookmark(emptyStudy('subject','scope'),'q1',true,now),b=bookmark(emptyStudy('subject','scope'),'q2',true,now);
  assert.ok(saveStudy(storage,a));assert.ok(saveStudy(storage,b));assert.equal(b.bookmarks.filter(v=>v.saved).length,2);
  const removed=bookmark(b,'q1',false,now+10);assert.ok(saveStudy(storage,removed));assert.ok(saveStudy(storage,a));assert.equal(loadStudy(storage,'subject','scope').study.bookmarks.find(v=>v.activityId==='q1').saved,false);
});
test('a finished or removed session cannot be resurrected by another tab autosaving it',()=>{
  const active=session(),saved=storeSession(emptyStudy('subject','scope'),active,now),deleted=removeSession(saved,active.id,now+1),stale=storeSession(saved,active,now+100);
  assert.equal(mergeStudy(deleted,stale).sessions[0].deleted,true);assert.throws(()=>storeSession(deleted,active,now+200),/another tab/);
});
test('storage failures and corrupt study data do not overwrite a stored copy',()=>{
  const storage=memory();storage.setItem(studyKey('subject','scope'),'{bad');const before=storage.getItem(studyKey('subject','scope'));
  assert.ok(loadStudy(storage,'subject','scope').warning);assert.equal(saveStudy(storage,emptyStudy('subject','scope')),false);assert.equal(storage.getItem(studyKey('subject','scope')),before);
  const data=bookmark(emptyStudy('subject','scope'),'q1',true,now),original=structuredClone(data);assert.equal(saveStudy({getItem:()=>null,setItem:()=>{throw Error('quota');}},data),false);assert.deepEqual(data,original);
});
test('saved sessions reject changed revisions, cleared history and malformed answer orders',()=>{
  const snap=storeSession(emptyStudy('subject','scope'),session(),now).sessions[0],p=emptyProgress('subject','scope');
  assert.throws(()=>restoreSession(snap,[{...question(),revision:2}],p,now),/changed/);assert.throws(()=>restoreSession(snap,[question()],{...p,generation:'reset'},now),/cleared/);
  assert.throws(()=>restoreSession({...snap,orders:{q1:['a','a','c','d','e']}},[question()],p,now),/incompatible/);
  assert.throws(()=>validateStudy({...emptyStudy('subject','scope'),bookmarks:[{activityId:'q1',saved:true,updatedAt:'2099-01-01'}]},'subject','scope',now));
});
test('PDF notes contain factual explanations, headings and source links instead of stems and options',()=>{
  const a=question(),html=studyNotes([a],[{id:'c1',label:'Genetic information'}],[{id:'l1',title:'Genes'}],'en','Molecular Biology',r=>'source.pdf#page='+r.pdfPage);
  assert.ok(html.includes('DNA stores genetic information.'));assert.ok(html.includes('Genetic information'));assert.ok(html.includes('source.pdf#page=2'));assert.ok(!html.includes(a.prompt));assert.ok(!html.includes('Answer choices'));
  const safe=studyNotes([{...a,explanation:{en:'<script>bad()</script>'}}],[{id:'c1',label:'DNA'}],[{id:'l1',title:'Genes'}],'en','Subject',()=>'/');assert.ok(!safe.includes('<script>'));
  const ar=studyNotes([a],[{id:'c1',label:'DNA'}],[{id:'l1',title:'Genes'}],'ar','Subject',()=>'/');assert.ok(ar.includes('dir="rtl"'));assert.ok(ar.includes(a.explanation.ar));
});
test('PDF downloads have a valid page tree and byte-accurate cross-reference offsets',async()=>{
  const blob=assemblePdf([new Uint8Array([255,216,255,217]),new Uint8Array([255,216,255,217])]);
  const bytes=new Uint8Array(await blob.arrayBuffer()),text=new TextDecoder('latin1').decode(bytes);
  assert.equal(blob.type,'application/pdf');assert.ok(text.startsWith('%PDF-1.4'));assert.ok(text.includes('/Count 2'));
  const start=Number(/startxref\n(\d+)/.exec(text)[1]);assert.equal(new TextDecoder().decode(bytes.slice(start,start+4)),'xref');
  const rows=text.slice(start).split('\n');for(let id=1;id<=9;id++){const offset=Number(rows[2+id].slice(0,10));assert.ok(new TextDecoder().decode(bytes.slice(offset,offset+20)).startsWith(`${id} 0 obj`));}
});
