// The wiki's favicon: the torii emblem (src/art/kami.ts) written out as crisp SVG, so the tab wears the same pixel art the
// pages do. Run it again if the emblem changes: npm run favicon
import { writeFileSync } from 'node:fs';
import { KAMI } from '../src/art/kami.ts';
import { gridSvg } from '../src/lib/svg.ts';

const out = new URL('../public/favicon.svg', import.meta.url);
writeFileSync(out, `${gridSvg(KAMI.torii.icon, 1)}\n`);
console.log('favicon.svg escrito desde el emblema del torii');
