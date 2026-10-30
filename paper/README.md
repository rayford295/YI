# Paper and Report

The current manuscript is the final version (30 October 2026) of **MERIDIAN: Memory-Encoded Rituals for Intimacy across Distance in an Interactive, Asynchronous Neighbourhood**, by Jingyi Chen and Yifan Yang (corresponding author: yifan@jingyifan.love).

The paper reports a pre-deployment design case; it does not report a recipient evaluation or a measured effect on intimacy. Both authors have approved the manuscript and the disclosure of the personal material it describes, and the repository it inspects is public. The abstract and the availability statement give the repository address.

| File | Contents |
|---|---|
| [meridian.pdf](meridian.pdf) | Final manuscript: 13 pages, 14 figures, 5 tables and 37 cited references. |
| [meridian.tex](meridian.tex), [references.bib](references.bib) | Canonical manuscript and bibliography. Edit these files for subsequent revisions. |
| [review/2026-10-29/](review/2026-10-29/) | The 29 October review report, its evidence and change record, and the figures the manuscript uses. |
| [arxiv/](arxiv/) | Generated standalone source, bibliography, preview PDF, upload archive and metadata. |
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

Compilation here uses TeX Live 2026. Read [ARXIV.md](arxiv/ARXIV.md) and inspect the complete generated PDF before uploading.
