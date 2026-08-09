const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('[NEXORA DEV SERVER] Starting Go backend and React frontend concurrently...');

// Start Go Backend
const backend = spawn('go', ['run', './cmd/server'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit',
});

// Start Vite Frontend
const frontend = spawn('npx', ['vite'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'inherit',
});

backend.on('error', (err) => {
  console.error('[NEXORA BACKEND ERROR]', err);
});

frontend.on('error', (err) => {
  console.error('[NEXORA FRONTEND ERROR]', err);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
