const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const variant = require('./variant.json');
for (const script of ['cart-check.cjs', 'cart-reset.cjs', 'cart-reset.cjs', 'cart-check.cjs']) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  const expected = script === 'cart-check.cjs' ? variant.cartExpectedExit : 0;
  if (result.status !== expected) throw new Error(`${script}: expected exit ${expected}, received ${result.status}`);
}
console.log(`PASS teaching contract (${variant.variant}); cart check exit ${variant.cartExpectedExit} is expected. This is not full-app acceptance.`);
