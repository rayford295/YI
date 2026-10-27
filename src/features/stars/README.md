# Libra and Scorpius (level)

Our two signs, next to each other in the sky: Libra for Yifan (25 September), Scorpius for
Jingyi (31 October). Libra's two brightest stars are still called the Scorpion's claws
(Zubenelgenubi, the southern claw; Zubeneschamali, the northern): Libra used to be part of
Scorpius. The chart shows both figures' stars at their real places (J2000, a flat chart with
east on the left as when looking up). Tap two stars to join them; a pair that is not a line of
the figure, or is already drawn, is refused. Finishing one figure names it in gold; finishing
both (20 lines) clears the level (`levelCleared('stars')`). "Show the figures" draws the lines
faintly as a guide. Named stars show their name once joined.

| File | What |
|---|---|
| `constellations.ts` | `CONSTELLATIONS` (stars with RA/Dec/magnitude, the stick-figure edges), `project`, `isEdge`, `edgeKey` |
| `stars.ts`, `stars.css` | The page: an SVG chart, picked-star halo, gold lines, twinkle |
| `constellations.test.ts` | Distinct ids; every edge joins two stars of its figure; each figure is one piece; the chart keeps every star in view with Antares south-east of the claws |
