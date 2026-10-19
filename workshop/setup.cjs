const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
if (process.versions.node.split('.')[0] !== '22') throw new Error('Use the workshop Node 22 runtime.');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const part of ['frontend', 'backend']) {
  const cwd = path.join(root, 'src/iron-pets', part);
  const commands = [['ci', '--ignore-scripts', '--no-audit', '--no-fund']];
  if (part === 'backend') commands.push(['run', 'db:generate'], ['rebuild', 'bcrypt', '--no-audit', '--no-fund']);
  for (const args of commands) {
    const result = spawnSync(npm, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
