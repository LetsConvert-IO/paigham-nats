import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const VIDEO_DIR = '/tmp/paigham_video/';
mkdirSync(VIDEO_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } }
});
const page = await ctx.newPage();

console.log('→ Dashboard');
await page.goto('http://localhost:8080/');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);

console.log('→ Streams list');
await page.goto('http://localhost:8080/streams');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

console.log('→ Stream detail (first stream)');
// Click the first stream name link in the desktop table
const firstStreamLink = page.locator('table tbody tr:first-child td:first-child a').first();
await firstStreamLink.click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

console.log('→ Message browser');
const messagesLink = page.locator('a[href*="/messages"]').first();
await messagesLink.click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);

console.log('→ Back to streams');
await page.goto('http://localhost:8080/streams');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

console.log('Done — closing browser');
await ctx.close();
await browser.close();
console.log(`Video saved to ${VIDEO_DIR}`);
