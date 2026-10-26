# The Last Letter (epilogue)

Route `#/letter`. Not a level: it is reachable once the player has cleared the ring, but the
letter text only renders when *both* players have cleared the ring on this device
(`clearedByAll('ring')`). Until then the page shows two avatar seals, lit for whoever has
arrived, and a one-line note. The text lives in `src/features/birthday-map/letter.ts`.
