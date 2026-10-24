# Gomoku (planned)

Live Gomoku between Shenzhen and Texas, a nod to our first game, played on a Zoom whiteboard
(purple for Jingyi, green for Yifan).

Design (spec §4–§6): a 15×15 board; pure board logic (`gomoku-core`: placing, turn order,
five-in-a-row detection, undo) kept separate from the UI. Moves sync through Supabase
Realtime Broadcast as `{seq, row, col, color}`, a rejoining player requests the move list,
and a same-device mode is the fallback when realtime is not configured.

Needs: a Supabase project URL and anon key in `.env`.
