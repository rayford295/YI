# Pictionary (planned)

Live draw-and-guess between Shenzhen and Texas, after our first round of Pictionary.

Design (spec §4–§6): the drawer gets a word from a bilingual word bank (inside jokes
welcome); strokes stream through Supabase Realtime in batches about every 40 ms; the guesser
types guesses, which are checked on the drawer's side; a round timer, scores, and roles swap
each round.

Needs: the same Supabase project as Gomoku.
