# Paper and Report

Writing about Yi Town, kept apart from the code.

| File | What it is |
|---|---|
| `meridian.pdf` | **MERIDIAN: Memory-Encoded Rituals for Intimacy across Distance in an Interactive, Asynchronous Neighbourhood.** Jingyi Chen and Yifan Yang (corresponding, yifan@jingyifan.love). Two-column academic paper (ACM `sigconf` style, 10 pages). |
| `meridian.tex`, `references.bib` | Its LaTeX source. Every DOI in the bibliography was checked against Crossref. |
| `report-zh.pdf` | The Chinese feature report (功能报告说明书, 26 A4 pages): what the town is, how to play every level, progress codes, privacy, architecture, maintenance, FAQ. |
| `report-zh.html` | Its source, printed to PDF with Chromium. |
| `figures/` | Screenshots of the live site and art rendered from the sprite code, shared by both documents. |

This folder is the one place in the repository written partly in Chinese, by the owner's choice.
Both documents describe the ring and the wedding, so keep them from Jingyi until she has played.

## Rebuild

The paper (TinyTeX; `CJKutf8` with Arphic fonts for the Chinese lines):

```bash
export PATH="$HOME/Library/TinyTeX/bin/universal-darwin:$PATH"
pdflatex meridian && bibtex meridian
pdflatex meridian && pdflatex meridian
```

The report (Playwright, from this folder):

```bash
python3 -c "
from playwright.sync_api import sync_playwright; import pathlib
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto(pathlib.Path('report-zh.html').resolve().as_uri(), wait_until='load')
    pg.pdf(path='report-zh.pdf', format='A4', print_background=True, prefer_css_page_size=True)
    b.close()"
```
