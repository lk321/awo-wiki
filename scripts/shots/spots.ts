// Where to stand for each screenshot: a walkable pixel within the client's interact range (34 px) of a service's marker,
// found from the map's own ASCII rows, so a map edit moves the camera instead of breaking the shot.
import { MAPS, TILE, grid, markers, solidAt } from '../../../awo/shared/world.ts';

const REACH = 30; // under the client's INTERACT_RANGE (34) and the server's near() (40)

/** A walkable pixel within reach of a `ch` marker on `map`, preferring to stand south of it (facing the NPC). */
export function standBy(map: string, ch: string): [number, number] {
  const g = grid(map), marks = markers(g, ch);
  if (!marks.length) throw new Error(`spots: ${map} no tiene ningún «${ch}»`);
  const ring = [[0, 1], [0, 2], [1, 1], [-1, 1], [1, 0], [-1, 0], [0, -1], [2, 1], [-2, 1], [1, 2], [-1, 2]];
  for (const [mx, my] of marks) for (const [dx, dy] of ring) {
    const x = mx + dx * TILE, y = my + dy * TILE;
    if (Math.hypot(x - mx, y - my) <= REACH && !solidAt(g, x, y) && !solidAt(g, x - 5, y) && !solidAt(g, x + 5, y)) return [x, y];
  }
  throw new Error(`spots: no hay sitio libre junto a «${ch}» en ${map}`);
}

/** The pixel of a map marker itself (a gate, an arrival point). */
export function markerAt(map: string, ch: string): [number, number] {
  const m = markers(grid(map), ch)[0];
  if (!m) throw new Error(`spots: ${map} no tiene «${ch}»`);
  return m;
}

/** A clear patch of a map, for a shot of the world itself: its respawn marker. */
export const spawnOf = (map: string) => markerAt(map, MAPS[map].respawn);
