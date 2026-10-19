const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'src/iron-pets/frontend/src/components/ui/Button.tsx');
const before = fs.readFileSync(file);
const original = 'disabled={disabled || isLoading}';
assert(before.toString().includes(original), 'Unexpected source; do not overwrite an existing exercise mutation.');
function invoke(tool) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'hooks/test.cjs')], {
    cwd: root, input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: tool }), encoding: 'utf8',
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  return result.status;
}
const backup = file + '.workshop-original';
fs.writeFileSync(backup, before, { flag: 'wx' });
function restore() { fs.writeFileSync(file, before); }
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { restore(); process.exit(130); });
try {
  assert.equal(invoke('Edit'), 0, 'Baseline must pass before mutation.');
  fs.writeFileSync(file, before.toString().replace(original, 'disabled={disabled}'));
  assert.equal(invoke('Write'), 1, 'Loading mutation must be caught.');
  assert.equal(invoke('Bash'), 0, 'Bash is outside the hook scope.');
} finally {
  restore();
  fs.unlinkSync(backup);
}
assert.equal(invoke('Edit'), 0, 'Restored source must pass.');
assert.deepEqual(fs.readFileSync(file), before);
console.log('PASS: manual hook handler baseline → detected mutation → restored baseline. Claude dispatch NOT tested.');
