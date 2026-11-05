#!/usr/bin/env python3
"""Create portable, faithful page images directly from authoritative lecture PDFs.

Run with the bundled Python runtime (pypdfium2 + Pillow). The unchanged PDF
hashes and page counts are verified against sources/manifest.json before any
image is written. Paths in page-images.json are relative to sources/.

Default: all pages, 2 pixels per PDF point (144 dpi), lossless WebP. This keeps
source text/figures as rendered rather than redrawing or OCR-reconstructing them.
The optional --lossy flag uses quality 95 or higher for an explicitly smaller
future rebuild; lossless is the release default.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import PIL
from PIL import Image
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--subject', default='molecular-biology')
    parser.add_argument('--scale', type=float, default=2.0)
    parser.add_argument('--lossy', action='store_true')
    parser.add_argument('--quality', type=int, default=97)
    args = parser.parse_args()
    if not 1.5 <= args.scale <= 4:
        parser.error('--scale must be between 1.5 and 4')
    if not 95 <= args.quality <= 100:
        parser.error('--quality must be between 95 and 100')
    subject_root = ROOT / 'subjects' / args.subject
    sources = subject_root / 'sources'
    manifest_path = sources / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    verified = []
    # Verify the entire source set first; never publish an index for mismatched PDFs.
    for lecture in manifest['lectures']:
        source = sources / lecture['path']
        actual = digest(source)
        if actual != lecture['sha256']:
            raise ValueError(f"Unchanged-source hash check failed: {lecture['id']}")
        doc = pdfium.PdfDocument(str(source))
        count = len(doc)
        doc.close()
        if count != lecture['pdf_pages']:
            raise ValueError(f"PDF page count mismatch: {lecture['id']}: {count}")
        verified.append((lecture, source, actual))
    if sum(lecture['pdf_pages'] for lecture, _, _ in verified) != manifest['total_pdf_pages']:
        raise ValueError('Manifest total does not equal lecture page counts')

    records = []
    source_pdfs = []
    total_bytes = 0
    for lecture, source, source_hash in verified:
        lecture_id = lecture['id']
        target = sources / 'pages' / lecture_id
        target.mkdir(parents=True, exist_ok=True)
        doc = pdfium.PdfDocument(str(source))
        lecture_bytes = 0
        for number in range(1, len(doc) + 1):
            page = doc[number - 1]
            bitmap = page.render(scale=args.scale, fill_color=(255, 255, 255, 255))
            rendered = bitmap.to_pil().convert('RGB')
            image_path = target / f'page-{number:03d}.webp'
            rendered.save(image_path, format='WEBP', lossless=not args.lossy,
                          quality=(args.quality if args.lossy else 100), method=4,
                          exact=True)
            size = image_path.stat().st_size
            # Reopen saved files to verify the actual export rather than just memory.
            with Image.open(image_path) as saved:
                if saved.size != rendered.size or saved.format != 'WEBP':
                    raise ValueError(f'Image export validation failed: {image_path}')
                saved.load()
                if not args.lossy and saved.convert('RGB').tobytes() != rendered.tobytes():
                    raise ValueError(f'Lossless pixel verification failed: {image_path}')
            records.append({
                'lectureId': lecture_id,
                'pdfPage': number,
                'path': image_path.relative_to(sources).as_posix(),
                'width': rendered.width,
                'height': rendered.height,
                'sha256': digest(image_path),
                'sourceSha256': source_hash,
                'sizeBytes': size,
            })
            lecture_bytes += size
            rendered.close()
            bitmap.close()
            page.close()
        doc.close()
        total_bytes += lecture_bytes
        source_pdfs.append({
            'lectureId': lecture_id,
            'path': lecture['path'],
            'sha256': source_hash,
            'pdfPages': lecture['pdf_pages'],
            'renderBytes': lecture_bytes,
        })
        print(f"{lecture_id}: {lecture['pdf_pages']} pages; {lecture_bytes:,} bytes", flush=True)
    expected = manifest['total_pdf_pages']
    if len(records) != expected:
        raise ValueError(f'Rendered {len(records)} pages; expected {expected}')
    index = {
        'schemaVersion': 1,
        'subjectId': args.subject,
        'description': 'Faithful full-page renders of unchanged authoritative lecture PDFs. Covers and administrative pages are included for exact PDF-page navigation.',
        'pathBase': 'sources/',
        'format': 'image/webp',
        'lossless': not args.lossy,
        'renderScale': args.scale,
        'renderDpi': args.scale * 72,
        'encoderQuality': None if not args.lossy else args.quality,
        'renderEngine': 'pypdfium2',
        'imageEncoder': f'Pillow {PIL.__version__}',
        'manifestSha256': digest(manifest_path),
        'totalPages': len(records),
        'totalBytes': total_bytes,
        'sourcePdfs': source_pdfs,
        'pages': records,
    }
    (sources / 'page-images.json').write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'TOTAL: {len(records)} pages; {total_bytes:,} bytes; lossless={not args.lossy}', flush=True)


if __name__ == '__main__':
    main()
