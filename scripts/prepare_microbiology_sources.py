"""Import unchanged supplied Microbiology PDFs and extract review material.

This is source preparation only: it does not author or validate any questions.
Use the bundled Python runtime with pypdf, pypdfium2 and Pillow installed.
"""
from pathlib import Path
import hashlib
import json
import shutil
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'subjects/general-microbiology'
FILES = [
    ('bacteria-and-other-microorganisms', 'Bacteria and Other Microorganisms', '1) Bacteria and Other Microorganisms.pdf'),
    ('bacterial-genetics', 'Bacterial Genetics', '2) Bacterial Genetics.pdf'),
    ('bacterial-growth', 'Bacterial Growth', '3) Bacterial Growth.pdf'),
    ('normal-flora', 'Normal Flora', '4) Normal Flora.pdf'),
    ('bacterial-pathogenesis', 'Bacterial Pathogenesis', '5) Bacterial Pathogenesis.pdf'),
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    lectures = []
    for number, (slug, title, original) in enumerate(FILES, 1):
        source = Path.home() / 'Downloads' / original
        relative = f'slides/{number:02d}-{slug}.pdf'
        dest = BASE / 'sources' / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            assert sha(source) == sha(dest), f'Existing PDF differs: {dest}'
        else:
            shutil.copy2(source, dest)
        assert sha(source) == sha(dest)
        reader = PdfReader(dest)
        out = ROOT / 'work/general-microbiology/extraction' / slug
        out.mkdir(parents=True, exist_ok=True)
        doc = pdfium.PdfDocument(str(dest))
        pages = []
        for i, page in enumerate(reader.pages, 1):
            pages.append({'pdf_page': i, 'text': page.extract_text(extraction_mode='layout') or ''})
            image = doc[i - 1].render(scale=1.7).to_pil().convert('RGB')
            image.save(out / f'page-{i:03d}.png')
        (out / 'pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
        (out / 'pages.txt').write_text('\n\n'.join(f"=== PDF PAGE {p['pdf_page']} ===\n{p['text']}" for p in pages), encoding='utf-8')
        for start in range(0, len(pages), 4):
            sheet = Image.new('RGB', (2000, 1600), '#ddd')
            draw = ImageDraw.Draw(sheet)
            for n in range(start, min(start + 4, len(pages))):
                im = Image.open(out / f'page-{n + 1:03d}.png')
                im.thumbnail((990, 745))
                x, y = (n - start) % 2 * 1000, (n - start) // 2 * 800
                draw.text((x + 12, y + 10), f'{slug} | PDF p{n + 1}', fill='black')
                sheet.paste(im, (x + (1000 - im.width) // 2, y + 38))
            sheet.save(out / f'contact-{start + 1:03d}-{min(start + 4, len(pages)):03d}.jpg', quality=94)
        lectures.append({'id': slug, 'title': title, 'original_filename': original, 'path': relative,
                         'pdf_pages': len(pages), 'sha256': sha(dest), 'size_bytes': dest.stat().st_size,
                         'scope': 'All supplied teaching content; no direct memorization of longitudinal reference tables or broad organism-disease lists',
                         'extraction_status': 'Embedded text and visual review assets extracted; structured review pending',
                         'question_bank_status': 'Not authored; complete source review required first'})
        print(slug, len(pages), flush=True)
    manifest = {'subject': 'General Microbiology', 'purpose': 'Midterm',
                'total_pdf_pages': sum(l['pdf_pages'] for l in lectures),
                'pagination_note': 'One-based PDF pages; printed slide numbers are separately recorded when visible.',
                'lectures': lectures, 'source_analysis': '../source-analysis/INDEX.md'}
    (BASE / 'sources/manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (BASE / 'source-analysis/lectures').mkdir(parents=True, exist_ok=True)

if __name__ == '__main__':
    main()
