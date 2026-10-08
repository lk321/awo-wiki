// The game's repo rule, kept here too: at most 500 lines per source file, one responsibility each (split by responsibility).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const MAX = 500;
function* files(p: string): Generator<string> {
  if (statSync(p).isDirectory()) for (const f of readdirSync(p)) yield* files(join(p, f));
  else if (/\.(ts|mjs|astro|css|mdx?)$/.test(p)) yield p;
}
test(`every file of the wiki has at most ${MAX} lines`, () => {
  const over = ['src', 'scripts', 'astro.config.mjs'].flatMap((s) => [...files(join(ROOT, s))])
    .map((f) => [f.slice(ROOT.length), readFileSync(f, 'utf8').split('\n').length] as const).filter(([, n]) => n > MAX);
  assert.deepEqual(over, [], `over the limit: ${over.map(([f, n]) => `${f}: ${n}`).join(', ')}`);
});
