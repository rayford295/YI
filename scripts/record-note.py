#!/usr/bin/env python3
"""Record a voice note for the mailbox on this Mac.

    python3 scripts/record-note.py yifan        # who is speaking: yifan or jingyi
    python3 scripts/record-note.py yifan 2026-10-28

Starts recording from the default microphone at once; press Enter to stop (or it stops at 3 min).
Saves <date>-<sender>[-n].m4a into public/media/voice/notes/ and runs `npm run notes`.
Needs: pip install sounddevice soundfile  (afconvert is built into macOS).
"""
import datetime, os, subprocess, sys, threading
import numpy as np, sounddevice as sd, soundfile as sf

sender = (sys.argv[1] if len(sys.argv) > 1 else '').lower()
if sender not in ('yifan', 'jingyi'):
    sys.exit('who is speaking? yifan or jingyi')
date = sys.argv[2] if len(sys.argv) > 2 else datetime.date.today().isoformat()
folder = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'voice', 'notes')
base = f'{date}-{sender}'
n = 1
while os.path.exists(os.path.join(folder, f'{base}{"" if n == 1 else f"-{n}"}.m4a')): n += 1
name = f'{base}{"" if n == 1 else f"-{n}"}'
wav = f'/tmp/{name}.wav'; m4a = os.path.join(folder, f'{name}.m4a')

RATE, MAX = 44100, 180
chunks, stop = [], threading.Event()
def cb(indata, frames, t, status): chunks.append(indata.copy())
print(f'● recording as {sender}… speak now. Press Enter to stop.')
with sd.InputStream(samplerate=RATE, channels=1, callback=cb):
    threading.Thread(target=lambda: (sys.stdin.readline(), stop.set()), daemon=True).start()
    stop.wait(MAX)
audio = np.concatenate(chunks) if chunks else np.zeros((1, 1), dtype='float32')
# trim silence at both ends, keep a little air
level = np.abs(audio[:, 0]); idx = np.where(level > 0.01)[0]
if len(idx): audio = audio[max(0, idx[0] - RATE // 4): min(len(audio), idx[-1] + RATE // 2)]
sf.write(wav, audio, RATE)
subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000', wav, m4a], check=True)
os.remove(wav)
print(f'saved {os.path.relpath(m4a)}  ({len(audio) / RATE:.1f} s)')
subprocess.run(['npm', 'run', 'notes', '--silent'], cwd=os.path.join(os.path.dirname(__file__), '..'))
