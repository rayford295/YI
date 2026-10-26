# Start

Route: `#/start`. Shown whenever no player is chosen (every other route redirects here).

Two cards, Jingyi and Yifan, with their cartoon avatars (`public/media/avatars/*.png`; a lettered
circle stands in while the files are missing). Choosing one stores the player
(`localStorage` key `yi.player`) and opens the town; the page stands on the same meadow background as the town (`applyMeadow` from `src/features/world/meadow.ts`).
