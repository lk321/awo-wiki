// Browser-side pixel helpers: a monster sheet painted like textures.ts › sheet(), the shadow Entities puts under the feet,
// integer upscaling (never smoothed) and a frame cut out of a sheet.
import { canvas, outline, pen, OUT, SHEETS, SPR, type Sheet } from './art.ts';

export type Painted = { cv: HTMLCanvasElement; fw: number; fh: number; n: number; foot: number; shadow: number };

/** Every frame of a SHEETS entry in one row, with its outline: the same canvas the game registers as its texture. */
export function paintSheet(key: string): Painted {
  const s: Sheet = SHEETS[key], n = s.n ?? 4;
  const [cv, c] = canvas(s.fw * n, s.fh);
  for (let f = 0; f < n; f++) s.draw(pen(c, f * s.fw, 0), f);
  if (s.line !== false) outline(cv, s.line ?? OUT);
  return { cv, fw: s.fw, fh: s.fh, n, foot: s.foot, shadow: s.shadow };
}

/** An image (a data URL from textures.ts) decoded into a canvas. */
export const decode = (url: string) => new Promise<HTMLCanvasElement>((ok, bad) => {
  const img = new Image();
  img.onload = () => { const [cv, c] = canvas(img.width, img.height); c.drawImage(img, 0, 0); ok(cv); };
  img.onerror = bad;
  img.src = url;
});

/** The hero sheet's geometry (15 frames: 3 directions × idle + 4 walk). */
export const heroGeom = () => ({ fw: SPR.hero.fw, fh: SPR.hero.fh, n: 15, foot: SPR.hero.foot, shadow: 0.9 });

/** Entities.ts: the 'shadow' texture (an ellipse rx 7.5, ry 2.6) scaled by the sheet's `shadow` (×0.9 tall), alpha 0.3, at y + 1. */
export function shadowUnder(c: CanvasRenderingContext2D, cx: number, footY: number, scale: number) {
  const { E } = pen(c);
  c.globalAlpha = 0.3;
  E(cx, footY + 1, 7.5 * scale, 2.6 * scale * 0.9, '#000000');
  c.globalAlpha = 1;
}

/** `src` scaled ×k with nearest-neighbour: pixels stay square. */
export function upscale(src: HTMLCanvasElement, k: number, sx = 0, sw = src.width) {
  const [cv, c] = canvas(sw * k, src.height * k);
  c.imageSmoothingEnabled = false;
  c.drawImage(src, sx, 0, sw, src.height, 0, 0, sw * k, src.height * k);
  return cv;
}

/** A sheet drawn frame by frame with each frame's shadow under its feet, ×k. */
export function sheetWithShadows(src: HTMLCanvasElement, fw: number, foot: number, shadow: number, n: number, k: number) {
  const pad = 4; // room for the shadow below the feet
  const [cv, c] = canvas(fw * n, src.height + pad);
  for (let f = 0; f < n; f++) shadowUnder(c, f * fw + fw / 2, foot, shadow);
  c.drawImage(src, 0, 0);
  return upscale(cv, k);
}

/** One frame of a sheet, with its shadow, ×k. */
export function frameWithShadow(src: HTMLCanvasElement, fw: number, foot: number, shadow: number, f: number, k: number) {
  const [cv, c] = canvas(fw, src.height + 4);
  shadowUnder(c, fw / 2, foot, shadow);
  c.drawImage(src, f * fw, 0, fw, src.height, 0, 0, fw, src.height);
  return upscale(cv, k);
}
