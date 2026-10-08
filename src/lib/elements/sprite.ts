// <awo-sprite key scale> paints a sheet of the game in a row of frames (with the shadow under each one's feet) and, with its
// play button, animates one frame. Keys: a SHEETS kind, hero:<weapon>, skin:<base>, portrait:<look>, icon:<name>, item:<base>, tex:<texture>.
import { SHEETS, SPR, ICONS, drawIcon, itemIcon, heroSheetURL, portrait, type PxIcon } from '../art.ts';
import { decode, frameWithShadow, heroGeom, paintSheet, sheetWithShadows, upscale, type Painted } from '../pixels.ts';
import { texFrame, texture } from '../texStore.ts';
import { ticker, whenVisible } from './lazy.ts';

async function paint(key: string): Promise<Painted> {
  const [kind, name] = key.includes(':') ? key.split(':', 2) : ['sheet', key];
  if (kind === 'sheet') return paintSheet(name);
  if (kind === 'hero' || kind === 'skin') return { cv: await decode(heroSheetURL(name)), ...heroGeom() };
  if (kind === 'portrait') { const cv = await decode(portrait(name)); return { cv, fw: SPR.hero.fw, fh: SPR.hero.fh, n: 1, foot: SPR.hero.foot, shadow: 0.9 }; }
  if (kind === 'icon') { const cv = drawIcon(ICONS[name as PxIcon]); return { cv, fw: cv.width, fh: cv.height, n: 1, foot: -9, shadow: 0 }; }
  if (kind === 'item') { const cv = await decode(itemIcon(name)); return { cv, fw: cv.width, fh: cv.height, n: 1, foot: -9, shadow: 0 }; }
  const t = texture(name);
  if (!t) throw new Error(`texture ${name}`);
  const f0 = texFrame(t), n = Math.max(1, t.frames.length);
  return { cv: t.cv, fw: f0.w, fh: f0.h, n, foot: f0.h - 1, shadow: 0 };
}

class AwoSprite extends HTMLElement {
  connectedCallback() { whenVisible(this, () => void this.render()); }
  async render() {
    const key = this.getAttribute('key')!, k = +(this.getAttribute('scale') ?? 3), single = this.hasAttribute('single');
    let p: Painted;
    try { p = await paint(key); } catch (e) { this.classList.add('broken'); this.title = String(e); return; }
    const box = this.querySelector('.art') ?? this.appendChild(Object.assign(document.createElement('div'), { className: 'art' }));
    const one = (f: number) => (p.shadow ? frameWithShadow(p.cv, p.fw, p.foot, p.shadow, f, k) : upscale(p.cv, k, f * p.fw, p.fw));
    const row = () => (single ? one(0) : p.shadow ? sheetWithShadows(p.cv, p.fw, p.foot, p.shadow, p.n, k) : upscale(p.cv, k));
    box.replaceChildren(row());
    const play = this.querySelector<HTMLButtonElement>('button.play');
    if (!play || p.n < 2) { play?.remove(); return; }
    let stop: (() => void) | undefined;
    const walk = key.startsWith('hero:') || key.startsWith('skin:'); // the hero sheet: direction 0, frames 1–4 are its walk
    play.onclick = () => {
      if (stop) { stop(); stop = undefined; box.replaceChildren(row()); play.textContent = play.dataset.play!; return; }
      play.textContent = play.dataset.stop!;
      stop = ticker(this, walk ? 110 : 220, (i) => {
        const f = walk ? 1 + (i % 4) : i % p.n;
        box.replaceChildren(one(f));
      });
    };
  }
}
customElements.define('awo-sprite', AwoSprite);
/** Keys a page may ask for: SHEETS kinds, heroes and skins by look, icons and item bases. */
export { SHEETS };
