import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { completeResponse, scoreActivity } from '../app/model.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const base='subjects/molecular-biology/';
const manifest=read(base+'sources/manifest.json'),subject=read(base+'subject.json');
const pages=read(base+'source-analysis/page-ledger.json').pages,concepts=read(base+'source-analysis/concept-index.json').concepts;
const activities=read(base+'activities.json').activities;
test('all original PDFs retain their manifest hash and page ledger coverage',()=>{
  assert.equal(pages.length,manifest.total_pdf_pages);
  for(const lecture of manifest.lectures){
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,base,'sources',lecture.path))).digest('hex'),lecture.sha256);
    const indexed=pages.filter(p=>p.lectureId===lecture.id);assert.deepEqual(indexed.map(p=>p.pdfPage),Array.from({length:lecture.pdf_pages},(_,n)=>n+1));
    assert.ok(indexed.every(p=>p.visualReview==='reviewed'&&'printedSlide' in p));
  }
});
test('only independently reviewed, bilingual, source-linked activities enter the app',()=>{
  assert.ok(activities.length>0);assert.equal(new Set(activities.map(a=>a.id)).size,activities.length);
  for(const a of activities){
    assert.equal(a.status,'validated',a.id);assert.ok(a.review.peerReviewedBy&&a.review.peerReviewNotes,a.id);
    assert.ok(a.explanation.en&&/[\u0600-\u06ff]/.test(a.explanation.ar),a.id);
    assert.ok(a.sourceRefs.every(ref=>pages.some(p=>p.lectureId===ref.lectureId&&p.pdfPage===ref.pdfPage&&p.kind==='teaching')),a.id);
    for(const id of a.conceptIds){const c=concepts.find(c=>c.id===id);assert.ok(c,a.id);assert.ok(c.sourceRefs.some(r=>a.sourceRefs.some(s=>s.lectureId===r.lectureId&&s.pdfPage===r.pdfPage)),a.id);}
    if(a.options){assert.equal(a.options.length,subject.assessment.mcqOptionCount,a.id);assert.equal(new Set(a.options.map(o=>o.text.toLowerCase())).size,a.options.length,a.id);assert.ok(a.options.every(o=>o.evidence),a.id);assert.equal(scoreActivity(a,a.correctOptionId),true,a.id);}
    if(a.type==='diagram'){assert.ok(fs.existsSync(path.join(root,base,a.asset.path)),a.id);}
    if(a.type==='match'){assert.equal(new Set(a.pairs.map(p=>p.left)).size,a.pairs.length,a.id);assert.equal(new Set(a.pairs.map(p=>p.right)).size,a.pairs.length,a.id);assert.equal(scoreActivity(a,Object.fromEntries(a.pairs.map(p=>[p.id,p.id]))),true,a.id);}
    if(a.type==='order'){assert.ok(completeResponse(a,a.acceptedGroups.flat()),a.id);assert.equal(scoreActivity(a,a.acceptedGroups.flat()),true,a.id);assert.equal(scoreActivity(a,a.acceptedGroups.flatMap(g=>[...g].reverse())),true,a.id);}
  }
});
test('every core concept has activity coverage and every recorded availability matches the bank',()=>{
  for(const c of concepts){const expected=activities.filter(a=>a.conceptIds.includes(c.id)).map(a=>a.id).sort();assert.deepEqual([...c.activityIds].sort(),expected,c.id);if(c.priority==='core')assert.ok(expected.length,c.id);}
});
test('chapter exclusions are explicit and never used as question evidence',()=>{
  const excluded=pages.filter(p=>p.kind!=='teaching');assert.equal(excluded.length,8);
  for(const p of excluded)assert.ok(!activities.some(a=>a.sourceRefs.some(r=>r.lectureId===p.lectureId&&r.pdfPage===p.pdfPage)));
});
test('question stems ask the biology directly without referring to unseen teaching material',()=>{
  const framing=/\b(?:slides?|lectures?|figures?|tables?|diagrams?)\b|\b(?:the|this|supplied|original)\s+sources?\b/i;
  for(const a of activities){
    if(a.type!=='diagram')assert.ok(!framing.test(a.prompt),`${a.id}: ${a.prompt}`);
    assert.ok(!/\baccording to\b/i.test(a.prompt),a.id);
  }
});
test('portable source viewing has a faithful, hash-verified render for every PDF page',()=>{
  const images=read(base+subject.paths.pageImages).pages;
  assert.equal(images.length,pages.length);
  for(const page of pages){
    const image=images.find(i=>i.lectureId===page.lectureId&&i.pdfPage===page.pdfPage);assert.ok(image,`${page.lectureId} ${page.pdfPage}`);
    assert.equal(image.sourceSha256,manifest.lectures.find(l=>l.id===page.lectureId).sha256);
    assert.ok(image.width>=1200&&image.height>=900);
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,base,'sources',image.path))).digest('hex'),image.sha256);
  }
});
test('synthesis data links strictly to verified teaching pages across subjects',()=>{
  const subjects=['subjects/molecular-biology','subjects/general-microbiology'];
  for(const subDir of subjects){
    const sJson=read(path.join(subDir,'subject.json'));
    if(!sJson.paths||!sJson.paths.synthesis)continue;
    const sPages=read(path.join(subDir,'source-analysis/page-ledger.json')).pages;
    const teachingPages=new Set(sPages.filter(p=>p.kind==='teaching').map(p=>`${p.lectureId}:${p.pdfPage}`));
    for(const [module,relPath] of Object.entries(sJson.paths.synthesis)){
      const fullPath=path.join(root,subDir,relPath);
      assert.ok(fs.existsSync(fullPath),`Synthesis file missing: ${fullPath}`);
      const data=read(path.join(subDir,relPath));
      const verifyRefs=(refs,ctx)=>{
        if(!refs||!Array.isArray(refs))return;
        for(const r of refs){
          assert.ok(teachingPages.has(`${r.lectureId}:${r.pdfPage}`),`Unknown/non-teaching ref ${r.lectureId}:${r.pdfPage} in ${subDir} ${ctx}`);
        }
      };
      if(module==='organisms'){
        assert.ok(Array.isArray(data.organisms)&&data.organisms.length>0);
        for(const o of data.organisms){
          assert.ok(o.id&&o.name);
          verifyRefs(o.sourceRefs,o.id);
        }
      }else if(module==='trees'){
        assert.ok(Array.isArray(data.trees)&&data.trees.length>0);
        for(const t of data.trees){
          assert.ok(t.id&&t.title);
          verifyRefs(t.sourceRefs,t.id);
        }
      }else if(module==='matrices'){
        assert.ok(Array.isArray(data.matrices)&&data.matrices.length>0);
        for(const m of data.matrices){
          assert.ok(m.id&&m.title&&m.columns&&m.rows);
          verifyRefs(m.sourceRefs,m.id);
        }
      }else if(module==='heuristics'){
        assert.ok(Array.isArray(data.heuristics)&&data.heuristics.length>0);
        for(const h of data.heuristics){
          assert.ok(h.id&&h.rule&&h.explanation);
          verifyRefs(h.sourceRefs,h.id);
        }
      }
    }
  }
});
