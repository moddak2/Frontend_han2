const { spawn } = require('node:child_process');
const electronPath = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, ['.'], {
  cwd: require('node:path').join(__dirname, '..'),
  env,
  stdio: 'inherit',
  windowsHide: false,
});

const stop = () => {
  if (!child.killed) child.kill();
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
child.once('error', (error) => {
  console.error('[electron-launcher] Electron을 시작하지 못했습니다.', error);
  process.exitCode = 1;
});
child.once('exit', (code) => {
  process.exit(code ?? 0);
});
