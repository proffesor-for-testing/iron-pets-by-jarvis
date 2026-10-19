const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const [part, args] of [
  ['frontend', ['test', '--', '--runInBand', '--watch=false']],
  ['frontend', ['run', 'typecheck']],
  ['frontend', ['run', 'lint', '--', '--no-cache']],
  ['backend', ['run', 'build']],
  ['backend', ['run', 'test:unit']],
  ['backend', ['run', 'test:contracts']],
]) {
  const result = spawnSync(npm, args, { cwd: path.join(root, 'src/iron-pets', part), stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
