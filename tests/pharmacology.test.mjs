import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { scoreActivity, completeResponse } from '../app/model.js';
const base=new URL('../subjects/pharmacology/',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,base),'utf8').replace(/^\uFEFF/,''));
const manifest=read('sources/manifest.json'), config=read('subject.json');
const ledger=read('source-analysis/page-ledger.json').pages;
const concepts=read('source-analysis/concept-index.json').concepts;
const bank=read('activities.json').activities;
const deferrals=read('source-analysis/activity-deferrals.json').items;
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
test('Pharmacology originals, all pages and faithful viewer images retain provenance',()=>{
 assert.equal(manifest.total_pdf_pages,283);
 assert.equal(ledger.length,283);
 const images=read('sources/page-images.json');
 assert.equal(images.pages.length,ledger.length);
 assert.equal(images.manifestHashNormalization,'UTF-8 without BOM; LF newlines');
 assert.equal(images.manifestSha256,createHash('sha256').update(fs.readFileSync(new URL('sources/manifest.json',base),'utf8').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n')).digest('hex')); 
 for(const lecture of manifest.lectures){
  assert.equal(hash(new URL('sources/'+lecture.path,base)),lecture.sha256);
  assert.deepEqual(ledger.filter(p=>p.lectureId===lecture.id).map(p=>p.pdfPage),Array.from({length:lecture.pdf_pages},(_,i)=>i+1));
 }
 for(const p of ledger){
  assert.equal(p.visualReview,'reviewed');assert.ok('printedSlide' in p);
  const image=images.pages.find(i=>i.lectureId===p.lectureId&&i.pdfPage===p.pdfPage);
  assert.ok(image);assert.equal(hash(new URL('sources/'+image.path,base)),image.sha256);
  assert.equal(image.sourceSha256,manifest.lectures.find(l=>l.id===p.lectureId).sha256);
 }
});
test('Pharmacology publishes reviewed bilingual activities with valid scoring and exact concept evidence',()=>{
 assert.ok(bank.length>0);assert.equal(new Set(bank.map(a=>a.id)).size,bank.length);
 const prompts=new Set();
 for(const a of bank){
  assert.equal(a.status,'validated',a.id);
  for(const field of ['sourceChecked','ambiguityChecked','cueChecked','bilingualChecked'])assert.equal(a.review[field],true,a.id);
  assert.ok(a.review.peerReviewedBy&&a.review.peerReviewNotes,a.id);
  assert.ok(a.explanation.en&&/[\u0600-\u06ff]/.test(a.explanation.ar),a.id);
  const normalized=a.prompt.toLowerCase().replace(/\W/g,'');assert.ok(!prompts.has(normalized),a.id);prompts.add(normalized);
  if(a.type!=='diagram')assert.doesNotMatch(a.prompt,/\b(?:the slide|the lecture|according to|the source|this graph|this figure|the table)\b/i,a.id);
  for(const ref of a.sourceRefs)assert.ok(ledger.some(p=>p.lectureId===ref.lectureId&&p.pdfPage===ref.pdfPage&&p.kind==='teaching'),a.id);
  for(const cid of a.conceptIds){const c=concepts.find(c=>c.id===cid);assert.ok(c,a.id);assert.ok(c.sourceRefs.some(r=>a.sourceRefs.some(s=>r.lectureId===s.lectureId&&r.pdfPage===s.pdfPage)),a.id);}
  if(a.options){assert.equal(a.options.length,5,a.id);assert.equal(new Set(a.options.map(o=>o.text.toLowerCase().trim())).size,5,a.id);assert.ok(a.options.every(o=>o.evidence),a.id);assert.equal(scoreActivity(a,a.correctOptionId),true,a.id);}
  if(a.type==='match'){assert.equal(new Set(a.pairs.map(p=>p.right)).size,a.pairs.length,a.id);assert.equal(scoreActivity(a,Object.fromEntries(a.pairs.map(p=>[p.id,p.id]))),true,a.id);}
  if(a.type==='order'){assert.ok(completeResponse(a,a.acceptedGroups.flat()),a.id);assert.equal(scoreActivity(a,a.acceptedGroups.flat()),true,a.id);}
  if(a.type==='diagram')assert.ok(fs.existsSync(new URL(a.asset.path,base)),a.id);
 }
});
test('Pharmacology excludes unresolved concepts and records coverage deferrals explicitly',()=>{
 const blocked=new Set(manifest.lectures.flatMap(l=>read('source-analysis/lectures/'+l.id+'.json').blockedConceptIds||[]));
 for(const a of bank)assert.ok(a.conceptIds.every(c=>!blocked.has(c)),a.id);
 for(const c of concepts){
  const expected=bank.filter(a=>a.conceptIds.includes(c.id)).map(a=>a.id).sort();
  assert.deepEqual([...c.activityIds].sort(),expected,c.id);
  if(c.priority==='core'&&!expected.length)assert.ok(deferrals.some(d=>d.conceptId===c.id&&d.reason),c.id);
 }
});
test('Pharmacology retains distinct first-three-chapter and drug-chapter assessment policies',()=>{
 const policy=config.scope.assessmentEmphasis;
 for(const id of ['introduction-and-roa','pharmacokinetics','pharmacodynamics'])assert.equal(policy[id],'principles-over-illustrative-drug-recall');
 assert.equal(policy['ans-and-adrenergic-drugs'],'foundations-and-drug-specific-distinctions');
});
test('compiled Pharmacology bank exactly matches the frozen independently reviewed lecture records',()=>{
 const reviewed=manifest.lectures.flatMap(l=>read('activities/'+l.id+'.json').activities);
 assert.deepEqual(bank,reviewed);
});
