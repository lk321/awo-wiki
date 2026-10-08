// Driving the real game for the screenshots: logging the test account in, putting it where a shot needs it (through its own
// player document, like the seed script does) and the small waits the client needs. Never touches another account.
import type { Browser, Page } from 'playwright';
import { MongoClient } from 'mongodb';

export const GAME = process.env.AWO_URL ?? 'http://localhost:5180';
export const ACCOUNT = { user: 'ClaudeIA', pass: 'Kiri@2026' };
const MONGO = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017';
const DB = process.env.MONGO_DB ?? 'awo';

const client = new MongoClient(MONGO);
let players: Awaited<ReturnType<typeof open>> | undefined;
async function open() {
  await client.connect();
  return client.db(DB).collection('players');
}
const col = async () => (players ??= await open());
export const closeDb = () => client.close();

/**
 * Puts the account on `zone` at `(x, y)` before it logs in: the room reads the document when the player joins. The previous
 * shot's room writes the player's position when its socket closes, and that write lands **after** the browser context is gone, so
 * we wait for it first — otherwise it would overwrite this one and the shot would be framed somewhere else.
 */
export async function placeAt(zone: string, x: number, y: number) {
  await new Promise((r) => setTimeout(r, 2500));
  const c = await col();
  const r = await c.updateOne({ name: ACCOUNT.user }, { $set: { zone, x, y } });
  if (!r.matchedCount) throw new Error(`No existe la cuenta ${ACCOUNT.user}: ejecuta «cd server && npx tsx scripts/seed-test.ts» en awo`);
}

/** Where the client thinks the player is (the dev handle the client exposes on `window.awo`). */
export const whereIs = (page: Page) => page.evaluate(() => {
  const s = (window as any).awo;
  return s?.pred ? { x: Math.round(s.pred.x), y: Math.round(s.pred.y), map: s.g?.def?.id as string } : undefined;
});

/** Fails the attempt when the player did not land where the shot needs them, so the retry places them again. */
export async function requireAt(page: Page, map: string, [x, y]: [number, number]) {
  const at = await whereIs(page);
  if (!at) return; // no dev handle (a built client): trust the placement
  const d = Math.hypot(at.x - x, at.y - y);
  if (at.map !== map || d > 20) throw new Error(`El jugador aterrizó en ${at.map} (${at.x}, ${at.y}), no en ${map} (${x}, ${y}): la partida anterior reescribió su posición`);
}
/** Gives the account what a shot needs to show (a level, mon, a deed), without touching anything else. */
export const grant = async (set: Record<string, unknown>) => void (await (await col()).updateOne({ name: ACCOUNT.user }, { $set: set }));

/**
 * Logs in on the "Entrar" tab and waits until the game is really playable. The HUD is un-hidden the moment the room is joined,
 * long before the scene exists, so waiting for it is not enough: a big map (96×66) spends seconds painting its ground canvas and
 * the scene ignores every key until it is ready. We wait for Phaser's canvas and for the HUD to carry the player's name, which
 * only the running scene writes.
 */
export async function login(page: Page) {
  await page.goto(GAME, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login:not([hidden])', { timeout: 20_000 });
  await page.click('[data-tab="in"]');
  await page.fill('#l-user', ACCOUNT.user);
  await page.fill('#l-pass', ACCOUNT.pass);
  await page.click('#l-go');
  const err = await Promise.race([
    page.waitForSelector('#hud:not([hidden])', { timeout: 60_000 }).then(() => ''),
    page.waitForFunction(() => document.getElementById('l-err')?.textContent?.trim(), null, { timeout: 60_000 }).then((h) => h.jsonValue() as Promise<string>),
  ]);
  if (err) throw new Error(`El juego rechazó el inicio de sesión: «${err}»`);
  await page.waitForSelector('#game canvas', { timeout: 60_000 });
  await page.waitForFunction(() => !!document.getElementById('h-name')?.textContent?.trim(), null, { timeout: 60_000 });
  await page.waitForSelector('#loading[hidden]', { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2500); // the ambience settles and the first tick lands
}

/** A key the game's own listeners see (they read `event.code` on the document). */
export const press = async (page: Page, code: string, ms = 800) => { await page.keyboard.press(code); await page.waitForTimeout(ms); };

/**
 * Presses `code` until `sel` is showing. The scene drops every key until it finishes building, and a village service also needs
 * the server to answer, so one press is a coin flip; this retries instead of failing on the first miss.
 */
export async function pressUntil(page: Page, code: string, sel: string, tries = 12) {
  for (let i = 0; i < tries; i++) {
    await page.keyboard.press(code);
    try { await page.waitForSelector(`${sel}:not([hidden])`, { timeout: 1500 }); return; } catch { /* the scene was not listening yet */ }
  }
  throw new Error(`«${code}» no abrió ${sel} tras ${tries} intentos`);
}

/** Hides every panel, so the next shot starts clean. */
export async function closePanels(page: Page) {
  await page.evaluate(() => document.querySelectorAll<HTMLElement>('#ui > .panel:not(#login)').forEach((p) => (p.hidden = true)));
  await page.waitForTimeout(200);
}

/** Is the game's dev server up? A clear message beats a Playwright timeout. */
export async function requireGame() {
  const res = await fetch(GAME).catch(() => null);
  if (!res?.ok) throw new Error(`El juego no responde en ${GAME}.\n  Arráncalo en awo con «npm run dev» (servidor :2567 y cliente :5180) y vuelve a intentarlo.`);
}

/** A context that behaves like a phone, for the touch-controls shot. */
export const phone = (browser: Browser) =>
  browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'es-ES' });
