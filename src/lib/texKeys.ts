// The texture keys makeTextures() registers, split into what PROPS places on a map and what the UI and the fight use.
// Read from the painted store at build time, so a texture added to the game appears in the Artboard with no edit here.
import './nodeCanvas.ts';
import { textures } from './texStore.ts';
import { PROPS, SHEETS, LOOKS, SKIN_ART } from './art.ts';
import { SERVICES } from './services.ts';

/** Props come in numbered families (rock0…rock2, picked by position) or alone. `crystal` and `rock` with no number are
 *  projectiles, not props: the families only match when a digit follows. */
const FAMILIES = ['rock', 'bush', 'bamboo', 'pine', 'crystal', 'bones', 'spire', 'sakura', 'sugi', 'pillar', 'grave', 'koi'];
const SINGLES = ['toro', 'takemon', 'torii', 'otorii', 'nobori', 'hokora', 'cavemouth', 'pagoda'];
const isProp = (k: string) => SINGLES.includes(k) || k.startsWith('rail-') || FAMILIES.some((f) => new RegExp(`^${f}\\d+$`).test(k));

export function textureKeys() {
  const all = [...textures().keys()];
  const service = new Set(SERVICES.flatMap((s) => s.pieces(0, 0).map((p) => p[0])));
  const hero = new Set([...Object.keys(LOOKS), ...Object.keys(SKIN_ART)].map((w) => `p-${w}`));
  const props: string[] = [], ui: string[] = [];
  for (const k of all) {
    if (k in SHEETS || hero.has(k) || service.has(k)) continue; // sheets and services have their own Artboard sections
    (isProp(k) || k in PROPS ? props : ui).push(k);
  }
  return { props: props.sort(), ui: ui.sort(), all };
}
