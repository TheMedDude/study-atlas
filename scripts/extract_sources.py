"""Reproducible, source-only PDF extraction and review images (work/ is ignored)."""
import json, pathlib, hashlib
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'subjects/molecular-biology/sources/manifest.json').read_text(encoding='utf-8-sig'))
base=ROOT/'subjects/molecular-biology/sources'
for lec in manifest['lectures']:
    pdf=base/lec['path']; out=ROOT/'work/extraction'/lec['id']; out.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256(pdf.read_bytes()).hexdigest()==lec['sha256'], pdf
    reader=PdfReader(pdf); doc=pdfium.PdfDocument(str(pdf)); pages=[]
    for i,p in enumerate(reader.pages):
        text=p.extract_text(extraction_mode='layout') or ''
        pages.append({'pdf_page':i+1,'text':text})
        image=doc[i].render(scale=1.65).to_pil().convert('RGB')
        image.save(out/f'page-{i+1:03d}.png')
    (out/'pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'pages.txt').write_text('\n\n'.join(f"=== PDF PAGE {p['pdf_page']} ===\n{p['text']}" for p in pages),encoding='utf-8')
    for start in range(0,len(pages),4):
        sheet=Image.new('RGB',(1800,1420),'#ddd'); draw=ImageDraw.Draw(sheet)
        for n in range(start,min(start+4,len(pages))):
            im=Image.open(out/f'page-{n+1:03d}.png'); im.thumbnail((890,660))
            x=(n-start)%2*900; y=(n-start)//2*710
            draw.text((x+10,y+8),f"{lec['id']} | PDF page {n+1}",fill='black')
            sheet.paste(im,(x+(900-im.width)//2,y+35))
        sheet.save(out/f'contact-{start+1:03d}-{min(start+4,len(pages)):03d}.jpg',quality=91)
    print(lec['id'],len(pages),flush=True)
