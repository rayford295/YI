# Gomoku (planned)

Gomoku on one device, a nod to our first game, played on a Zoom whiteboard
(purple for Jingyi, green for Yifan).

Design: a 15×15 board; pure board logic (`gomoku-core`: placing, turn order,
five-in-a-row detection, undo) kept separate from the UI. Both players take turns on the
same screen (hot-seat), for example while sharing a screen on Zoom. No network and no
backend: it runs entirely in the browser, including under `npm run dev`.
