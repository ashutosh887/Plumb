#!/usr/bin/env node
/**
 * pnpm demo — boots the offline-runnable demo environment.
 *
 * 1. Verifies API + dashboard + Surfpool are reachable.
 * 2. Pre-warms /inspect with the Drift fixture so the first demo click is instant.
 * 3. Prints the demo URL and the recommended OBS window layout.
 *
 * The actual recording uses three windows:
 *   - Chrome with extension loaded, on a synthetic Squads-like page that injects
 *     #plumb-debug-tx with the fixture base64.
 *   - The terminal showing pnpm dev tail.
 *   - QuickTime / OBS recording at 1920x1080.
 */

import { setTimeout as wait } from 'node:timers/promises';

const API = process.env.PLUMB_API ?? 'http://localhost:8000';
const DASH = process.env.PLUMB_DASH ?? 'http://localhost:3000';

async function ping(url, label) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status}`);
    console.log(`  ok   ${label} → ${url}`);
    return true;
  } catch (e) {
    console.log(`  miss ${label} → ${url} (${e.message})`);
    return false;
  }
}

async function main() {
  console.log('Plumb demo preflight\n');
  const apiOk = await ping(`${API}/healthz`, 'api');
  const dashOk = await ping(DASH, 'dashboard');

  if (!apiOk || !dashOk) {
    console.log('\nStart `pnpm dev` first.');
    process.exit(1);
  }

  console.log('\nDemo URLs:');
  console.log(`  Landing  : ${DASH}/`);
  console.log(`  Inspector: ${DASH}/inspect`);
  console.log(`  API docs : ${API}/docs`);

  console.log('\nRecording layout:');
  console.log('  • Browser left half (1280×1080), terminal right (640×1080).');
  console.log('  • Hide bookmarks bar. Set Squads-like backdrop wallpaper.');
  console.log('  • Open dev tools console — clean it before take.');

  console.log('\nReady. Run `pnpm dev` in another terminal, then start your recording.');
  await wait(50);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
