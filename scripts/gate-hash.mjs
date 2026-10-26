// Print the SHA-256 hashes to paste into src/core/gate.ts: npm run gate -- "0920" "20260920"
import { createHash } from 'node:crypto';
const answers = process.argv.slice(2);
if (!answers.length) { console.error('usage: npm run gate -- <answer> [more answers]'); process.exit(1); }
for (const a of answers) {
  const n = a.replace(/\D+/g, '');
  console.log(`'${createHash('sha256').update(n).digest('hex')}',  // ${a}${n !== a ? ` → ${n}` : ''}`);
}
