// <awo-map map> renders a MapDef with renderMap (the ground), stands its props and services on it like the scene does (y-sorted),
// and can overlay the legend read from the MapDef: spawns, bosses, exits, gates, services. Zoom ×1/×2, scroll inside.
import { MAPS, TILE, type MapDef } from '../../../../awo/shared/world.ts';
import { spawnsOf } from '../../../../awo/shared/zones.ts';
import { PROPS, renderMap, canvas, pen } from '../art.ts';
import { placeServices, type Piece } from '../services.ts';
import { texFrame, texture } from '../texStore.ts';
import { whenVisible } from './lazy.ts';

/** Standing pieces drawn y-sorted with origin (0.5, 1) at their feet; `f`: the frame of animated pieces (frame −1: flipped). */
export function drawPieces(c: CanvasRenderingContext2D, pieces: Piece[], f = 0) {
  for (const [key, x, foot, pf] of [...pieces].sort((a, b) => a[2] - b[2])) {
    const t = texture(key);
    if (!t) continue;
    const fr = texFrame(t, pf === undefined ? 0 : pf < 0 ? 0 : f % Math.max(1, t.frames.length));
    if (pf === -1) { c.save(); c.translate(Math.round(x), 0); c.scale(-1, 1); c.drawImage(t.cv, fr.x, fr.y, fr.w, fr.h, -Math.round(fr.w / 2), foot + 1 - fr.h, fr.w, fr.h); c.restore(); }
    else c.drawImage(t.cv, fr.x, fr.y, fr.w, fr.h, Math.round(x - fr.w / 2), foot + 1 - fr.h, fr.w, fr.h);
  }
}

/** The ground plus everything standing on it, in map pixels. */
export function paintMap(def: MapDef) {
  const cv = renderMap(def), c = cv.getContext('2d')!, rows = def.rows, W = rows[0].length, H = rows.length;
  const at = (tx: number, ty: number) => (tx < 0 || ty < 0 || tx >= W || ty >= H ? '#' : rows[ty][tx]);
  const pieces: Piece[] = placeServices(rows);
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const place = PROPS[rows[ty][tx]]?.(tx * TILE + 8, ty * TILE + 8, (dx, dy) => at(tx + dx, ty + dy));
    if (place) pieces.push([place[0], place[1], place[2], place[3] ? -1 : 0]);
  }
  drawPieces(c, pieces);
  return cv;
}

const LEGEND: Record<string, [label: string, color: string]> = {
  P: ['Llegada', '#fff3a8'], w: ['Llegada del onmyōji', '#c8b0f0'], R: ['Jefe errante', '#ff8ad0'], Y: ['Jefe de multitud', '#ff5a3a'],
  O: ['Jefe principal', '#ff3d3d'], A: ['Sello', '#8fd3ff'], B: ['Sello', '#8fd3ff'], S: ['Puerta de la arena', '#ffb060'],
  C: ['Mazmorra', '#b07aff'], M: ['Mazmorra', '#b07aff'], '<': ['Salida', '#ffffff'], '>': ['Salida', '#ffffff'],
  $: ['Puesto', '#e3c15a'], G: ['Herrero', '#ff9a2a'], D: ['Curandera', '#f6b6cf'], '§': ['Costurera', '#a8344a'], K: ['Almacén', '#c08a52'], m: ['Estela', '#8fd3ff'], N: ['Onmyōji', '#5a70c0'],
};

/** Coloured squares and names over the markers of the map (spawns say their MOBS kind). */
function paintLegend(def: MapDef) {
  const rows = def.rows, [cv, c] = canvas(rows[0].length * TILE, rows.length * TILE), { R } = pen(c);
  const spawns = spawnsOf(def), seen = new Set<string>();
  c.font = '8px DotGothic16, monospace';
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const spawn = spawns[ch], leg = LEGEND[ch];
    if (!spawn && !leg) return;
    const col = spawn ? '#7aff7a' : leg![1], label = spawn ? spawn : leg![0];
    R(x * TILE + 4, y * TILE + 4, 8, 8, col); R(x * TILE + 5, y * TILE + 5, 6, 6, '#000000aa'); R(x * TILE + 6, y * TILE + 6, 4, 4, col);
    const once = `${label}:${Math.floor(x / 12)}:${Math.floor(y / 8)}`; // one name per cluster, so a field of kodama is readable
    if (seen.has(once)) return;
    seen.add(once);
    c.fillStyle = '#000000cc'; c.fillRect(x * TILE + 13, y * TILE + 2, c.measureText(label).width + 4, 10);
    c.fillStyle = col; c.fillText(label, x * TILE + 15, y * TILE + 10);
  }));
  return cv;
}

class AwoMap extends HTMLElement {
  connectedCallback() { whenVisible(this, () => this.render()); }
  render() {
    const def = MAPS[this.getAttribute('map')!], scroll = this.querySelector('.scroll')!, ground = paintMap(def);
    const legend = paintLegend(def), stage = document.createElement('div');
    stage.className = 'stage';
    legend.className = 'legend';
    legend.hidden = this.getAttribute('legend') !== 'on';
    stage.append(ground, legend);
    scroll.replaceChildren(stage);
    let zoom = 1;
    const fit = () => { stage.style.width = `${ground.width * zoom}px`; stage.style.height = `${ground.height * zoom}px`; };
    fit();
    this.querySelectorAll<HTMLButtonElement>('button[data-zoom]').forEach((b) => (b.onclick = () => { zoom = +b.dataset.zoom!; fit(); this.querySelectorAll('button[data-zoom]').forEach((o) => o.classList.toggle('on', o === b)); }));
    const lg = this.querySelector<HTMLButtonElement>('button[data-legend]');
    if (lg) lg.onclick = () => { legend.hidden = !legend.hidden; lg.classList.toggle('on', !legend.hidden); };
  }
}
customElements.define('awo-map', AwoMap);
