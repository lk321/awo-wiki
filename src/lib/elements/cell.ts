// <awo-cell base> paints an item's icon in a cell styled with the game's own rarity.css (frames.ts hands it the pixel art).
import { applyRarityArt, itemIcon } from '../art.ts';

let applied = false;
class AwoCell extends HTMLElement {
  connectedCallback() {
    if (!applied) { applyRarityArt(); applied = true; }
    const img = this.querySelector('img');
    if (img) img.src = itemIcon(this.getAttribute('base')!);
  }
}
customElements.define('awo-cell', AwoCell);
