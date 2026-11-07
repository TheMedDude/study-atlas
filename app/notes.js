const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function studyNotes(items,concepts,lectures,language,subjectTitle,sourceURL) {
  const conceptMap=new Map(concepts.map(c=>[c.id,c.label]));
  return `<header class="notes-title"><p>STUDY ATLAS · STUDY NOTES</p><h1>${esc(subjectTitle)}</h1><p>${items.length} saved ${items.length===1?'topic':'topics'} · ${language==='ar'?'Arabic explanations':'English explanations'}</p></header>`+lectures.map(l=>{
    const rows=items.filter(a=>a.lectureId===l.id);if(!rows.length)return '';
    return `<section class="notes-chapter"><h2>${esc(l.title)}</h2>${rows.map(a=>`<article class="study-note"><h3>${esc([...new Set(a.conceptIds.map(id=>conceptMap.get(id)).filter(Boolean))].slice(0,3).join(' · '))}</h3><p class="explanation" lang="${esc(language)}" dir="${language==='ar'?'rtl':'ltr'}">${esc(a.explanation[language]||a.explanation.en)}</p>${a.type==='match'?`<dl>${a.pairs.map(p=>`<div><dt>${esc(p.left)}</dt><dd>${esc(p.right)}</dd></div>`).join('')}</dl>`:a.type==='order'?`<ol>${a.acceptedGroups.map(g=>`<li>${g.map(id=>esc(a.items.find(i=>i.id===id).text)).join(' / ')}</li>`).join('')}</ol>`:''}<p class="note-refs">${a.sourceRefs.map(ref=>`<a href="${esc(sourceURL(ref))}">${esc(lectures.find(v=>v.id===ref.lectureId)?.title)} · PDF p${ref.pdfPage}</a>`).join(' · ')}</p></article>`).join('')}</section>`;
  }).join('');
}
