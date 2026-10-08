// A stand-in for Phaser's TextureManager: the two methods textures.ts and props.ts call (exists, addCanvas → add frames), so
// makeTextures() paints every texture of the game (torii, props, services, weapons, projectiles, fx) into plain canvases, once.
import { makeTextures } from './art.ts';

export type Tex = { key: string; cv: HTMLCanvasElement; frames: { x: number; y: number; w: number; h: number }[] };

class TexStore {
  readonly all = new Map<string, Tex>();
  exists(key: string) { return this.all.has(key); }
  addCanvas(key: string, cv: HTMLCanvasElement) {
    const tex: Tex = { key, cv, frames: [] };
    this.all.set(key, tex);
    return { add: (_i: number, _s: number, x: number, y: number, w: number, h: number) => void tex.frames.push({ x, y, w, h }) };
  }
}

let store: TexStore | undefined;
/** Every texture of the game, painted on first use. */
export function textures() {
  if (!store) { store = new TexStore(); makeTextures(store as any); }
  return store.all;
}
export const texture = (key: string) => textures().get(key);
/** Frame `f` of a texture (a single texture: the whole canvas). */
export const texFrame = (t: Tex, f = 0) => t.frames[f] ?? { x: 0, y: 0, w: t.cv.width, h: t.cv.height };
