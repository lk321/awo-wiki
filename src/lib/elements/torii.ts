// <awo-torii> paints the header's torii: the game's own texture (textures.ts › torii) with a shimenawa hung under the nuki, its
// rope in the rope tones the village uses (village.ts › ROPE) and three zigzag shide, lit from the top left like all the art.
import { canvas, pen } from '../art.ts';
import { texture } from '../texStore.ts';
import { upscale } from '../pixels.ts';

const ROPE = ['#f0e0a8', '#e3cf8a', '#b89a52'], SHIDE = ['#f4efe6', '#e4ddd0'];

export function headerTorii(k = 1) {
  const t = texture('torii')!, [cv, c] = canvas(t.cv.width, t.cv.height), { R } = pen(c);
  c.drawImage(t.cv, 0, 0);
  for (let x = 14; x <= 66; x++) { // the rope sags between the pillars under the nuki (y 21–25), twisted every other pixel
    const s = Math.round(3 * Math.sin(((x - 14) / 52) * Math.PI));
    R(x, 26 + s, 1, 2, ROPE[(x >> 1) % 2]); R(x, 26 + s, 1, 1, x % 5 ? ROPE[0] : ROPE[1]); R(x, 28 + s, 1, 1, ROPE[2]);
  }
  for (const x of [24, 40, 56]) { // shide: paper folded in a zigzag, hanging from the rope
    const s = Math.round(3 * Math.sin(((x - 14) / 52) * Math.PI));
    R(x, 29 + s, 2, 2, SHIDE[0]); R(x + 1, 31 + s, 2, 2, SHIDE[0]); R(x, 33 + s, 2, 2, SHIDE[0]); R(x + 1, 35 + s, 2, 1, SHIDE[1]); R(x + 2, 30 + s, 1, 1, SHIDE[1]);
  }
  return upscale(cv, k);
}

class AwoTorii extends HTMLElement {
  connectedCallback() { this.replaceChildren(headerTorii(+(this.getAttribute('scale') ?? 1))); }
}
customElements.define('awo-torii', AwoTorii);
