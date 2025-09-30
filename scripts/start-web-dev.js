#!/usr/bin/env node

const { spawn } = require('child_process');

const child = spawn('npx', ['expo', 'start', '--web', '--tunnel'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DEBUG: 'expo*',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
