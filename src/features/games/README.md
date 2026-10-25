# Games

Shared pieces for the game pages: `tabs.ts` renders the Gomoku / Pictionary switcher at the
top of each game. Each game lives in its own folder (`../gomoku/`, `../pictionary/`).
To add a game, give it a route in `src/main.ts`, add it to `GAMES` there and in `tabs.ts`.
