#!/usr/bin/env node

import { runCli } from './cli.js';

console.warn('AVISO: install-in-project.js está obsoleto. Usa ionic-version init.');

runCli(['init', ...process.argv.slice(2)]).catch(error => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});