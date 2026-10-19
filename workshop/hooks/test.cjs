const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const event = JSON.parse(fs.readFileSync(0, 'utf8'));
if (event.hook_event_name !== 'PostToolUse' || !['Edit', 'Write'].includes(event.tool_name)) {
  console.log('WORKSHOP_TEST_SKIPPED: outside PostToolUse Edit|Write');
  process.exit(0);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['run', 'test:workshop'], {
  cwd: path.resolve(__dirname, '../../src/iron-pets/frontend'),
  stdio: 'inherit', shell: process.platform === 'win32',
});
if (result.error) throw result.error;
process.exit(result.status === 0 ? 0 : 1);
