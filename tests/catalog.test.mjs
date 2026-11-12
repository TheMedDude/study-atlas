import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { progressKey } from '../app/storage.js';
const read = p => JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const configs = read('subjects/index.json').subjects.map(s=>read('subjects/'+s.config));
const source = fs.readFileSync(new URL('../app/app.js',import.meta.url),'utf8');
const start = source.indexOf('function coursesView()');
const end = source.indexOf('\nfunction home()',start);
const render = new Function('subjectConfigs','storage','progressKey','subject','pageHead','esc',source.slice(start,end)+'; return coursesView();');
const draw = (cfgs,storage) => render(cfgs,storage,progressKey,null,()=>'',s=>String(s??''));
test('course catalog metrics agree with authoritative manifests and validated banks',()=>{
 for(const cfg of configs){
  const base='subjects/'+cfg.id+'/';
  const manifest=read(base+'sources/manifest.json'), coverage=read(base+'source-analysis/coverage-summary.json');
  const bank=read(base+'activities.json').activities.filter(a=>a.status==='validated');
  assert.deepEqual(cfg.catalog,{lectures:manifest.lectures.length,pages:coverage.teachingPages,pdfPages:manifest.total_pdf_pages,mcqs:bank.filter(a=>a.type==='mcq').length,total:bank.length});
 }
});
test('course chooser reads existing v1 progress and labels answers honestly',()=>{
 const cfg=configs[0],key=progressKey(cfg.id,cfg.scope.id);
 const storage={getItem:k=>k===key?JSON.stringify({attempts:[{},{}]}):null};
 assert.match(draw([cfg],storage),/2 answers recorded/);
 assert.doesNotMatch(draw([cfg],storage),/Ready to start/);
});
test('a third subject uses its own counts and contributes to platform totals',()=>{
 const cfg={id:'third-course',title:'Third Course',description:'',scope:{id:'midterm',title:'Midterm'},catalog:{lectures:4,pages:12,pdfPages:15,mcqs:7,total:9}};
 const html=draw([cfg],{getItem:()=>null});
 assert.match(html,/<strong>4<\/strong><span>Lectures/);
 assert.match(html,/<strong>7<\/strong><span>5-Option MCQs/);
 assert.match(html,/9 Activities/);
 assert.match(html,/15 supplied PDF pages/);
 assert.doesNotMatch(html,/409|428|400 authoritative/);
});

test('course answer totals retain archived history after bank revisions',()=>{
 const cfg=configs[0],key=progressKey(cfg.id,cfg.scope.id);
 const storage={getItem:k=>k===key?JSON.stringify({attempts:[{}],archivedAttempts:[{},{}]}):null};
 assert.match(draw([cfg],storage),/3 answers recorded/);
});
test('revealed matrix value is exposed to keyboard and screen-reader focus without leaking while hidden',()=>{
 const begin=source.indexOf('function setMatrixCell('),end=source.indexOf("\ndocument.addEventListener('click'",begin);
 assert.ok(begin>=0&&end>begin);
 const setCell=new Function(source.slice(begin,end)+'; return setMatrixCell;')();
 const attrs={},button={setAttribute:(k,v)=>{attrs[k]=v;}},textAttrs={};
 const text={textContent:'70S ribosomes',setAttribute:(k,v)=>{textAttrs[k]=v;}};
 const cell={classList:{toggle:(k,v)=>{attrs.revealed=v;}},querySelector:s=>s==='.matrix-cell-toggle'?button:text};
 setCell(cell,true);
 assert.equal(attrs['aria-expanded'],'true');assert.equal(textAttrs['aria-hidden'],'false');
 assert.match(attrs['aria-label'],/70S ribosomes/);
 setCell(cell,false);
 assert.equal(attrs['aria-expanded'],'false');assert.equal(textAttrs['aria-hidden'],'true');
 assert.doesNotMatch(attrs['aria-label'],/70S ribosomes/);
});
const historyStart=source.indexOf('function hasAnyAnswerHistory('),historyEnd=source.indexOf('\nasync function init()',historyStart);
const anyHistory=new Function('configs','store','progressKey',source.slice(historyStart,historyEnd)+';return hasAnyAnswerHistory(configs,store);');
test('release history detection includes another subject and archived answers',()=>{
 const store={getItem:k=>k===progressKey(configs[0].id,configs[0].scope.id)?JSON.stringify({attempts:[],archivedAttempts:[{}]}):null};
 assert.equal(anyHistory(configs,store,progressKey),true);
});
test('fresh or corrupt storage does not masquerade as returning answer history',()=>{
 for(const getItem of [()=>null,()=>'{bad',()=>JSON.stringify({attempts:'not-an-array'}),()=>{throw Error('unavailable');}])assert.equal(anyHistory(configs,{getItem},progressKey),false);
});
