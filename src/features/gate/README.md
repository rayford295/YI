# Gate

The front door, rendered by `main.ts` before any route while `gatePassed()` is false. One
question (strings `gate.*` in i18n), answers normalised to digits and compared as SHA-256
against `ANSWERS` in `src/core/gate.ts`. A pass is stored in `localStorage` (`yi.gate`).
Regenerate hashes with `npm run gate -- "0920" "20260920"`.
