// Build gate: every sprite key, map, icon, item base and screenshot a page references must exist. A typo (or a sprite renamed in
// the game) fails the build here instead of leaving a silent hole on the page. Run by `npm run build` before astro build.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import '../src/lib/nodeCanvas.ts';
import { SHEETS, LOOKS, SKIN_ART, ICONS } from '../src/lib/art.ts';
import { game, world } from '../src/lib/shared.ts';
import { textureKeys } from '../src/lib/texKeys.ts';
import { SERVICES } from '../src/lib/services.ts';
import { KAMI } from '../src/art/kami.ts';
import { GLYPHS } from '../src/art/glyphs.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const tex = new Set(textureKeys().all), bad: string[] = [];

function* files(p: string): Generator<string> {
  if (statSync(p).isDirectory()) for (const f of readdirSync(p)) yield* files(join(p, f));
  else if (/\.(astro|mdx?)$/.test(p)) yield p;
}
const say = (file: string, what: string) => bad.push(`${file.slice(ROOT.length)}: ${what}`);

/** Does a sprite key name something the game registers? */
function spriteOk(key: string) {
  const [kind, name] = key.includes(':') ? key.split(':', 2) : ['sheet', key];
  switch (kind) {
    case 'sheet': return name in SHEETS;
    case 'hero': return name in LOOKS;
    case 'skin': return name in SKIN_ART;
    case 'portrait': return name in LOOKS || name in SKIN_ART;
    case 'icon': return name in ICONS;
    case 'item': return name in game.BASES;
    case 'tex': return tex.has(name);
    default: return false;
  }
}

const RULES: [re: RegExp, ok: (v: string) => boolean, what: string][] = [
  [/<Sprite\s[^>]*?key=(?:"([^"]+)"|\{`([^`$]+)`\})/g, spriteOk, 'clave de sprite'],
  [/<PhaserTexture\s[^>]*?key="([^"]+)"/g, (v) => tex.has(v), 'textura de Phaser'],
  [/<MapView\s[^>]*?map="([^"]+)"/g, (v) => v in world.MAPS, 'mapa'],
  [/<Service\s[^>]*?service="([^"]+)"/g, (v) => SERVICES.some((s) => s.id === v), 'servicio'],
  [/<Frame\s[^>]*?base="([^"]+)"/g, (v) => v in game.BASES, 'base de objeto'],
  [/<Kami\s[^>]*?id="([^"]+)"/g, (v) => v in KAMI, 'kami'],
  [/<Patron\s[^>]*?kami="([^"]+)"/g, (v) => v in KAMI, 'kami'],
  [/<Patron\s[^>]*?section="([^"]+)"/g, (v) => v in GLYPHS, 'glifo de sección'],
  [/<Shot\s[^>]*?name="([^"]+)"/g, (v) => existsSync(join(ROOT, 'public/shots', `${v}.png`)), 'captura en public/shots'],
];

for (const file of files(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const [re, ok, what] of RULES) for (const m of src.matchAll(re)) {
    const v = m[1] ?? m[2];
    if (v && !v.includes('${') && !ok(v)) say(file, `${what} inexistente «${v}»`);
  }
  for (const m of src.matchAll(/(?:src|href)="(\/[^"#?]+\.(?:png|jpg|svg|webp))"/g)) {
    if (!existsSync(join(ROOT, 'public', m[1]))) say(file, `fichero ausente en public${m[1]}`);
  }
}

if (bad.length) { console.error(`check-refs: ${bad.length} referencia(s) rota(s)\n  ${bad.join('\n  ')}`); process.exit(1); }
console.log(`check-refs: ok · ${Object.keys(SHEETS).length} hojas, ${tex.size} texturas, ${Object.keys(world.MAPS).length} mapas, ${Object.keys(ICONS).length} iconos, ${Object.keys(game.BASES).length} bases`);
