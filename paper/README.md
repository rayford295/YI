# Paper and Report

The current manuscript is the 29 October 2026 reviewed draft of **MERIDIAN: Memory-Encoded Rituals for Intimacy across Distance in an Interactive, Asynchronous Neighbourhood**, by Jingyi Chen and Yifan Yang (corresponding author: yifan@jingyifan.love).

The paper reports a pre-deployment design case. It does not report a recipient evaluation or a measured effect on intimacy. Author approval, disclosure permissions, source provenance and the release decisions described in the review remain outstanding before arXiv submission.

| File | Contents |
|---|---|
| [meridian.pdf](meridian.pdf) | Reviewed manuscript: 12 pages, 9 figures, 5 tables and 37 cited references. |
| [meridian.tex](meridian.tex), [references.bib](references.bib) | Canonical manuscript and bibliography. Edit these files for subsequent revisions. |
| [review/2026-10-29/](review/2026-10-29/) | Review report, evidence, change record and figures used by the reviewed manuscript. |
| [arxiv/](arxiv/) | Generated standalone source, bibliography, preview PDF, draft source archive and metadata. |
| `report-zh.pdf`, `report-zh.html` | Original Chinese feature report and its source; not updated by the manuscript review. |
| `figures/` | Original figures used by the Chinese report. Reviewed figures are stored separately. |

## Rebuild the Manuscript

With a TeX installation containing `acmart`, `CJKutf8` and the Arphic fonts, run from `paper/`:

```bash
pdflatex meridian
bibtex meridian
pdflatex meridian
pdflatex meridian
```

The existing TinyTeX installation may require adding its `bin/universal-darwin` directory to `PATH`.

## Rebuild the arXiv Draft

```bash
python3 arxiv/make_arxiv.py
cd arxiv
pdflatex meridian
bibtex meridian
pdflatex meridian
pdflatex meridian
cp meridian.pdf meridian-preview.pdf
python3 make_arxiv.py --pack
```

The generator copies the canonical text and only referenced reviewed figures. It does not restore the former manuscript through text substitutions. The source archive includes both `.bib` and `.bbl`; arXiv currently supports bibliography processing from `.bib` and accepts a matching pre-generated `.bbl`.

Compilation here uses TeX Live 2026. arXiv server processing has not been verified. Read [ARXIV.md](arxiv/ARXIV.md) and inspect the complete generated PDF before submission.
