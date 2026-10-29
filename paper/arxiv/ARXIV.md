# arXiv submission: MERIDIAN

Upload `meridian-arxiv.tar.gz` (the LaTeX source, `meridian.bbl` and `figures/`; arXiv does not
run BibTeX, so the `.bbl` must travel with the source). `meridian-preview.pdf` is what arXiv's
pdfLaTeX build should produce; it was compiled from exactly the files in the tarball.

## Before you submit

- [ ] **Jingyi has read the paper and agrees to be an author.** arXiv requires every author's
      consent, and the paper describes the ring and the wedding, so this waits until after she
      has played (on or after 31 October 2026).
- [ ] `yifan@jingyifan.love` receives mail (Cloudflare Email Routing; see the steps given in chat).
- [ ] Submit from an arXiv account in Yifan's name; cs.HC may ask for an endorsement on a
      first submission to that category.
- [ ] Read `meridian-preview.pdf` once more; the version on arXiv stays public for good.

## Form fields

**Title**

MERIDIAN: Memory-Encoded Rituals for Intimacy across Distance in an Interactive, Asynchronous Neighbourhood

**Authors**

Jingyi Chen, Yifan Yang

**Abstract** (1867 characters; the limit is 1,920)

Two people met on 20 September 2026 and have since lived thirteen hours and one Pacific Ocean apart, one in Shenzhen, China, the other in College Station, Texas. This paper reports the design and implementation of Yi Town, a bilingual, browser-only game made by this couple for themselves, first as a birthday gift and then as a shared artefact that keeps growing. Each player walks a pixel avatar through a small town whose nine houses are levels, and each level turns one shared memory into a game mechanic: a vow spoken aloud and recognised in the browser, street views to be named on a map of six places, a tattoo handwritten on a drawn arm, a timeline to put back in order, Gomoku endgames whose answers trace a heart, songs named from a passage, the stars of two birth signs joined by hand, missing characters restored to classical Chinese love poems, and a procedurally modelled ring tried on through hand tracking. A birthday prologue and a wedding finale play as pixel cutscenes. Using research through design and autobiographical design, we state six design commitments (memory as mechanics, earned access, intimacy without a server, parity between the two languages, art drawn in code, and secrecy as narrative tension) and show how the system realises each of them. Progress is modelled as a grow-only set, so merging two devices' progress needs no server. It travels between phones as a code of at most four characters guarded by an ISO 7064 MOD 37,36 check character. The sky follows each player's own clock, and a unit test keeps the final surprise out of every string shown before it. The system comprises about 8,400 lines of strict TypeScript and 153 unit tests and was built in 109 commits over five days. We reflect on what designing for an audience of exactly one other person reveals about privacy, asynchrony and ceremony in intimate computing.

**Comments**

10 pages, 9 figures, 5 tables

**Primary category:** cs.HC (Human-Computer Interaction)
**Cross-list:** cs.CY (Computers and Society)
**ACM class:** H.5.2; K.8.0

**License:** arXiv.org perpetual, non-exclusive license (recommended: it keeps every other option
open; one figure contains a CC BY 2.0 photograph, credited in its caption).

## How this differs from `../meridian.pdf`

- Affiliations read "Independent Researcher" (Shenzhen; College Station, Texas), with a footnote
  saying the work was made in and for Yi Town.
- The accepted spellings of the entry question's answer are removed.
- No real photographs of us: the Moments screenshot has its photo strip painted over, and the
  letter screenshot is replaced by the journey list. Jingyi's job is not named.
- The street-view photograph is credited (Maarten Heerlien, CC BY 2.0, Wikimedia Commons).
- Figures are recompressed (tarball about 3.5 MB); `\pdfoutput=1` is set; the Arphic font maps
  load in replace mode so the build works with arXiv's TeX Live as well as TinyTeX.

## Rebuild

```bash
export PATH="$HOME/Library/TinyTeX/bin/universal-darwin:$PATH"
cp ../references.bib . && pdflatex meridian && bibtex meridian && pdflatex meridian && pdflatex meridian
tar -czf meridian-arxiv.tar.gz meridian.tex meridian.bbl figures
```
