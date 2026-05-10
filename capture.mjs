// One-shot frame capture for the 3D scene.
// Run: node capture.mjs   (server on :8765 must be running)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.URL || 'http://localhost:8765/index.html';
const OUT = '_capture';
const VIEWPORT = { width: 1400, height: 900 };
const FRAMES = 30;
const INTERVAL_MS = 200;        // 30 * 200ms = 6 seconds → 5 fps GIF
const INTRO_WAIT_MS = 3500;     // skip dolly-in + texture load

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1.5 });
const page = await context.newPage();

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(INTRO_WAIT_MS);
console.log(`capturing ${FRAMES} frames @${INTERVAL_MS}ms ...`);

for (let i = 0; i < FRAMES; i++) {
  const name = `f_${String(i).padStart(3, '0')}.png`;
  await page.screenshot({ path: join(OUT, name), type: 'png' });
  process.stdout.write(`\r  ${i + 1}/${FRAMES}`);
  await page.waitForTimeout(INTERVAL_MS);
}
console.log('\ndone');

await browser.close();
