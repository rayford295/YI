# Voice notes

The red mailbox by the fountain plays these; each player hears the ones the other one sent.

0. On the Mac, skip the rest: `python3 scripts/record-note.py yifan` records from the microphone
   (Enter stops), names and converts the file, and refreshes the list. Then commit and push.
1. Get the recording as an audio file (M4A or MP3). WeChat voice messages cannot be exported
   directly: play one and record it with the phone's Voice Memos / screen recorder, or record a
   fresh note in Voice Memos and share it as a file.
2. Name it `<date>-<sender>.m4a`, where sender is who recorded it: `2026-10-25-jingyi.m4a`,
   and `2026-10-25-jingyi-2.m4a` for a second one that day.
3. Put it in this folder and run `npm run notes`: that rewrites `src/features/voice/notes.ts`
   with the sender, the date and the length. Commit and push; the mailbox lists them newest first.
