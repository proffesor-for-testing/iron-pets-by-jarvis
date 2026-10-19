// Explicit reset of ONE exercise file only. Preserve edited bytes before reset.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const relative = 'src/iron-pets/backend/src/middleware/validate.ts';
const target = path.join(root, relative);
const baseline = execFileSync('git', ['show', `HEAD:${relative}`], { cwd: root });
const current = fs.readFileSync(target);
if (baseline.equals(current)) { console.log('Already at this revision’s cart baseline; no files changed.'); process.exit(0); }
const backup = target + '.workshop-cart-backup';
// Refuse to overwrite an earlier learner backup.
fs.writeFileSync(backup, current, { flag: 'wx' });
fs.writeFileSync(target, baseline);
if (!fs.readFileSync(target).equals(baseline)) throw new Error('Reset byte verification failed; backup retained.');
console.log(`Restored only ${relative} from HEAD. Your prior bytes remain at ${backup}.`);
