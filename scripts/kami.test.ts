// The wiki's own icons (kami emblems and heading glyphs) follow the game's rule (awo/scripts/icons.test.ts): a 16×16 (or 8×8) grid
// painted only with its palette's colours, with the 1 px lacquer outline.
import test from 'node:test';
import assert from 'node:assert/strict';
import { KAMI } from '../src/art/kami.ts';
import { GLYPHS } from '../src/art/glyphs.ts';

test('every kami emblem is a 16×16 grid on its palette with an outline', () => {
  for (const [name, { icon: { grid, palette } }] of Object.entries(KAMI)) {
    assert.equal(grid.length, 16, `${name}: 16 rows`);
    for (const row of grid) assert.equal(row.length, 16, `${name}: 16 columns`);
    for (const ch of new Set(grid.join(''))) assert.ok(ch === '.' || palette[ch], `${name}: '${ch}' is not in its palette`);
    assert.ok(grid.join('').includes('k'), `${name}: has its 1 px outline`);
  }
});

test('every heading glyph is an 8×8 grid on its palette', () => {
  for (const [name, { grid, palette }] of Object.entries(GLYPHS)) {
    assert.equal(grid.length, 8, `${name}: 8 rows`);
    for (const row of grid) assert.equal(row.length, 8, `${name}: 8 columns`);
    for (const ch of new Set(grid.join(''))) assert.ok(ch === '.' || palette[ch], `${name}: '${ch}'`);
  }
});
