# Birthday Map

Route: `#/map`

A Pacific-centred map of us. One heart marker per place opens that place's memory cards.
A dashed rose arc joins Shenzhen and College Station, with a small heart flying along it;
a gold dotted line traces flight CYF925 from Shenzhen to New York. **Play our story** flies
through every memory in date order and ends on the birthday letter.

| File | Role |
|---|---|
| `map.ts` | `renderMap(root) => cleanup`; Leaflet map, markers, cards, story mode |
| `map.css` | map, marker and card styles |
| `letter.ts` | the birthday letter (zh + en), also shown on the home page |

- Longitudes in the Americas are shifted by +360° (`pacificLng`) so the map centres on the Pacific.
- Base map: OpenStreetMap tiles, tinted with a CSS filter to match the site palette.
- Memories come from `../moments/memories.ts`.

**To edit the letter:** change the paragraphs in `letter.ts`, keeping the Chinese and English versions in step.
