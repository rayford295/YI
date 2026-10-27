// A thin wrapper over the browser's speech recogniser (Chrome, Safari 14.5+; not every in-app
// browser). `listen` resolves with what was heard, or rejects with a reason the page can show.
type Recogniser = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type Ctor = new () => Recogniser;

const ctor = (): Ctor | null => {
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const canListen = (): boolean => ctor() !== null;

export interface Listening { done: Promise<string>; stop(): void; abort(): void }

/** Listen once (Mandarin). The promise resolves with all alternatives joined, so a homophone in any of them counts. */
export function listen(lang = 'zh-CN'): Listening {
  const C = ctor();
  if (!C) return { done: Promise.reject(new Error('unsupported')), stop: () => undefined, abort: () => undefined };
  const r = new C();
  r.lang = lang; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
  let settled = false;
  const done = new Promise<string>((resolve, reject) => {
    r.onresult = (e) => {
      const alts: string[] = [];
      for (let i = 0; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) alts.push(e.results[i][j].transcript);
      settled = true; resolve(alts.join(' / '));
    };
    r.onerror = (e) => { settled = true; reject(new Error(e.error)); };
    r.onend = () => { if (!settled) { settled = true; reject(new Error('silence')); } };
    try { r.start(); } catch (err) { settled = true; reject(err instanceof Error ? err : new Error('failed')); }
  });
  return { done, stop: () => { try { r.stop(); } catch { /* already stopped */ } }, abort: () => { settled = true; try { r.abort(); } catch { /* gone */ } } };
}
