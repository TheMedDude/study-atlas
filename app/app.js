import { EVIDENCE_LABELS, shuffle, completeResponse, scoreActivity, progressSummary, selectActivities, examResult, formatTime } from './model.js';
import { loadSettings, saveSettings, loadProgress, saveProgress, resetProgress, progressKey, parseBackup, mergeProgress, appendAttempt, createAttempt, MAX_BACKUP_BYTES } from './storage.js?v=1.1';

import { emptyStudy, validateStudy, studyKey, loadStudy, saveStudy, mergeStudy, bookmark, elapsedSession, storeSession, removeSession, restoreSession } from './study.js';
import { studyNotes } from './notes.js';
import { notesPdf } from './pdf.js';

const RELEASE = '1.1';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const base = new URL('../', import.meta.url);
const url = path => new URL(path, base).href;
const json = async path => { const r = await fetch(url(path), { cache: 'no-cache' }); if (!r.ok) throw new Error(`Could not load ${path} (${r.status}).`); return r.json(); };
const routes = ['home', 'practice', 'exam', 'drills', 'review', 'saved', 'progress', 'materials', 'updates', 'settings'];
const names = { home: 'Overview', practice: 'Practice', exam: 'Exam', drills: 'Concept drills', review: 'Weak areas', saved: 'Saved', progress: 'Progress', materials: 'Materials', updates: 'Updates', settings: 'Settings' };
const symbols = { home: '◈', practice: '↗', exam: '▤', drills: '⌘', review: '↻', saved: '☆', progress: '◷', materials: '▱', updates: '✧', settings: '⚙' };
let storage;
try { storage = window.localStorage; } catch { storage = { getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); } }; }
const state = { view: routes.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home', settings: loadSettings(storage), session: null, source: null, notice: null, progressFilter: 'all', chapterFilter: 'all' };
let subject, subjectConfigs, lectures, chapters, concepts, activities, pages, sourceImages, uncertainties, coverage, progress, tick;
let study, lastCheckpoint = 0;
let sourceReturnFocus;
let resolveConfirmation;

function confirmAction(message, action = 'Continue') {
  if (resolveConfirmation) resolveConfirmation(false);
  return new Promise(resolve => {
    const previousFocus = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'confirm-dialog'; dialog.setAttribute('aria-labelledby', 'confirm-heading');
    dialog.innerHTML = `<h2 id="confirm-heading">${esc(action)}?</h2><p>${esc(message)}</p><div class="button-row"><button class="button outline" id="confirm-cancel">Keep going</button><button class="button primary" id="confirm-accept">${esc(action)}</button></div>`;
    const finish = answer => { dialog.close(); dialog.remove(); resolveConfirmation = null; if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true}); resolve(answer); };
    resolveConfirmation = finish;
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    dialog.querySelector('#confirm-cancel').addEventListener('click', () => finish(false));
    dialog.querySelector('#confirm-accept').addEventListener('click', () => finish(true));
    document.body.append(dialog); dialog.showModal(); dialog.querySelector('#confirm-cancel').focus();
  });
}

function notice(message, error = false) {
  state.notice = { message, error };
  const host = $('#notice');
  if (host) host.innerHTML = `<div class="notice ${error ? 'error' : ''}" role="${error ? 'alert' : 'status'}"><span>${esc(message)}</span><button data-action="dismiss" aria-label="Dismiss message">×</button></div>`;
}
function applySettings() {
  document.documentElement.dataset.textSize = state.settings.textSize;
  document.documentElement.dataset.reducedMotion = state.settings.reducedMotion;
}
function persist() {
  state.progressSaved = saveProgress(storage, progress, activities);
  if (!state.progressSaved) notice('Browser storage is unavailable. Export a backup to keep this session’s progress.', true);
  return state.progressSaved;
}
function record(activity, response, mode) {
  const savedId = state.session?.attemptIds?.[activity.id];
  if(savedId){const existing=progress.attempts.find(a=>a.id===savedId);if(existing){state.session.responses[activity.id]=structuredClone(existing.response);if(!state.session.checkedAttempts.some(a=>a.id===savedId))state.session.checkedAttempts.push(structuredClone(existing));return;}}
  const attempt = createAttempt(activity, response, mode);
  if (savedId) attempt.id = savedId;
  const appended = appendAttempt(progress, attempt);
  progress = appended.progress;
  if(state.session?.mode!=='exam')state.session.checkedAttempts.push(structuredClone(attempt));
  persist();
  if (appended.pruned && state.progressSaved) notice('The portable history limit was reached. Progress now reflects the most recent retained attempts; export a backup to keep this window.');
}

