// Real screenshots of the game for the wiki (public/shots). Needs awo running (`npm run dev`: server :2567, client :5180),
// MongoDB, and the test account (`cd server && npx tsx scripts/seed-test.ts`). Each shot places the account where it belongs
// through its own player document and drives the real client; nothing is faked. A shot that cannot be taken is reported, never
// skipped in silence. Usage: npm run shots [-- <nombre> …] to redo only some.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { closeDb, grant, login, phone, placeAt, requireAt, requireGame, GAME } from './shots/game.ts';
import { standBy, spawnOf } from './shots/spots.ts';
import { SHOTS, type Shot } from './shots/list.ts';

const OUT = new URL('../public/shots/', import.meta.url).pathname;
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const wanted = only.length ? SHOTS.filter((s) => only.includes(s.name)) : SHOTS;
if (!wanted.length) throw new Error(`No hay ninguna captura llamada ${only.join(', ')}. Hay: ${SHOTS.map((s) => s.name).join(', ')}`);

await requireGame();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const done: string[] = [], failed: [string, string][] = [];

/**
 * One shot: place the account, log in, drive the client, save the PNG. Retried, because the game's dev server is shared: an edit
 * to its sources makes Vite reload the page mid-shot, and a crowded room makes the first join slow.
 */
async function take(s: Shot, tries = 3): Promise<void> {
  for (let i = 1; i <= tries; i++) {
    const why = await attempt(s);
    if (!why) { done.push(s.name); console.log(`  ✓ ${s.name}`); return; }
    if (i === tries) { failed.push([s.name, why]); console.log(`  ✗ ${s.name}: ${why}`); return; }
    console.log(`  … ${s.name}: ${why} (reintento ${i + 1}/${tries})`);
  }
}

/** A single attempt; returns why it failed, or '' when the PNG is saved. */
async function attempt(s: Shot): Promise<string> {
  const ctx = s.phone ? await phone(browser) : await browser.newContext({ viewport: { width: 1280, height: 760 }, locale: 'es-ES' });
  const page = await ctx.newPage();
  try {
    if (s.grant) await grant(s.grant);
    const spot = s.at && (s.at.by ? standBy(s.at.map, s.at.by) : s.at.xy ?? spawnOf(s.at.map));
    if (s.at && spot) await placeAt(s.at.map, ...spot);
    if (s.login === false) await page.goto(GAME, { waitUntil: 'domcontentloaded' });
    else await login(page);
    if (s.at && spot && s.at.by) await requireAt(page, s.at.map, spot); // only where the shot needs a precise spot
    await s.act?.(page);
    await page.screenshot({ path: `${OUT}${s.name}.png` });
    return '';
  } catch (e) {
    return (e as Error).message.split('\n')[0];
  } finally {
    await ctx.close();
  }
}

console.log(`Capturando ${wanted.length} pantallas de ${GAME}…`);
for (const s of wanted) await take(s);
await browser.close();
await closeDb();

writeFileSync(`${OUT}index.json`, JSON.stringify({ at: new Date().toISOString(), done, failed }, null, 2));
console.log(`\n${done.length} capturas en public/shots/.`);
if (failed.length) {
  console.log(`${failed.length} no se pudieron hacer:`);
  for (const [n, why] of failed) console.log(`  · ${n}: ${why}`);
  process.exit(1);
}
