// <awo-service id> stands one village service on a patch of grass, with its yard and shadows painted by the map renderer and its
// pieces y-sorted the way scene/npcs.ts places them; its play button runs the NPC's frames (the smith's hammer, the healer's bells).
import { canvas, renderMap } from '../art.ts';
import { serviceMap, serviceOf } from '../services.ts';
import { drawPieces } from './map.ts';
import { upscale } from '../pixels.ts';
import { TILE } from '../../../../awo/shared/world.ts';
import { ticker, whenVisible } from './lazy.ts';

class AwoService extends HTMLElement {
  connectedCallback() { whenVisible(this, () => this.render()); }
  render() {
    const svc = serviceOf(this.getAttribute('service')!)!, def = serviceMap(svc), k = +(this.getAttribute('scale') ?? 3);
    const box = this.querySelector('.art')!, play = this.querySelector<HTMLButtonElement>('button.play');
    const ground = renderMap(def), pieces = svc.pieces(2 * TILE, 4 * TILE);
    const draw = (f: number) => {
      const [cv, c] = canvas(ground.width, ground.height);
      c.drawImage(ground, 0, 0);
      drawPieces(c, pieces, f);
      return upscale(cv, k);
    };
    box.replaceChildren(draw(0));
    if (!play || svc.frames < 2) { play?.remove(); return; }
    let stop: (() => void) | undefined;
    play.onclick = () => {
      if (stop) { stop(); stop = undefined; box.replaceChildren(draw(0)); play.textContent = play.dataset.play!; return; }
      play.textContent = play.dataset.stop!;
      stop = ticker(this, svc.id === 'portal' ? 110 : 280, (i) => box.replaceChildren(draw(i)));
    };
  }
}
customElements.define('awo-service', AwoService);