function saveStudyState() {
  state.studySaved = saveStudy(storage,study);
  if (!state.studySaved) notice('Saved questions and sessions are kept for this visit only. Export a backup to keep them.',true);
  return state.studySaved;
}
function checkpoint() {
  const s=state.session;
  if(!s || s.mode==='exam')return true;
  if(s.generation!==progress.generation){notice('Progress was cleared in another tab. This old session cannot be saved.',true);return false;}
  try { study=storeSession(study,s);lastCheckpoint=Date.now();return saveStudyState(); }
  catch(error){state.studySaved=false;notice(error.message+' Your answer history is kept; export a backup.',true);return false;}
}
function pauseSession() {
  const s=state.session;let saved=true;
  if(s && s.mode!=='exam' && !s.done){s.elapsedMs=elapsedSession(s);s.runningSince=null;saved=checkpoint();}
  clearInterval(tick);return saved;
}
function startClock() {
  clearInterval(tick);
  tick=setInterval(()=>{
    const s=state.session;if(!s || s.done)return;
    if(s.mode==='exam'){
      if(s.deadline){const remaining=(s.deadline-Date.now())/1000;if($('#timer'))$('#timer').textContent=formatTime(remaining);if(remaining<=0)finishSession(true);}
    }else{
      if($('#elapsed'))$('#elapsed').textContent=formatTime(Math.floor(elapsedSession(s)/1000));
      if(s.runningSince!==null && Date.now()-lastCheckpoint>=5000)checkpoint();
    }
  },500);
}
function savedSessionsHTML() {
  const sessions=study.sessions.filter(s=>!s.deleted).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  if(!sessions.length)return '';
  return `<section class="resume-panel panel"><h2>Continue later</h2>${sessions.map(s=>`<div class="resume-row"><div><strong>${s.mode==='practice'?'Practice':s.mode==='drills'?'Concept drills':'Weak-area review'} · ${s.items.length} questions</strong><p class="small muted">${s.recorded.length} checked · ${formatTime(Math.floor(s.elapsedMs/1000))} studied</p></div><div class="button-row"><button class="button primary" data-resume="${esc(s.id)}">Resume</button><button class="text-button" data-remove-session="${esc(s.id)}">Remove</button></div></div>`).join('')}</section>`;
}
function resumePractice(id) {
  try {
    pauseSession();
    const snapshot=study.sessions.find(s=>s.id===id);if(!snapshot)return;
    state.session=restoreSession(snapshot,activities,progress);
    const known=new Set([...progress.attempts,...(progress.archivedAttempts||[])].map(a=>a.id));
    for(const attempt of state.session.checkedAttempts)if(!known.has(attempt.id)){progress=appendAttempt(progress,attempt).progress;known.add(attempt.id);}
    persist();state.view=state.session.mode;
    history.replaceState(null,'',`#${state.view}`);closeSource();render(true);startClock();checkpoint();
  }catch(error){notice(error.message,true);}
}
function savedView() {
  const ids=new Set(study.bookmarks.filter(b=>b.saved).map(b=>b.activityId));
  const items=activities.filter(a=>ids.has(a.id)),missing=[...ids].filter(id=>!activities.some(a=>a.id===id));
  return pageHead('SAVED','Keep what you want to revisit.',`${items.length} saved ${items.length===1?'question':'questions'}. Export their explanations as study notes.`)+savedSessionsHTML()+
    `<div class="section-head"><h2>Saved questions</h2><div class="button-row">${languageToggle()}<button class="button primary" data-action="notes" ${items.length?'':'disabled'}>Export PDF notes</button></div></div>`+
    (items.length?`<div class="saved-list">${items.map(a=>`<article class="panel saved-question"><div class="section-head"><p class="eyebrow">${esc(chapterTitle(a.lectureId))}</p><button class="text-button" data-bookmark="${esc(a.id)}" aria-pressed="true">★ Saved</button></div><h3>${esc(a.prompt)}</h3><details><summary>Study note</summary><p class="explanation" lang="${state.settings.explanationLanguage}" dir="${state.settings.explanationLanguage==='ar'?'rtl':'ltr'}">${esc(a.explanation[state.settings.explanationLanguage])}</p>${refsHTML(a)}</details></article>`).join('')}</div>`:`<div class="empty-state"><h2>No saved questions yet.</h2><p>Use Save question during a session.</p><button class="button primary" data-go="practice">Open practice</button></div>`)+
    missing.map(id=>`<p class="small muted">A saved question is no longer in this bank. <button class="text-button" data-bookmark="${esc(id)}">Remove saved item</button></p>`).join('');
}
function notesPreview() {
  const ids=new Set(study.bookmarks.filter(b=>b.saved).map(b=>b.activityId)),items=activities.filter(a=>ids.has(a.id));if(!items.length)return;
  const dialog=document.createElement('dialog');dialog.id='notes-dialog';dialog.className='notes-dialog';dialog.setAttribute('aria-label','Study notes preview');
  dialog.innerHTML=`<div class="notes-actions"><div><strong>PDF study notes</strong><p class="small muted">Topic notes, ready to download.</p></div><button class="button primary" id="print-notes">Download PDF</button><button class="button outline" id="close-notes">Close</button></div><div id="study-notes">${studyNotes(items,concepts,lectures,state.settings.explanationLanguage,subject.title,sourceURL)}</div>`;
  document.body.append(dialog);dialog.showModal();
  dialog.querySelector('#close-notes').onclick=()=>{dialog.close();dialog.remove();};
  dialog.addEventListener('cancel',()=>dialog.remove());
  dialog.querySelector('#print-notes').onclick=async()=>{const button=dialog.querySelector('#print-notes');button.disabled=true;button.textContent='Creating PDF…';try{const blob=await notesPdf(items,concepts,lectures,state.settings.explanationLanguage,subject.title),link=document.createElement('a'),objectURL=URL.createObjectURL(blob);link.href=objectURL;link.download=`study-atlas-${subject.id}-notes.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);}catch(error){notice(error.message,true);}finally{button.disabled=false;button.textContent='Download PDF';}};
}
function releaseHTML(version) {
  return version==='1.1'?`<p class="eyebrow">VERSION 1.1 · NOVEMBER 7, 2026</p><h2>Pick up where you left off.</h2><ul><li>Previous, skip, finish anytime, and All available in practice.</li><li>Your place and elapsed study time save automatically.</li><li>Save questions and turn them into PDF study notes.</li><li>Navigation stays visible when explanations open.</li><li>Keyboard: 1–5 choose, Enter check/next, + slide, − previous.</li></ul><p class="small muted">Checked answers count even when you leave. Backups include saved questions and sessions.</p>`:
    `<p class="eyebrow">VERSION 1.0 · NOVEMBER 5, 2026</p><h2>Your first Study Atlas.</h2><ul><li>601 multiple-choice questions and 93 concept activities.</li><li>Practice, exams, English/Arabic explanations and source slides.</li><li>Progress on your device, with backup and restore.</li></ul>`;
}
function updatesView(){return pageHead('UPDATES','What’s new?')+`<div class="release-history"><section class="panel release-copy">${releaseHTML('1.0')}</section><section class="panel release-copy" id="release-latest">${releaseHTML(RELEASE)}</section></div>`;}
function showRelease() {
  const dialog=document.createElement('dialog');dialog.className='release-dialog';dialog.setAttribute('aria-label','What’s new in Study Atlas 1.1');
  dialog.innerHTML=`${releaseHTML(RELEASE)}<div class="button-row"><button class="button primary" id="release-close">Got it</button><button class="text-button" id="release-details">View updates</button></div>`;
  document.body.append(dialog);dialog.showModal();
  const close=()=>{dialog.close();dialog.remove();};dialog.querySelector('#release-close').onclick=close;
  dialog.querySelector('#release-details').onclick=()=>{close();go('updates');};dialog.addEventListener('cancel',()=>dialog.remove());
  try{storage.setItem('study-atlas:release-seen',RELEASE);}catch{/* Visit-only storage cannot remember dismissal after a refresh. */}
}
function exportBackup() {
  checkpoint();
  const text=JSON.stringify({...progress,studyState:study,exportedAt:new Date().toISOString()});
  if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES){notice('This combined backup exceeds 8 MB. Your data is still here; remove finished saved sessions before exporting.',true);return;}
  const blob=new Blob([text],{type:'application/json'}),objectURL=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=objectURL;link.download=`study-atlas-${subject.id}-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);notice('Backup exported with progress, saved questions and sessions.');
}

function lectureTitle(id) { return lectures.find(l => l.id === id)?.title || id; }
function chapterTitle(id) { return subject.chapterLabels?.[id] || lectureTitle(id); }
function explanationLanguages() { return subject.languages?.explanations || ['en']; }
function languageName(code) { return code === 'en' ? 'English' : code === 'ar' ? 'العربية' : code.toUpperCase(); }
function sourceURL(ref) {
  const lecture = lectures.find(l => l.id === ref.lectureId);
  return lecture ? url(`subjects/${subject.id}/sources/${lecture.path}`) + `#page=${ref.pdfPage}` : '#';
}
function refsHTML(item) {
  return `<div class="source-links">${item.sourceRefs.map(ref => `<button class="text-button source-link" data-source="${esc(ref.lectureId)}" data-page="${ref.pdfPage}">↗ ${esc(lectureTitle(ref.lectureId))} · PDF p${ref.pdfPage}</button>`).join('')}</div>`;
}
function answerTotalsHTML() {
  const total=progress.attempts.length+(progress.archivedAttempts?.length||0),unique=new Set(progress.attempts.map(a=>a.activityId)).size;
  return `<section class="answer-totals" aria-label="Recorded answer history"><div><strong>${total}</strong><span>answers recorded</span></div><div><strong>${unique}</strong><span>distinct current questions</span></div>${progress.archivedAttempts?.length?`<div><strong>${progress.archivedAttempts.length}</strong><span>archived responses · kept in backups</span></div>`:''}<p>Checked practice answers count immediately, even if you leave the session.</p></section>`;
}
function summary() { return progressSummary(concepts, progress.attempts, activities); }
function badge(text, cls = '') { return `<span class="badge ${cls}">${esc(text)}</span>`; }
function pageHead(kicker, title, copy = '') { return `<header class="page-head"><p class="eyebrow">${esc(kicker)}</p><h1 tabindex="-1">${title}</h1>${copy ? `<p class="lead">${copy}</p>` : ''}</header>`; }

function shell() {
  $('#app').innerHTML = `<div class="app-frame"><aside class="sidebar"><button class="brand" data-go="home"><img src="${url('app/atlas.svg')}" alt="" width="38" height="38"><span>Study Atlas<small>A little more connected.</small></span></button><div class="subject-switch"><label for="subject-select">YOUR SUBJECT</label><select id="subject-select" aria-label="Current subject"><option value="${esc(subject.id)}">${esc(subject.title)}</option></select><span>${esc(subject.scope.title)} · ${lectures.length} lectures</span></div><nav aria-label="Study navigation">${routes.map(view => `<button data-go="${view}"><span aria-hidden="true">${symbols[view]}</span>${names[view]}</button>`).join('')}</nav><div class="sidebar-foot"><span class="device-dot"></span> Progress on this device<button class="text-button" data-go="progress">Back up & restore ↗</button></div></aside><div class="workspace"><header class="topbar"><span>${esc(subject.title)} <span class="muted">/</span> <span id="view-label"></span></span><span class="scope-tag">${esc(subject.scope.title)}</span></header><div id="notice"></div><main id="main" tabindex="-1"></main><footer class="workspace-foot"><span>From your course materials, with a clear path back.</span><button class="text-button" data-go="materials">Browse sources ↗</button></footer></div></div><div id="source-host"></div><input id="backup-file" type="file" accept="application/json,.json" hidden>`;
  if (state.notice) notice(state.notice.message, state.notice.error);
}

function home() {
  const s = summary(), percent = s.total ? Math.round(s.encountered / s.total * 100) : 0;
  const mcqs = activities.filter(a => a.type === 'mcq').length;
  return savedSessionsHTML()+answerTotalsHTML()+`<section class="hero"><div class="hero-copy"><p class="eyebrow">YOUR STUDY ATLAS / 01</p><h1 tabindex="-1">Make the material<br><em>make sense.</em></h1><p class="hero-sub">${esc(subject.title)}. Focused practice, connected concepts, and a clear view of what comes next.</p><div class="button-row"><button class="button primary" data-go="practice">Start practice <span>↗</span></button><button class="button outline" data-go="materials">Explore the material</button></div><p class="hero-caption">${lectures.length} lectures <span>·</span> ${coverage.teachingPages} teaching pages <span>·</span> ${mcqs} MCQs</p></div><div class="atlas-art" aria-hidden="true"><span class="art-label">THE CONNECTIONS COUNT</span><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="112" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="150" cy="150" r="72" fill="none" stroke="currentColor" stroke-width="1"/><path d="M38 150h224M150 38v224M70 70l160 160M70 230 230 70" stroke="currentColor" stroke-width="1"/><path d="m150 65 54 139-54-29-54 29Z" fill="#e2ec98" stroke="#26352e" stroke-width="2"/><path d="m150 65 0 110 54 29" fill="#ed8067" stroke="#26352e" stroke-width="2"/><circle cx="38" cy="150" r="8" fill="#ed8067"/><circle cx="230" cy="70" r="8" fill="#e2ec98"/></svg><span class="art-coordinates">LEARN · CONNECT · RETURN</span></div></section>
    <section class="coverage-strip" aria-label="Your study coverage"><div><p class="eyebrow">YOUR COVERAGE</p><p><strong>${s.encountered}</strong> / ${s.total} source concepts encountered</p></div><div class="coverage-bar-wrap"><div class="coverage-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Concepts encountered"><span style="width:${percent}%"></span></div><small>${percent}% encountered · ${s.available} concepts have validated activities</small></div><button class="text-button" data-go="progress">See the evidence ↗</button></section>
    <section><div class="section-head"><div><p class="eyebrow">THE MATERIAL</p><h2>Pick up a chapter.</h2></div><button class="text-button" data-go="materials">All sources ↗</button></div><div class="chapter-grid">${chapters.map((ch, i) => {
      const ids = concepts.filter(c => c.lectureId === ch.id).map(c => c.id), seen = ids.filter(id => s.evidence.get(id).distinct).length;
      const available = activities.filter(a => a.lectureId === ch.id).length;
      return `<article class="chapter-card"><span class="chapter-number">${String(i + 1).padStart(2, '0')}</span><h3>${esc(chapterTitle(ch.id))}</h3><p>${ch.teachingPages.length} teaching pages <span>·</span> ${available} activities</p><div class="mini-progress"><span style="width:${ids.length ? seen / ids.length * 100 : 0}%"></span></div><div class="card-bottom"><small>${seen} / ${ids.length} concepts encountered</small><button class="round-button" data-chapter-practice="${esc(ch.id)}" aria-label="Practice ${esc(ch.title)}">↗</button></div></article>`;
    }).join('')}</div></section><section class="two-up"><button class="feature-link coral" data-go="drills"><span class="eyebrow">MAKE THE CONNECTION</span><h2>Think in relationships.</h2><p>Match, order, and work with the diagrams.</p><span class="feature-arrow">↗</span></button><button class="feature-link lime" data-go="exam"><span class="eyebrow">PUT IT TOGETHER</span><h2>A session on your terms.</h2><p>Choose a question count. Add a timer if you like.</p><span class="feature-arrow">↗</span></button></section>`;
}

function typesFor(view) { return view === 'review' ? ['mcq', 'match', 'order', 'diagram'] : view === 'drills' ? ['match', 'order', 'diagram'] : ['mcq']; }
function weakConcepts() { const s = summary(); return [...s.evidence].filter(([, e]) => e.recentError).map(([id]) => id); }
function setup(view) {
  const isExam = view === 'exam', isDrill = view === 'drills', isReview = view === 'review';
  const weak = isReview ? weakConcepts() : [];
  if (isReview && !weak.length) return pageHead('A SECOND LOOK', 'Room to build evidence.', 'Missed concepts will appear here after practice.') + `<div class="empty-state"><span>↻</span><h2>Start with a practice session.</h2><p>Your results will help choose what to revisit.</p><button class="button primary" data-go="practice">Open practice ↗</button></div>`;
  const choices = activities.filter(a => typesFor(view).includes(a.type) && (!isReview || a.conceptIds.some(c => weak.includes(c))));
  const title = isExam ? 'Set your own pace.' : isDrill ? 'Connect the concepts.' : isReview ? 'Give it another angle.' : 'A focused next step.';
  const copy = isExam ? 'Your question set stays fixed once you begin. Feedback follows the session.' : isDrill ? 'Automatically scored matching, ordering, and diagram activities.' : isReview ? 'Revisit concepts with errors, using another item where available.' : 'Begin with a manageable set. Later sessions use your results to guide the next selection.';
  return (isExam?'':savedSessionsHTML())+pageHead(isExam ? 'EXAM' : isDrill ? 'CONCEPT DRILLS' : isReview ? 'WEAK-AREA REVIEW' : 'PRACTICE', title, copy) + `<form id="session-setup" data-mode="${view}" class="setup-grid"><section class="panel chapter-picker"><div class="section-head compact"><h2>Choose your chapters</h2><button type="button" class="text-button" data-action="toggle-chapters">Select all / clear</button></div>${chapters.map((ch, i) => {
    const n = choices.filter(a => a.lectureId === ch.id).length;
    return `<label class="chapter-choice ${n ? '' : 'unavailable'}"><input class="chapter-check" type="checkbox" name="lecture" value="${esc(ch.id)}" ${n && (!state.pendingChapter || state.pendingChapter === ch.id) ? 'checked' : ''} ${n ? '' : 'disabled'}><span class="chapter-index">${String(i + 1).padStart(2, '0')}</span><span><strong>${esc(chapterTitle(ch.id))}</strong><small>${n} ${isDrill || isReview ? 'activities' : 'questions'} available</small></span></label>`;
  }).join('')}</section><aside class="panel session-config"><p class="eyebrow">YOUR SESSION</p><h2>${isExam ? 'Build your exam' : 'Start small. Keep going.'}</h2><label class="field" for="session-count">${isDrill || isReview ? 'Activities' : 'Questions'}<input id="session-count" name="count" type="number" min="1" max="${choices.length}" value="${Math.min(subject.assessment.recommendedPracticeCount, choices.length)}" required></label><div class="count-presets">${[10, 25, 50, 100].filter(n => n <= choices.length).map(n => `<button type="button" data-count="${n}">${n}</button>`).join('')}<button type="button" data-action="all-available">All available</button></div><p class="muted small" id="available-count">${choices.length} available in your selection</p>${isExam ? `<label class="toggle-row"><span>Use a timer</span><input id="use-timer" name="timed" type="checkbox" role="switch"></label><label class="field timer-field" for="timer-minutes">Minutes<input id="timer-minutes" name="minutes" type="number" min="1" max="240" value="20" disabled></label>` : `<div class="session-note"><span>↗</span><p>${isDrill ? 'Matching and ordering check on submission. Diagram choices follow your practice preference.' : state.settings.instantCheck ? 'Answers check when you click an option.' : 'Select an option, then confirm your answer.'} <button type="button" class="text-button" data-go="settings">Change in Settings</button></p></div>`}<button class="button primary wide" id="start-session" type="submit">${isExam ? 'Begin exam' : isDrill ? 'Begin drills' : 'Begin practice'} ↗</button><p class="small muted">Progress stays on this device.</p></aside></form>`;
}

function startSession(form) {
  const mode = form.dataset.mode, data = new FormData(form), lectureIds = data.getAll('lecture'), weak = new Set(mode === 'review' ? weakConcepts() : []);
  const count = Number(data.get('count'));
  const pool = activities.filter(a => typesFor(mode).includes(a.type) && lectureIds.includes(a.lectureId)
    && (mode !== 'review' || a.conceptIds.some(c => weak.has(c))));
  if (!lectureIds.length || !Number.isInteger(count) || count < 1 || count > pool.length) { notice('Choose a chapter and a question count within the available set.', true); return; }
  const timed = mode === 'exam' && data.has('timed'), minutes = Number(data.get('minutes'));
  if (timed && (!Number.isInteger(minutes) || minutes < 1 || minutes > 240)) { notice('Choose a timer from 1 to 240 minutes.', true); return; }
  const items = selectActivities(activities, concepts, progress.attempts, { types: typesFor(mode), lectureIds, count, conceptIds: mode === 'review' ? weakConcepts() : [] });
  launch(items, mode, timed ? minutes * 60 : null);
}
function launch(items, mode, seconds = null) {
  if (!items.length) { notice('No activity variants are available for this selection yet.'); return; }
  pauseSession();closeSource();
  const now=Date.now();
  state.session={id:crypto.randomUUID(),generation:progress.generation,createdAt:new Date(now).toISOString(),mode,items,index:0,responses:{},recorded:new Set(),skipped:new Set(),checkedAttempts:[],attemptIds:{},orders:{},elapsedMs:0,runningSince:now,startedAt:now,deadline:seconds?now+seconds*1000:null,done:false};
  for(const a of items){state.session.orders[a.id]=shuffle(a.options||a.pairs||a.items).map(x=>x.id);state.session.attemptIds[a.id]=crypto.randomUUID();if(a.type==='order')state.session.responses[a.id]=[...state.session.orders[a.id]];}
  state.pendingChapter=null;checkpoint();render(true);startClock();
}
function moveQuestion(delta,skip=false) {
  const s=state.session;if(!s || s.done)return;
  const a=s.items[s.index];
  if(delta>0 && s.mode!=='exam' && !s.recorded.has(a.id) && !skip)return;
  if(skip && !s.recorded.has(a.id))s.skipped.add(a.id);
  if(delta>0 && s.index===s.items.length-1){finishSession();return;}
  s.index=Math.max(0,s.index+delta);closeSource();checkpoint();render(true);
}

function activityView() {
  const s = state.session;
  if (s.done) return resultsView();
  const a = s.items[s.index], response = s.responses[a.id], graded = s.recorded.has(a.id), exam = s.mode === 'exam';
  const answerOrder = s.orders[a.id], correct = scoreActivity(a, response);
  const complete = completeResponse(a, response);
  let interaction = '';
  if (a.type === 'mcq' || a.type === 'diagram') {
    if (a.type === 'diagram') interaction += `<figure class="diagram"><img src="${url(`subjects/${subject.id}/${a.asset.path}`)}" alt="${esc(a.asset.alt || 'Source diagram for this activity')}"><figcaption>Original lecture diagram · PDF page ${a.asset.pdfPage}</figcaption></figure>`;
    interaction += `<div class="options" role="group" aria-label="Answer choices">${answerOrder.map((id, i) => {
      const o = a.options.find(x => x.id === id), chosen = response === id;
      const cls = graded ? id === a.correctOptionId ? 'correct' : chosen ? 'incorrect' : '' : chosen ? 'selected' : '';
      return `<button id="option-${esc(id)}" class="option ${cls}" data-option="${esc(id)}" ${graded ? 'disabled' : ''} aria-pressed="${chosen}"><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span>${graded && id === a.correctOptionId ? '<span class="option-mark" aria-label="Correct answer">✓</span>' : graded && chosen ? '<span class="option-mark" aria-label="Your incorrect answer">×</span>' : ''}</button>`;
    }).join('')}</div>`;
  } else if (a.type === 'match') {
    interaction = `<div class="match-list">${a.pairs.map(p => `<label class="match-row ${graded ? response[p.id] === p.id ? 'match-correct' : 'match-wrong' : ''}"><span>${esc(p.left)}</span><select id="match-${esc(p.id)}" data-match="${esc(p.id)}" ${graded ? 'disabled' : ''} aria-label="Match ${esc(p.left)}"><option value="">Choose a match</option>${answerOrder.map(id => `<option value="${esc(id)}" ${response?.[p.id] === id ? 'selected' : ''}>${esc(a.pairs.find(q => q.id === id).right)}</option>`).join('')}</select>${graded ? `<small>${response[p.id] === p.id ? '✓ Correct' : `Correct match: ${esc(p.right)}`}</small>` : ''}</label>`).join('')}</div>`;
  } else if (a.type === 'order') {
    interaction = `<p class="small muted">Use the arrows to arrange the steps, then check the sequence.</p><ol class="order-list">${response.map((id, i) => `<li><span class="step-number">${i + 1}</span><span>${esc(a.items.find(x => x.id === id).text)}</span><div><button id="order-${esc(id)}-up" class="order-move" data-move="${i}" data-delta="-1" aria-label="Move step ${i + 1} up" ${i === 0 || graded ? 'disabled' : ''}>↑</button><button id="order-${esc(id)}-down" class="order-move" data-move="${i}" data-delta="1" aria-label="Move step ${i + 1} down" ${i === response.length - 1 || graded ? 'disabled' : ''}>↓</button></div></li>`).join('')}</ol>`;
  }
  const saved=study.bookmarks.some(b=>b.activityId===a.id&&b.saved);
  return `<div class="session-top"><div>${badge(exam?'Exam':s.mode==='drills'?'Concept drill':'Practice')}<span>${s.index+1} / ${s.items.length}</span>${exam?s.deadline?`<span class="timer" id="timer" aria-label="Time remaining">${formatTime((s.deadline-Date.now())/1000)}</span>`:'':`<span class="timer" aria-label="Practice elapsed time">◷ <span id="elapsed">${formatTime(Math.floor(elapsedSession(s)/1000))}</span></span>`}</div><div>${!exam?'<button class="text-button" data-action="save-exit">Save & exit</button>':''}<button class="text-button" data-action="finish">Finish ${exam?'exam':'session'}</button></div></div><div class="session-progress"><span style="width:${(s.index+1)/s.items.length*100}%"></span></div><article class="question"><div class="question-tools"><p class="eyebrow">${esc(lectureTitle(a.lectureId))}</p><button class="text-button save-question" data-bookmark="${esc(a.id)}" aria-pressed="${saved}">${saved?'★ Saved':'☆ Save question'}</button></div><h1 class="question-prompt" tabindex="-1">${esc(a.prompt)}</h1>${interaction}${!exam&&!graded&&(a.type==='match'||a.type==='order'||!state.settings.instantCheck)?`<button class="button primary check-button" data-action="check" ${complete?'':'disabled'}>Check answer</button>`:''}${graded?`<section class="feedback ${correct?'positive':'negative'}" id="feedback" tabindex="-1" aria-live="polite"><div class="feedback-head"><strong>${correct?'✓ Correct':'↻ Incorrect'}</strong>${languageToggle()}</div><p class="explanation" lang="${state.settings.explanationLanguage}" dir="${state.settings.explanationLanguage==='ar'?'rtl':'ltr'}">${esc(a.explanation[state.settings.explanationLanguage])}</p>${refsHTML(a)}${a.type==='order'&&!correct?`<p class="small">Correct sequence: ${a.acceptedGroups.map(g=>g.map(id=>esc(a.items.find(i=>i.id===id).text)).join(' / ')).join(' → ')}</p>`:''}</section>`:''}</article><div class="session-dock" aria-label="Question navigation"><div class="dock-buttons"><button class="button outline" data-action="previous" ${s.index?'':'disabled'}>← Previous</button>${!exam&&!graded?'<button class="button outline" data-action="skip">Skip</button>':''}<button class="button primary" data-action="next" ${!exam&&!graded?'disabled':''}>${s.index===s.items.length-1?'Finish':'Next →'}</button></div><p class="shortcut-hint">1–5 choose · Enter check/next · + slide · − previous</p></div><p class="session-save-status small muted">${!exam?(state.studySaved?'Session saved on this device':'Session kept for this visit · export a backup'):'Answers are scored when the exam ends.'}</p><details class="question-list" id="session-question-list"><summary>Question list · ${s.recorded.size} checked${s.skipped.size?` · ${s.skipped.size} skipped`:''}</summary><nav class="exam-map" aria-label="Session questions">${s.items.map((item,i)=>`<button data-question="${i}" class="${i===s.index?'current':''} ${s.recorded.has(item.id)||exam&&completeResponse(item,s.responses[item.id])?'answered':''} ${s.skipped.has(item.id)&&!s.recorded.has(item.id)?'skipped':''}" aria-label="Question ${i+1}${s.skipped.has(item.id)&&!s.recorded.has(item.id)?', skipped':''}" ${i===s.index?'aria-current="step"':''}>${i+1}</button>`).join('')}</nav></details>`;

}
function languageToggle() {
  return `<div class="language-toggle" aria-label="Explanation language">${explanationLanguages().map(code => `<button data-language="${esc(code)}" class="${state.settings.explanationLanguage === code ? 'active' : ''}" aria-pressed="${state.settings.explanationLanguage === code}" lang="${esc(code)}">${code === 'ar' ? 'عربي' : esc(code.toUpperCase())}</button>`).join('')}</div>`;
}
function responseDetails(row) {
  const a = row.activity;
  if (a.options) return `<p class="small">Your answer: <strong>${esc(a.options.find(o => o.id === row.response)?.text || 'Unanswered')}</strong></p><p class="small">Correct answer: <strong>${esc(a.options.find(o => o.id === a.correctOptionId)?.text)}</strong></p>`;
  if (a.type === 'match') return `<div class="response-scroll"><table class="match-result-table"><thead><tr><th>Concept</th><th>Your match</th><th>Source match</th></tr></thead><tbody>${a.pairs.map(p => `<tr><td>${esc(p.left)}</td><td>${row.response?.[p.id] === p.id ? '✓ ' : '↻ '}${esc(a.pairs.find(q => q.id === row.response?.[p.id])?.right || 'Unanswered')}</td><td>${esc(p.right)}</td></tr>`).join('')}</tbody></table></div>`;
  if (a.type === 'order') return `<div class="sequence-results"><div><strong>Your sequence</strong><ol>${(row.response || []).map(id => `<li>${esc(a.items.find(i => i.id === id)?.text)}</li>`).join('')}</ol></div><div><strong>Correct sequence</strong><ol>${a.acceptedGroups.map(group => `<li>${group.map(id => esc(a.items.find(i => i.id === id).text)).join(' · ')}</li>`).join('')}</ol>${a.acceptedGroups.some(g => g.length > 1) ? '<p class="small muted">Steps on the same line may appear in either order.</p>' : ''}</div></div>`;
  return '';
}
function checkPractice() {
  const s = state.session, a = s.items[s.index];
  if (s.mode === 'exam' || s.recorded.has(a.id) || !completeResponse(a, s.responses[a.id])) return;
  record(a, s.responses[a.id], s.mode === 'drills' ? 'drill' : s.mode);
  s.recorded.add(a.id);
  s.skipped.delete(a.id);checkpoint();
  render();
  $('#feedback')?.focus({ preventScroll: true });
}
async function finishSession(expired = false) {
  const s = state.session;
  if (!s || s.done) return;
  if (expired && resolveConfirmation) resolveConfirmation(false);
  const all = examResult(s.items, s.responses), unanswered = all.filter(x => !x.answered).length;
  if (s.mode === 'exam' && !expired && unanswered && !await confirmAction(`Finish with ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}?`, 'Finish exam')) return;
  if (s.done) return;
  if (s.mode === 'exam') {
    for (const row of all.filter(x => x.answered)) record(row.activity, row.response, 'exam');
    s.results = all;
  } else s.results = all.filter(x => s.recorded.has(x.activity.id));
  if(s.mode!=='exam'){s.elapsedMs=elapsedSession(s);s.runningSince=null;}
  s.done = true; s.expired = expired; s.endedAt = expired && s.deadline ? s.deadline : Date.now(); clearInterval(tick);checkpoint();
  render(true);
}
function resultsView() {
  const s = state.session, rows = s.results, correct = rows.filter(r => r.correct).length, unanswered = rows.filter(r => !r.answered).length;
  const missedIds = [...new Set(rows.filter(r => r.answered && !r.correct).flatMap(r => r.activity.conceptIds))];
  const variants = activities.filter(a => a.conceptIds.some(id => missedIds.includes(id)) && !s.items.some(i => i.id === a.id));
  return pageHead(s.mode === 'exam' ? 'EXAM RESULTS' : 'SESSION RESULTS', rows.length ? 'Another piece connected.' : 'Ready when you are.', s.expired ? (state.progressSaved ? 'Time is up. Completed responses are saved on this device.' : 'Time is up. Completed responses are kept for this visit; export a backup to retain them.') : 'A useful snapshot of this session.') + `${s.mode!=='exam'?`<p class="practice-completion">${rows.length} of ${s.items.length} questions answered · ${s.items.length-rows.length} skipped / unanswered</p>`:''}<section class="result-banner"><div><span class="score">${correct}<small> / ${rows.length}</small></span><p>correct in this session</p></div><div><strong>${rows.length ? Math.round(correct / rows.length * 100) : 0}%</strong><p>session accuracy</p></div><div><strong>${formatTime((s.mode==='exam'?s.endedAt-s.startedAt:s.elapsedMs)/1000)}</strong><p>time spent</p></div>${unanswered ? `<div><strong>${unanswered}</strong><p>unanswered</p></div>` : ''}</section><div class="button-row result-actions">${s.mode!=='exam'&&s.items.some(a=>!s.recorded.has(a.id))?`<button class="button outline" data-action="revisit-skipped">Revisit ${s.items.filter(a=>!s.recorded.has(a.id)).length} skipped / unanswered</button>`:''}${variants.length ? `<button class="button primary" data-action="follow-up">Try ${Math.min(10, variants.length)} different follow-up activities ↗</button>` : `<button class="button primary" data-action="new-session">Choose another session ↗</button>`}<button class="button outline" data-go="progress">View progress</button></div><p class="small muted">${s.mode === 'exam' ? 'Unanswered questions are included in the exam score. Only completed responses contribute concept evidence.' : 'Coverage and results are tracked separately. Repeating an item does not increase its distinct-item evidence.'}</p><div class="section-head"><h2>Review the connections</h2>${languageToggle()}</div><div class="result-list">${rows.map((row, i) => {
    const a = row.activity;
    const chosen = a.options?.find(o => o.id === row.response)?.text;
    const answer = a.options?.find(o => o.id === a.correctOptionId)?.text;
    return `<details id="result-${esc(a.id)}" class="result-row"><summary><span class="result-icon ${row.correct ? 'good' : 'bad'}">${row.correct ? '✓' : row.answered ? '↻' : '—'}</span><span>${i + 1}. ${esc(a.prompt)}</span><span>+</span></summary><div class="result-detail"><button class="text-button" data-bookmark="${esc(a.id)}">${study.bookmarks.some(b=>b.activityId===a.id&&b.saved)?'★ Saved':'☆ Save question'}</button>${responseDetails(row)}<p class="explanation" lang="${state.settings.explanationLanguage}" dir="${state.settings.explanationLanguage === 'ar' ? 'rtl' : 'ltr'}">${esc(a.explanation[state.settings.explanationLanguage])}</p>${refsHTML(a)}</div></details>`;
  }).join('')}</div>`;
}

function progressView() {
  const s = summary();
  const filtered = concepts.filter(c => (state.chapterFilter === 'all' || c.lectureId === state.chapterFilter) && (state.progressFilter === 'all' || s.evidence.get(c.id).state === state.progressFilter));
  return pageHead('PROGRESS', 'See what the evidence says.', 'Coverage records what you have encountered. Performance reflects distinct, automatically scored activities.') + answerTotalsHTML() + `${progress.historyLimited ? '<p class="small muted history-note">Evidence reflects retained history. Older attempts were removed at the portable history limit.</p>' : ''}<div class="evidence-grid">${Object.entries(EVIDENCE_LABELS).map(([key, label]) => `<button class="evidence-card ${key} ${state.progressFilter === key ? 'active' : ''}" data-evidence="${key}"><strong>${s.counts[key]}</strong><span>${label}</span></button>`).join('')}</div><section class="panel progress-explainer"><div><h2>${s.encountered} of ${s.total} concepts encountered</h2><p>${s.available} have validated activities. ${s.total - s.available} remain in the source index without an activity.${progress.archivedAttempts?.length ? ` ${progress.archivedAttempts.length} historical responses from earlier activity versions are retained in backups, outside current evidence.` : ''}</p></div><details><summary>How evidence is counted</summary><p>One or two distinct activities means limited evidence. Consistent performance needs at least three distinct activities, at least 80% correct on their latest attempts, and no error in the latest three distinct activities.</p><p>These results describe cued recognition and concept activities. Reading a PDF does not count as an answer. Concepts with fewer than three activity variants stay at limited evidence.</p></details></section><section class="panel backup-panel"><div><p class="eyebrow">TAKE YOUR PROGRESS WITH YOU</p><h2>Back up. Restore. Keep going.</h2><p>Save a JSON backup before changing browsers or devices. Imports merge without counting the same attempt twice.</p></div><div class="button-row"><button class="button outline" data-action="export">Export progress ↓</button><button class="button outline" data-action="import">Import backup ↑</button></div></section><div class="section-head"><h2>Concept by concept</h2><div class="filter-row"><select id="progress-chapter" aria-label="Filter by chapter"><option value="all">All chapters</option>${chapters.map(ch => `<option value="${esc(ch.id)}" ${state.chapterFilter === ch.id ? 'selected' : ''}>${esc(ch.title)}</option>`).join('')}</select><select id="progress-evidence" aria-label="Filter by evidence"><option value="all">All evidence</option>${Object.entries(EVIDENCE_LABELS).map(([id, label]) => `<option value="${id}" ${state.progressFilter === id ? 'selected' : ''}>${label}</option>`).join('')}</select></div></div><div class="concept-list">${filtered.map(c => {
    const e = s.evidence.get(c.id);
    return `<details id="concept-${esc(c.id)}" class="concept-row"><summary><span class="state-dot ${e.state}"></span><span><strong>${esc(c.label)}</strong><small>${esc(lectureTitle(c.lectureId))}</small></span><span class="concept-state">${EVIDENCE_LABELS[e.state]}<small>${e.distinct} distinct ${e.distinct === 1 ? 'activity' : 'activities'}</small></span></summary><div class="concept-detail"><p>${c.details.map(esc).join(' ')}</p><p class="small muted">${c.activityIds.length} validated ${c.activityIds.length === 1 ? 'activity' : 'activities'} · ${esc(c.priority)} coverage priority</p>${refsHTML(c)}</div></details>`;
  }).join('') || '<div class="empty-state"><p>No concepts match this filter.</p></div>'}</div>`;
}
function materialsView() {
  return pageHead('MATERIALS', 'Keep the source close.', `${lectures.length} original lecture PDFs, indexed by PDF page. All teaching content is in your ${esc(subject.scope.title.toLowerCase())} scope.`) + `<div class="source-summary"><div><strong>${coverage.teachingPages}</strong><span>teaching pages</span></div><div><strong>${coverage.indexedConcepts}</strong><span>indexed concepts</span></div><div><strong>${coverage.excludedPages}</strong><span>covers / admin pages</span></div></div><div class="materials-list">${lectures.map((l, i) => `<article class="material-row"><span class="chapter-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(l.title)}</h2><p>${l.pdf_pages} PDF pages · ${chapters.find(ch => ch.id === l.id).teachingPages.length} teaching pages</p><small>${esc(l.original_filename)}</small></div><div class="material-actions"><button class="button outline" data-source="${esc(l.id)}" data-page="${chapters.find(ch => ch.id === l.id).teachingPages[0]}">View PDF ↗</button><a class="text-button" href="${sourceURL({ lectureId: l.id, pdfPage: 1 }).split('#')[0]}" download>Download ↓</a></div></article>`).join('')}</div><section class="two-up resource-links"><a class="panel" href="${url(`subjects/${subject.id}/${subject.paths.studySource}`)}" download><p class="eyebrow">THE COMPLETE EXTRACTION</p><h2>A source you can keep.</h2><p>Detailed Markdown with page references, diagrams, tables, and source notes.</p><strong>Download study source ↓</strong></a><a class="panel" href="${url(`subjects/${subject.id}/source-analysis/coverage-ledger.csv`)}" download><p class="eyebrow">COVERAGE LEDGER</p><h2>Every page accounted for.</h2><p>Page scope, concept links, exclusions, and activity availability.</p><strong>Download ledger ↓</strong></a></section><section class="panel source-notes"><details><summary>Source notes · ${uncertainties.length} entries</summary><p class="small muted">Unclear or conflicting claims are preserved here and held out of scored answers. References below use PDF pages; printed slide numbers were not visible.</p>${uncertainties.map(u => `<article><strong>${esc(lectureTitle(u.lectureId))} · PDF p${u.pdfPage}</strong><p>${esc(u.description)}</p><button class="text-button" data-source="${esc(u.lectureId)}" data-page="${u.pdfPage}">View source ↗</button></article>`).join('')}</details></section>`;
}
function settingsView() {
  return pageHead('SETTINGS', 'Make this space yours.', 'Study preferences are saved in this browser.') + `<form id="settings-form" class="settings-panel panel"><section><p class="eyebrow">ANSWER CHECKING</p><h2>When should practice check?</h2><label class="radio-row"><input type="radio" name="checking" value="instant" ${state.settings.instantCheck ? 'checked' : ''}><span><strong>When I click an option</strong><small>Show feedback immediately.</small></span></label><label class="radio-row"><input type="radio" name="checking" value="confirm" ${!state.settings.instantCheck ? 'checked' : ''}><span><strong>After I confirm</strong><small>Select an option, then check the answer.</small></span></label><p class="small muted">Exam feedback always follows the session. Matching and ordering check on submission. Diagram choices follow the practice preference.</p></section><section><p class="eyebrow">READING & EXPLANATIONS</p><label class="setting-field">Explanation language<select name="language" lang="${esc(state.settings.explanationLanguage)}">${explanationLanguages().map(code => `<option lang="${esc(code)}" value="${esc(code)}" ${state.settings.explanationLanguage === code ? 'selected' : ''}>${esc(languageName(code))}${code === 'ar' && subject.languages.retainEnglishTechnicalTerms ? ' · English technical terms' : ''}</option>`).join('')}</select></label><label class="setting-field">Text size<select name="textSize"><option value="normal" ${state.settings.textSize === 'normal' ? 'selected' : ''}>Standard</option><option value="large" ${state.settings.textSize === 'large' ? 'selected' : ''}>Larger</option></select></label><label class="setting-field">Open source references<select name="sourceLayout"><option value="side" ${state.settings.sourceLayout === 'side' ? 'selected' : ''}>Side by side when space allows</option><option value="full" ${state.settings.sourceLayout === 'full' ? 'selected' : ''}>Full screen</option></select></label><label class="toggle-row"><span>Reduce motion</span><input type="checkbox" name="reducedMotion" role="switch" ${state.settings.reducedMotion ? 'checked' : ''}></label></section><button class="button primary" type="submit">Save preferences ✓</button></form><section class="panel settings-data"><div><h2>Your device, your progress.</h2><p>Use backups to move your progress between browsers or devices.</p></div><button class="button outline" data-go="progress">Back up & restore ↗</button><button class="danger-link" data-action="clear-progress">Clear this subject’s progress</button></section>`;
}

function render(focusMain = false) {
  const active = document.activeElement?.id;
  const openDetails = [...document.querySelectorAll('#main details[open][id]')].map(node => node.id);
  $('#main').innerHTML = state.session ? activityView() : state.view === 'home' ? home() : ['practice', 'exam', 'drills', 'review'].includes(state.view) ? setup(state.view) : state.view === 'progress' ? progressView() : state.view === 'materials' ? materialsView() : state.view === 'saved' ? savedView() : state.view === 'updates' ? updatesView() : settingsView();
  $('.workspace').classList.toggle('is-session',Boolean(state.session&&!state.session.done));
  $('#view-label').textContent = names[state.view];
  document.querySelectorAll('[data-go]').forEach(button => {
    if (button.closest('nav')) { button.classList.toggle('active', button.dataset.go === state.view); if (button.dataset.go === state.view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); }
  });
  document.title = `${names[state.view]} · Study Atlas`;
  applySettings();
  openDetails.forEach(id => { const node = document.getElementById(id); if (node) node.open = true; });
  if ($('#session-setup')) updateSetup();
  if (focusMain) { $('#main h1')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  else if (active) document.getElementById(active)?.focus({ preventScroll: true });
  if(state.view==='updates'&&!state.session)requestAnimationFrame(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
}
async function go(view) {
  if (!routes.includes(view)) return;
  if (state.session?.mode==='exam' && !state.session.done && !await confirmAction('An unfinished exam will be left unscored.', 'Leave exam')) return;
  const saved=pauseSession();
  if(!saved&&!await confirmAction('The session place could not be saved. Checked answers remain in your current progress. Leave without saving this place?','Leave without saving')){state.session.runningSince=Date.now();startClock();return;}
  state.session = null; clearInterval(tick); state.view = view; closeSource();
  history.pushState(null, '', `#${view}`); render(true);
}
function updateSetup() {
  const form = $('#session-setup'); if (!form) return;
  const selected = [...form.querySelectorAll('.chapter-check:checked')].map(x => x.value), mode = form.dataset.mode;
  const weak = new Set(mode === 'review' ? weakConcepts() : []);
  const n = activities.filter(a => typesFor(mode).includes(a.type) && selected.includes(a.lectureId) && (mode !== 'review' || a.conceptIds.some(c => weak.has(c)))).length;
  const input = $('#session-count'); input.max = n;
  if (Number(input.value) > n || Number(input.value) < 1) input.value = Math.min(n, subject.assessment.recommendedPracticeCount);
  $('#available-count').textContent = `${n} available in your selection`;
  $('#start-session').disabled = !n;
}

function openSource(lectureId, pdfPage, full = false) {
  const lecture = lectures.find(l => l.id === lectureId); if (!lecture) return;
  sourceReturnFocus = document.activeElement;
  state.source = { lectureId, pdfPage: Math.max(1, Math.min(Number(pdfPage) || 1, lecture.pdf_pages)), full };
  renderSource();
}
function renderSource() {
  if (!state.source) return;
  const activeControl = document.activeElement?.closest('#source-host') ? document.activeElement.id : null;
  const s = state.source, l = lectures.find(x => x.id === s.lectureId), full = s.full || state.settings.sourceLayout === 'full' || matchMedia('(max-width: 1100px)').matches;
  const noteCount = uncertainties.filter(u => u.lectureId === s.lectureId && u.pdfPage === s.pdfPage).length;
  const pageRecord = pages.find(p => p.lectureId === s.lectureId && p.pdfPage === s.pdfPage);
  const printedLabel = pageRecord?.printedSlide ? `Printed slide ${esc(pageRecord.printedSlide)}` : 'Printed slide number not shown';
  const pageImage = sourceImages.find(p => p.lectureId === s.lectureId && p.pdfPage === s.pdfPage);
  const pageMarkup = pageImage ? `<div class="source-page-scroll ${s.zoom ? 'zoomed' : ''}"><img src="${url(`subjects/${subject.id}/sources/${pageImage.path}`)}" width="${pageImage.width}" height="${pageImage.height}" alt="${esc(l.title)}, PDF page ${s.pdfPage}"></div>` : `<div class="source-page-fallback"><p>This page is available in the original PDF.</p><a class="button outline" href="${sourceURL(s)}" target="_blank" rel="noopener">Open original PDF ↗</a></div>`;
  const content = `<header class="source-header"><div><p class="eyebrow">ORIGINAL SOURCE</p><h2 id="source-title">${esc(l.title)}</h2></div><button id="source-close" class="icon-button" data-action="close-source" aria-label="Close source">×</button></header><div class="source-toolbar"><button id="source-prev" class="icon-button" data-source-step="-1" aria-label="Previous PDF page" ${s.pdfPage <= 1 ? 'disabled' : ''}>←</button><form id="source-jump" class="source-jump" novalidate><label>PDF page <input id="source-page" type="number" min="1" max="${l.pdf_pages}" value="${s.pdfPage}" aria-label="PDF page number"> / ${l.pdf_pages}</label><button id="source-go" class="text-button" type="submit">Go</button></form><button id="source-next" class="icon-button" data-source-step="1" aria-label="Next PDF page" ${s.pdfPage >= l.pdf_pages ? 'disabled' : ''}>→</button>${!full ? '<button class="text-button" data-action="full-source">Full screen ↗</button>' : ''}<button id="source-zoom" class="text-button" data-action="source-zoom" aria-pressed="${Boolean(s.zoom)}">${s.zoom ? 'Fit width' : 'Zoom in'}</button><a class="text-button" href="${sourceURL(s)}" target="_blank" rel="noopener">Open PDF ↗</a></div>${noteCount ? `<p class="source-page-note">${noteCount} source ${noteCount === 1 ? 'note' : 'notes'} on this page. Unclear claims are held out of scoring.</p>` : ''}${pageMarkup}<p class="source-foot">Rendered from original PDF · ${printedLabel}. <a href="${sourceURL(s)}" target="_blank" rel="noopener">Open directly if the viewer is unavailable.</a></p>`;
  $('#source-host').innerHTML = full ? `<dialog class="source-dialog" aria-labelledby="source-title">${content}</dialog>` : `<aside class="source-panel" aria-label="Source viewer">${content}</aside>`;
  $('.workspace').classList.toggle('with-source', !full);
  const dialog = $('#source-host dialog');
  if (dialog) { dialog.addEventListener('cancel', event => { event.preventDefault(); closeSource(); }); dialog.showModal(); }
  if (activeControl) { const control = document.getElementById(activeControl); (control && !control.disabled ? control : $('#source-page'))?.focus({ preventScroll: true }); }
}
function closeSource() {
  state.source = null;
  if ($('#source-host')) $('#source-host').innerHTML = '';
  $('.workspace')?.classList.remove('with-source');
  if (sourceReturnFocus?.isConnected) sourceReturnFocus.focus({ preventScroll: true });
  else $('#main h1')?.focus({ preventScroll: true });
}

document.addEventListener('click', async event => {
  const b = event.target.closest('button, a'); if (!b) return;
  if (b.classList.contains('skip-link')) { event.preventDefault(); $('#main')?.focus(); return; }
  if (state.session?.mode === 'exam' && !state.session.done && state.session.deadline && Date.now() >= state.session.deadline) { event.preventDefault(); finishSession(true); return; }
  if (b.dataset.resume) { resumePractice(b.dataset.resume); return; }
  if (b.dataset.removeSession) { if(await confirmAction('Remove this unfinished session? Completed answers stay in progress.','Remove session')){study=removeSession(study,b.dataset.removeSession);saveStudyState();render();} return; }
  if (b.dataset.bookmark) { try{const saved=study.bookmarks.some(r=>r.activityId===b.dataset.bookmark&&r.saved);study=bookmark(study,b.dataset.bookmark,!saved);saveStudyState();render();}catch(error){notice(error.message,true);}return; }
  if (b.dataset.go) { event.preventDefault(); go(b.dataset.go); return; }
  if (b.dataset.source) { openSource(b.dataset.source, b.dataset.page); return; }
  if (b.dataset.chapterPractice) { state.pendingChapter = b.dataset.chapterPractice; go('practice'); return; }
  if (b.dataset.count) { $('#session-count').value = Math.min(Number(b.dataset.count), Number($('#session-count').max)); return; }
  if (b.dataset.language) { state.settings.explanationLanguage = b.dataset.language; saveSettings(storage, state.settings); render(); return; }
  if (b.dataset.evidence) { state.progressFilter = state.progressFilter === b.dataset.evidence ? 'all' : b.dataset.evidence; render(); return; }
  if (b.dataset.sourceStep) { state.source.pdfPage += Number(b.dataset.sourceStep); renderSource(); return; }
  const s = state.session, a = s?.items[s.index];
  if (b.dataset.option && a && !s.done && !s.recorded.has(a.id)) {
    s.responses[a.id] = b.dataset.option;
    if (s.mode !== 'exam' && state.settings.instantCheck) checkPractice(); else {checkpoint();render();}
    return;
  }
  if (b.dataset.question !== undefined && s && !s.done) { s.index = Number(b.dataset.question);closeSource();checkpoint();render(true);return; }
  if (b.dataset.move !== undefined && a && !s.recorded.has(a.id)) {
    const i = Number(b.dataset.move), j = i + Number(b.dataset.delta), response = s.responses[a.id];
    const itemId = response[i], direction = Number(b.dataset.delta) < 0 ? 'up' : 'down';
    if (j >= 0 && j < response.length) [response[i], response[j]] = [response[j], response[i]];
    checkpoint();render();
    const focus = document.getElementById(`order-${itemId}-${direction}`), other = document.getElementById(`order-${itemId}-${direction === 'up' ? 'down' : 'up'}`);
    (focus && !focus.disabled ? focus : other)?.focus({ preventScroll: true }); return;
  }
  switch (b.dataset.action) {
    case 'dismiss': state.notice = null; $('#notice').innerHTML = ''; break;
    case 'toggle-chapters': { const checkboxes = [...$('#session-setup').querySelectorAll('.chapter-check:not(:disabled)')], all = checkboxes.every(x => x.checked); checkboxes.forEach(x => { x.checked = !all; }); updateSetup(); break; }
    case 'all-available': $('#session-count').value=$('#session-count').max;break;
    case 'check': checkPractice(); break;
    case 'previous': moveQuestion(-1); break;
    case 'next': moveQuestion(1); break;
    case 'skip': moveQuestion(1,true); break;
    case 'save-exit': if(!pauseSession()){s.runningSince=Date.now();startClock();return;}state.session=null;state.view='practice';history.replaceState(null,'','#practice');render(true);break;
    case 'notes': notesPreview();break;
    case 'revisit-skipped': launch(s.items.filter(item=>!s.recorded.has(item.id)),s.mode);break;
    case 'finish': finishSession(); break;
    case 'new-session': state.session = null; render(true); break;
    case 'follow-up': { const ids = [...new Set(s.results.filter(r => r.answered && !r.correct).flatMap(r => r.activity.conceptIds))]; const next = selectActivities(activities, concepts, progress.attempts, { types: typesFor('review'), conceptIds: ids, excludeIds: s.items.map(i => i.id), count: 10 }); state.view = 'review'; history.replaceState(null, '', '#review'); launch(next, 'review'); break; }
    case 'export': exportBackup();break;
    case 'import': $('#backup-file').click(); break;
    case 'clear-progress': if (await confirmAction(`Clear ${subject.title} progress and unfinished sessions on this device? Saved questions are kept. Export a backup first.`, 'Clear progress')) { progress = resetProgress(progress); const saved = persist();for(const item of study.sessions.filter(v=>!v.deleted))study=removeSession(study,item.id);saveStudyState();state.session=null;render(); notice(saved ? 'This subject’s progress has been cleared. Saved questions are kept.' : 'Cleared for this visit. Browser storage could not be updated; previously saved progress may return after a reload.', !saved); } break;
    case 'close-source': closeSource(); break;
    case 'full-source': state.source.full = true; renderSource(); break;
    case 'source-zoom': state.source.zoom = !state.source.zoom; renderSource(); break;
  }
});
document.addEventListener('change', async event => {
  const input = event.target;
  if (input.id === 'subject-select' && input.value !== subject.id) {
    if (state.session?.mode==='exam' && !state.session.done && !await confirmAction('An unfinished exam will be left unscored.', 'Change subject')) { input.value = subject.id; return; }
    pauseSession();state.session = null; clearInterval(tick);
    const destination = new URL(location.href); destination.searchParams.set('subject', input.value); destination.hash = 'home'; location.assign(destination.href); return;
  }
  if (input.matches('.chapter-check')) updateSetup();
  if (input.id === 'use-timer') $('#timer-minutes').disabled = !input.checked;
  if (input.id === 'progress-chapter') { state.chapterFilter = input.value; render(); }
  if (input.id === 'progress-evidence') { state.progressFilter = input.value; render(); }
  if (input.dataset.match) {
    const s = state.session, a = s.items[s.index]; if (s.recorded.has(a.id)) return;
    const r = s.responses[a.id] ||= {};
    for (const id of Object.keys(r)) if (r[id] === input.value && id !== input.dataset.match) delete r[id];
    if (input.value) r[input.dataset.match] = input.value; else delete r[input.dataset.match];
    checkpoint();render();
  }
  if (input.id === 'backup-file' && input.files[0]) {
    try {
      const file = input.files[0]; if (file.size > MAX_BACKUP_BYTES) throw new Error('This backup is too large (maximum 8 MB).');
      const incoming = parseBackup(await file.text(), subject.id, subject.scope.id, activities);
      const merged = mergeProgress(progress, incoming), added = merged.attempts.length - progress.attempts.length;
      let mergedStudy=study;
      if(incoming.studyState){const restored=structuredClone(incoming.studyState);for(const s of restored.sessions)if(!s.deleted){s.generation=merged.generation;if(study.sessions.some(v=>v.id===s.id&&v.deleted))s.id='restored-'+s.id;}mergedStudy=validateStudy(mergeStudy(study,restored),subject.id,subject.scope.id);}
      progress=merged;study=mergedStudy;const saved=persist();
      const studySaved=saveStudyState();render(); notice(saved&&studySaved ? `Backup restored. ${added} new attempt${added === 1 ? '' : 's'} merged.` : `Backup merged for this visit. Some data could not be saved to browser storage; keep your backup file.`, !saved||!studySaved);
    } catch (error) { notice(error.message, true); }
    input.value = '';
  }
});
document.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'source-jump' && state.source) {
    const lecture = lectures.find(l => l.id === state.source.lectureId);
    state.source.pdfPage = Math.max(1, Math.min(Math.floor(Number($('#source-page').value)) || 1, lecture.pdf_pages));
    renderSource(); return;
  }
  if (event.target.id === 'session-setup') startSession(event.target);
  if (event.target.id === 'settings-form') {
    const data = new FormData(event.target);
    state.settings = { instantCheck: data.get('checking') === 'instant', explanationLanguage: data.get('language'), textSize: data.get('textSize'), sourceLayout: data.get('sourceLayout'), reducedMotion: data.has('reducedMotion') };
    const saved = saveSettings(storage, state.settings); render(); notice(saved ? 'Preferences saved.' : 'Preferences apply for this visit. Browser storage is unavailable.', !saved);
  }
});
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.source){closeSource();return;}
  if(event.defaultPrevented||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.target.closest('input,select,textarea,[contenteditable="true"]'))return;
  if(document.querySelector('dialog[open]')){if(event.key==='+'&&state.source){event.preventDefault();closeSource();}return;}
  const s=state.session;if(!s||s.done)return;
  if(s.mode==='exam'&&s.deadline&&Date.now()>=s.deadline){finishSession(true);return;}
  if(event.key==='+'){event.preventDefault();if(state.source)closeSource();else if(s.mode!=='exam'){const ref=s.items[s.index].sourceRefs[0];openSource(ref.lectureId,ref.pdfPage);}return;}
  if(state.source)return;
  if(/^[1-5]$/.test(event.key)){const button=document.querySelectorAll('.option')[Number(event.key)-1];if(button&&!button.disabled){event.preventDefault();button.click();}return;}
  if(event.key==='-'){event.preventDefault();moveQuestion(-1);return;}
  if(event.key==='Enter'&&(!event.target.closest('button,a,summary')||event.target.closest('.option'))){event.preventDefault();const check=$('[data-action="check"]');if(check&&!check.disabled)check.click();else moveQuestion(1);}
});
window.addEventListener('storage', event => {
  if(!subject||!progress)return;
  if(event.key===studyKey(subject.id,subject.scope.id)){const loaded=loadStudy(storage,subject.id,subject.scope.id);if(!loaded.warning){study=mergeStudy(study,loaded.study);saveStudyState();if(state.session&&study.sessions.some(s=>s.id===state.session.id&&s.deleted)){clearInterval(tick);state.session=null;notice('This session was finished or removed in another tab. Completed answers are kept.');render(true);}else if(!state.session||state.session.done)render();}return;}
  if(event.key!==null&&event.key!==progressKey(subject.id,subject.scope.id))return;
  if (event.newValue === null) {
    progress = resetProgress(progress); state.progressSaved = false;
    notice('Progress was cleared in another tab. New completed activities will start a fresh history.');
  } else {
    state.progressSaved = saveProgress(storage, progress, activities);
    if (!state.progressSaved) notice('Progress from another tab could not be saved. Export a backup to keep this visit’s history.', true);
  }
  if(state.session?.mode!=='exam'&&state.session&&state.session.generation!==progress.generation){clearInterval(tick);state.session=null;notice('Progress was cleared in another tab. The earlier session has been closed.');}
  if (!state.session || state.session.done) render();
});
window.addEventListener('beforeunload',event=>{
  const s=state.session;if(!s||s.done)return;
  if(s.mode!=='exam'){pauseSession();if(state.studySaved)return;}
  event.preventDefault();event.returnValue='';
});
window.addEventListener('pagehide',()=>pauseSession());
window.addEventListener('popstate',async()=>{
  if(state.session?.mode==='exam'&&!state.session.done&&!await confirmAction('An unfinished exam will be left unscored.','Leave exam')){history.pushState(null,'',`#${state.view}`);return;}
  pauseSession();state.session=null;clearInterval(tick);closeSource();state.view=routes.includes(location.hash.slice(1))?location.hash.slice(1):'home';render(true);
});
document.addEventListener('visibilitychange',()=>{
  const s=state.session;if(!s||s.done)return;
  if(s.mode==='exam'){if(!document.hidden&&s.deadline&&Date.now()>=s.deadline)finishSession(true);return;}
  if(document.hidden)pauseSession();else{s.runningSince=Date.now();startClock();}
});

