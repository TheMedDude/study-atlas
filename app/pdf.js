// Private, browser-local A4 notes. Canvas uses the same bundled fonts as the app.
const W=1240,H=1754,M=90;
const enc=new TextEncoder();
export function assemblePdf(images) {
  const chunks=[],offsets=[0];let size=0;
  const add=v=>{const data=typeof v==='string'?enc.encode(v):v;chunks.push(data);size+=data.length;};
  const object=(id,body)=>{offsets[id]=size;add(`${id} 0 obj\n`);add(body);add('\nendobj\n');};
  add('%PDF-1.4\n%StudyAtlas\n');
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');
  object(2,`<< /Type /Pages /Count ${images.length} /Kids [${images.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
  images.forEach((image,i)=>{
    const page=3+i*3,picture=page+1,content=page+2;
    object(page,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /PageImage ${picture} 0 R >> >> /Contents ${content} 0 R >>`);
    offsets[picture]=size;add(`${picture} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);add(image);add('\nendstream\nendobj\n');
    const commands='q\n595.28 0 0 841.89 0 0 cm\n/PageImage Do\nQ\n';
    object(content,`<< /Length ${enc.encode(commands).length} >>\nstream\n${commands}endstream`);
  });
  const info=3+images.length*3;object(info,'<< /Title (Study Atlas - Study Notes) /Creator (Study Atlas 1.1) >>');
  const xref=size;add(`xref\n0 ${info+1}\n0000000000 65535 f \n`);
  for(let i=1;i<=info;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  add(`trailer\n<< /Size ${info+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks,{type:'application/pdf'});
}

export async function notesPdf(items,concepts,lectures,language,subjectTitle) {
  await document.fonts.load('400 24px Inter');await document.fonts.load('600 28px Inter');
  if(language==='ar')await document.fonts.load('400 26px "Noto Sans Arabic"','المعلومات الوراثية');
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d'),images=[],conceptMap=new Map(concepts.map(c=>[c.id,c.label]));let y=0,page=0;
  const font=(size=24,bold=false,ar=false)=>{ctx.font=`${bold?'600':'400'} ${size}px ${ar?'"Noto Sans Arabic", ':''}Inter, sans-serif`;};
  const line=(text,size=24,bold=false,ar=false,color='#26352e')=>{font(size,bold,ar);ctx.fillStyle=color;ctx.direction=ar?'rtl':'ltr';ctx.textAlign=ar?'right':'left';ctx.fillText(text,ar?W-M:M,y);};
  function newPage(){page++;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);y=65;line('STUDY ATLAS · STUDY NOTES',17,true,false,'#687368');ctx.textAlign='right';ctx.fillText(String(page),W-M,H-50);y=105;ctx.strokeStyle='#dcded1';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y=155;}
  async function flush(){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));if(!blob)throw Error('This browser could not create the notes PDF.');images.push(new Uint8Array(await blob.arrayBuffer()));}
  async function space(height){if(y+height>H-M){await flush();newPage();}}
  function wrap(text,size,bold,ar){
    font(size,bold,ar);const rows=[];
    for(const paragraph of String(text).split('\n')){let row='';for(const word of paragraph.split(/\s+/).filter(Boolean)){
      if(ctx.measureText(row?row+' '+word:word).width<=W-2*M){row=row?row+' '+word:word;continue;}
      if(row){rows.push(row);row='';}
      if(ctx.measureText(word).width<=W-2*M)row=word;else for(const char of word){if(ctx.measureText(row+char).width>W-2*M){rows.push(row);row='';}row+=char;}
    }rows.push(row);}
    return rows;
  }
  async function paragraph(text,size=24,bold=false,ar=false,color='#26352e'){
    const height=ar?46:36,rows=wrap(text,size,bold,ar);for(const row of rows){await space(height);line(row,size,bold,ar,color);y+=height;}y+=8;
  }
  newPage();await paragraph(subjectTitle,48,true);await paragraph(`${items.length} saved ${items.length===1?'topic':'topics'}`,20,false,false,'#687368');y+=12;
  for(const lecture of lectures){
    const rows=items.filter(a=>a.lectureId===lecture.id);if(!rows.length)continue;
    await space(180);await paragraph(lecture.title,32,true);y+=6;
    for(const a of rows){
      const heading=[...new Set(a.conceptIds.map(id=>conceptMap.get(id)).filter(Boolean))].slice(0,3).join(' · ');
      await space(wrap(heading,27,true,false).length*36+100);await paragraph(heading,27,true);
      await paragraph(a.explanation[language]||a.explanation.en,language==='ar'?26:24,false,language==='ar');
      if(a.type==='match')for(const pair of a.pairs)await paragraph(`${pair.left} — ${pair.right}`,22);
      if(a.type==='order')for(const [i,group] of a.acceptedGroups.entries())await paragraph(`${i+1}. ${group.map(id=>a.items.find(v=>v.id===id).text).join(' / ')}`,22);
      await paragraph(a.sourceRefs.map(ref=>`${lectures.find(l=>l.id===ref.lectureId)?.title} · PDF p${ref.pdfPage}`).join(' | '),17,false,false,'#687368');
      y+=12;await space(30);ctx.strokeStyle='#dcded1';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=35;
    }
  }
  await flush();return assemblePdf(images);
}
