# Journey

Route: `/journey`, the list view. The home page is the walkable town (`src/features/world/`); this page is its fallback and shows the same progress.

A gold meridian with one node per level from `src/core/quest.ts`: cleared nodes are gold with a
tick, the current one pulses, locked ones show a lock. None of them is a link: every level is
entered through its door in the town (`src/core/door.ts`). The header shows the
player's avatar and "cleared n / total · next: …"; the footer lets you switch player or wipe
this player's progress.

The level system itself (registry, per-player progress, lock rules, the "level cleared" card and
the locked toast) lives in `src/core/quest.ts` and `src/core/quest-ui.ts`; the design note is
`docs/superpowers/specs/2026-10-25-quest-design.md`, including how to add a level.
