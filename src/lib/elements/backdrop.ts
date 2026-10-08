// <awo-backdrop> shows the login screen's backdrop (Fuji at dusk, the torii in the lake) with its cherry petals falling.
import { backdropURL, fallingPetals } from '../art.ts';

class AwoBackdrop extends HTMLElement {
  connectedCallback() {
    this.style.backgroundImage = `url(${backdropURL()})`;
    const start = fallingPetals(this);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  }
}
customElements.define('awo-backdrop', AwoBackdrop);
