// The game's painters draw on a DOM canvas (pen.ts › canvas()). At build time there is no DOM, so this installs the smallest
// `document.createElement('canvas')` that satisfies them, backed by @napi-rs/canvas: enough for makeTextures() and renderMap()
// to run in Node, so the Artboard's counts and the key check happen at build time instead of only in the browser.
import { createCanvas } from '@napi-rs/canvas';

if (typeof globalThis.document === 'undefined') {
  const make = (tag: string) => {
    if (tag !== 'canvas') throw new Error(`nodeCanvas: solo canvas, no <${tag}>`);
    const cv = createCanvas(1, 1) as unknown as HTMLCanvasElement;
    return cv;
  };
  // @ts-expect-error a stand-in with the one method the painters use
  globalThis.document = { createElement: make, documentElement: { style: { setProperty() {} } } };
}
export {};
