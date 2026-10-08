// What a map actually holds, read from its ASCII rows and its MapDef: which mobs stand on it and how many, its services,
// its exits and its markers. The wiki never lists a mob a map does not have.
import { game, world, zones } from './shared.ts';
import { SERVICES } from './services.ts';

const g = (id: string) => world.grid(id);

/** Every mob kind on the map with how many markers it has, normal mobs first then bosses, each by level. */
export function mobsOf(id: string) {
  const def = world.MAPS[id], spawns = zones.spawnsOf(def);
  const found = Object.entries(spawns).map(([ch, kind]) => ({ kind, n: world.markers(g(id), ch).length })).filter((x) => x.n > 0);
  const sort = (a: { kind: string }, b: { kind: string }) => game.MOBS[a.kind].lvl - game.MOBS[b.kind].lvl;
  return {
    mobs: found.filter((x) => !game.MOBS[x.kind].boss && !game.MOBS[x.kind].elite).sort(sort),
    elites: found.filter((x) => game.MOBS[x.kind].elite).sort(sort),
    bosses: found.filter((x) => game.MOBS[x.kind].boss).sort(sort),
  };
}
/** Every mob of the map as flat kinds (mobs, elites, then the bosses by role). */
export function kindsOf(id: string) {
  const { mobs, elites, bosses } = mobsOf(id), b = world.MAPS[id].bosses ?? {};
  const roles = (['sub', 'field', 'roam', 'crowd'] as const).map((r) => b[r]).filter((k): k is string => !!k);
  return [...new Set([...mobs, ...elites, ...bosses].map((x) => x.kind).concat(roles))];
}
/** The services standing on the map, in the order the wiki shows them. */
export const servicesOf = (id: string) => SERVICES.filter((s) => world.MAPS[id].rows.some((r) => r.includes(s.char)));
/** Where each exit of the map leads, named. */
export const exitsOf = (id: string) => Object.entries(world.MAPS[id].exits).map(([ch, e]) => ({ ch, ...e }));
/** The maps of a world, villages first, then field maps, dungeons and the arena. */
export const worldMaps = (n: number) => Object.values(world.MAPS).filter((m) => m.world === n)
  .sort((a, b) => Number(!!b.safe) - Number(!!a.safe) || Number(!!a.party) - Number(!!b.party) || (a.lvl?.[0] ?? 99) - (b.lvl?.[0] ?? 99));
/** How many tiles a map is, and its pixels. */
export const sizeOf = (id: string) => { const r = world.MAPS[id].rows; return { w: r[0].length, h: r.length, tiles: r[0].length * r.length }; };

/** Every map that spawns a kind, with how many of it stand there and at what level (a boss by role says its role). */
export function mapsOfMob(kind: string) {
  const out: { map: string; n: number; lvl: number; role?: string }[] = [];
  for (const def of Object.values(world.MAPS)) {
    const spawns = zones.spawnsOf(def), b = def.bosses ?? {};
    const role = (['sub', 'field', 'roam', 'crowd', 'main'] as const).find((r) => b[r] === kind);
    const n = Object.entries(spawns).filter(([, k]) => k === kind).reduce((a, [ch]) => a + world.markers(g(def.id), ch).length, 0);
    if (n || role) out.push({ map: def.id, n, lvl: zones.lvlIn(def, kind), role });
  }
  return out;
}

/** The sheet a mob is drawn with: an elite has none of its own, it reuses its base mob's (MobDef.elite.look, at ×1.25 with a gold aura). */
export const sheetOf = (kind: string) => game.MOBS[kind]?.elite?.look ?? kind;
