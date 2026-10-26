# That Night's Sky (level)

The sky over Shenzhen and over College Station at 21:00 local time on the day we met
(`config.metOn`), computed in the browser.

- `catalog.ts`: ~130 bright stars (J2000 RA/Dec, magnitude) and the constellation lines shown
  with the hint (Lyra, Aquila, Cygnus, the Summer Triangle, Scorpius, the Teapot, the Big Dipper,
  Cassiopeia, the Great Square).
- `sky.ts`: `computeSky(date, lat, lng)` turns the catalogue plus Moon, Venus, Mars, Jupiter and
  Saturn into horizontal coordinates with astronomy-engine and projects them onto a disc
  (azimuthal equidistant, zenith at the centre, north up, east on the left as when looking up).
- `stars.ts`: the page. Task: tap Vega (织女) and Altair (牛郎). Bright stars are drawn last so a
  faint neighbour's hit area never covers them; faint stars get a smaller hit radius.

Tests check the projection and that both target stars are well above the horizon from both
places that evening.
