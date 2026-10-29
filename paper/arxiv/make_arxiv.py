"""Generate the arXiv draft from canonical paper/meridian.tex.

The canonical manuscript already uses reviewed figures. Generate source and copy
only referenced assets, then compile it before running this script with --pack.
"""
from pathlib import Path
import argparse
import re
import shutil
import tarfile

HERE = Path(__file__).resolve().parent
PAPER = HERE.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--pack', action='store_true', help='package source with its existing matching .bbl')
args = parser.parse_args()
src = (PAPER / 'meridian.tex').read_text()
if not src.startswith('\\pdfoutput=1\n'):
    raise SystemExit('Canonical source must select pdfLaTeX with \\pdfoutput=1.')
src = src.replace(
    '%% MERIDIAN: reviewed manuscript, 2026-10-29; canonical source in paper/meridian.tex.',
    '%% MERIDIAN: arXiv review draft, generated from paper/meridian.tex.',
)
assets = set(re.findall(r'\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}', src))
names = {}
for relative in sorted(assets):
    asset = PAPER / relative
    if not asset.is_file() or not asset.resolve().is_relative_to(PAPER.resolve()):
        raise SystemExit(f'Missing or external figure: {relative}')
    if asset.name in names and names[asset.name] != relative:
        raise SystemExit(f'Duplicate figure basename: {asset.name}')
    names[asset.name] = relative
    target = HERE / 'figures' / asset.name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(asset, target)
    src = src.replace('{' + relative + '}', '{figures/' + asset.name + '}')
(HERE / 'meridian.tex').write_text(src)
shutil.copy2(PAPER / 'references.bib', HERE / 'references.bib')
print(f'Generated meridian.tex, references.bib and {len(names)} referenced figures.')
if args.pack:
    if not (HERE / 'meridian.bbl').is_file():
        raise SystemExit('Compile generated source to create meridian.bbl before packing.')
    with tarfile.open(HERE / 'meridian-arxiv.tar.gz', 'w:gz') as archive:
        for filename in ['meridian.tex', 'references.bib', 'meridian.bbl', 'README-REVIEW-DRAFT.txt']:
            archive.add(HERE / filename, arcname=filename)
        for name in sorted(names):
            archive.add(HERE / 'figures' / name, arcname='figures/' + name)
    print('Packed meridian-arxiv.tar.gz (review draft; author and release checks remain).')
