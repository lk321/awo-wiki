// The village services as scene/npcs.ts composes them: each block's pieces (texture, x, the y of its feet, frame) over its
// tiles, plus the mini map each one stands on for the Service component. Numbers are the scene's (stand(): origin 0.5, 1).
import { world, zones } from './shared.ts';

export type Piece = [key: string, x: number, foot: number, frame?: number];
export type Service = { id: string; char: string; size: [number, number]; pieces: (ox: number, oy: number) => Piece[]; frames: number };

export const SERVICES: Service[] = [
  { id: 'stall', char: zones.STATION.stall, size: [3, 1], frames: 2, pieces: (ox, oy) => [['yatai', ox + 24, oy + 15, 0]] },
  { id: 'storage', char: 'K', size: [2, 1], frames: 1, pieces: (ox, oy) => [['kura', ox + 16, oy + 15]] },
  { id: 'stele', char: 'm', size: [1, 1], frames: 1, pieces: (ox, oy) => [['sekihi', ox + 8, oy + 14]] },
  { id: 'onmyoji', char: zones.TELEPORT.npc, size: [2, 1], frames: 2, pieces: (ox, oy) => [['shikiban', ox + 24, oy + 13], ['onmyoji', ox + 8, oy + 14, 0]] },
  { id: 'portal', char: 'W', size: [1, 1], frames: 4, pieces: (ox, oy) => [['vortex', ox + 8, oy + 9, 0], ['warp', ox + 8, oy + 14]] },
  { id: 'smith', char: zones.STATION.smith, size: [5, 2], frames: 3, pieces: (ox, oy) => [['forge', ox + 23, oy + 18], ['kajirack', ox + 70, oy + 16], ['mizubune', ox + 70, oy + 30], ['smith', ox + 48, oy + 30, 0]] },
  { id: 'healer', char: zones.STATION.healer, size: [4, 2], frames: 3, pieces: (ox, oy) => [['saidan', ox + 32, oy + 6], ['koro', ox + 9, oy + 28], ['yakuban', ox + 54, oy + 28], ['healer', ox + 32, oy + 25, 0]] },
  { id: 'seamstress', char: zones.STATION.seamstress, size: [4, 2], frames: 3, pieces: (ox, oy) => [['monohoshi', ox + 12, oy + 14], ['itokake', ox + 57, oy + 26], ['itohime', ox + 36, oy + 28, 0]] },
];
export const serviceOf = (id: string) => SERVICES.find((s) => s.id === id);

/** Top-left tile of every block of `ch` (art/npcs.ts › blockCorners, for rows of strings). */
export const blockCorners = (rows: string[], ch: string) => {
  const out: [number, number][] = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === ch && r[x - 1] !== ch && rows[y - 1]?.[x] !== ch) out.push([x, y]); }));
  return out;
};

/** Every service piece standing on a map, in pixels. */
export function placeServices(rows: string[]): Piece[] {
  const T = world.TILE, out: Piece[] = [];
  for (const s of SERVICES) for (const [tx, ty] of blockCorners(rows, s.char)) out.push(...s.pieces(tx * T, ty * T));
  return out;
}

/** A tiny map with one service on grass, enough room above for its art (the Service component renders it like a real map). */
export function serviceMap(s: Service): world.MapDef {
  const [w, h] = s.size, cols = w + 4, top = 4, rows: string[] = [];
  for (let y = 0; y < top + h + 2; y++) {
    let r = '';
    for (let x = 0; x < cols; x++) r += y >= top && y < top + h && x >= 2 && x < 2 + w ? s.char : '.';
    rows.push(r);
  }
  if (s.id === 'onmyoji') rows[top + 1] = rows[top + 1].slice(0, 2) + zones.TELEPORT.arrive + rows[top + 1].slice(3); // his Seiman where travellers land
  return { id: `svc-${s.id}`, world: 1, ground: '.', safe: true, rows, exits: {}, respawn: '.' };
}