async function init() {
  const registry = await json('subjects/index.json');
  subjectConfigs = await Promise.all(registry.subjects.map(selected => json(`subjects/${selected.config}`)));
  document.documentElement.dataset.multiSubject = subjectConfigs.length > 1;
  const requested = new URL(location.href).searchParams.get('subject');
  subject = subjectConfigs.find(config => config.id === requested) || subjectConfigs[0];
  if (!explanationLanguages().includes(state.settings.explanationLanguage)) state.settings.explanationLanguage = explanationLanguages()[0];
  const prefix = `subjects/${subject.id}/`;
  const results = await Promise.all([json(prefix + (subject.scope.sourceManifest || 'sources/manifest.json')), json(prefix + subject.paths.chapters), json(prefix + subject.paths.concepts), json(prefix + subject.paths.activities), json(prefix + subject.paths.pages), json(prefix + subject.paths.uncertainties), json(prefix + subject.paths.coverage), subject.paths.pageImages ? json(prefix + subject.paths.pageImages) : Promise.resolve({pages:[]})]);
  lectures = results[0].lectures; chapters = results[1].chapters; concepts = results[2].concepts; activities = results[3].activities.filter(a => a.status === 'validated'); pages = results[4].pages; uncertainties = results[5].items; coverage = results[6]; sourceImages = results[7].pages;
  const loaded = loadProgress(storage, subject.id, subject.scope.id, activities); progress = loaded.progress; state.progressSaved = !loaded.warning;
  if (loaded.warning) state.notice = { message: loaded.warning, error: true };
  const extra=loadStudy(storage,subject.id,subject.scope.id);study=extra.study;state.studySaved=!extra.warning;if(extra.warning)state.notice={message:extra.warning,error:true};
  shell();
  $('#subject-select').innerHTML = subjectConfigs.map(config => `<option value="${esc(config.id)}" ${config.id === subject.id ? 'selected' : ''}>${esc(config.title)}</option>`).join('');
  render();
  try{if((progress.attempts.length||progress.archivedAttempts.length)&&storage.getItem('study-atlas:release-seen')!==RELEASE)showRelease();else storage.setItem('study-atlas:release-seen',RELEASE);}catch{}
}
matchMedia('(max-width: 1100px)').addEventListener('change', () => { if (state.source) renderSource(); });
init().catch(error => { $('#app').innerHTML = `<main class="loading error-state"><img src="${url('app/atlas.svg')}" width="48" height="48" alt=""><h1>We couldn’t open the atlas.</h1><p>${esc(error.message)}</p><button class="button primary" onclick="location.reload()">Try again</button><p class="small">Use a local HTTP server or the published site to load the study files.</p></main>`; });
