// Every section of the Artboard, walked from the game's own registries: nothing is listed by hand, so a sprite added to the game
// shows up here on the next build. Each section is a title, a line of why, and the sprite keys it holds.
import { SHEETS, LOOKS, SKIN_ART, ICONS, SKIN_ART as SKINS } from './art.ts';
import { game, world } from './shared.ts';
import { SERVICES } from './services.ts';
import { textureKeys } from './texKeys.ts';

export type Section = { id: string; title: string; why: string; keys: string[]; scale?: number; kind?: 'sprite' | 'service' | 'map' | 'item' };

/** Which world a MOBS kind belongs to: the first map that spawns it (or that names it as one of its bosses). */
export function worldOfMob(kind: string) {
  for (const def of Object.values(world.MAPS)) {
    const spawns = def.spawns ?? game.SPAWN_KIND, b = def.bosses ?? {};
    if (Object.values(spawns).includes(kind) || Object.values(b).includes(kind)) return def.world;
  }
  return 0; // an elite's own sheet is its base mob's: it has no marker of its own
}
/** Sheet keys of a world, mobs before bosses, by level; `rest` collects the sheets no map claims. */
export function sheetsByWorld() {
  const byWorld = new Map<number, string[]>();
  for (const key of Object.keys(SHEETS)) {
    const w = game.MOBS[key] ? worldOfMob(key) : key.startsWith('ryu') ? 2 : key === 'hairyu' ? 3 : 0;
    byWorld.set(w, [...(byWorld.get(w) ?? []), key]);
  }
  for (const [w, keys] of byWorld) byWorld.set(w, keys.sort((a, b) => (game.MOBS[a]?.lvl ?? 99) - (game.MOBS[b]?.lvl ?? 99) || a.localeCompare(b)));
  return byWorld;
}

const WORLD_NAME: Record<number, string> = { 1: 'Valle de Kiri', 2: 'Montañas Orientales', 3: 'Cumbres Ancestrales' };

export function sections(): Section[] {
  const sheets = sheetsByWorld();
  const propKeys = textureKeys().props, uiKeys = textureKeys().ui;
  const out: Section[] = [
    { id: 'heroes', title: 'Héroes', why: 'Las cuatro hojas de jugador (sprites.ts, rikishi.ts): 20×26, tres direcciones y cinco frames cada una.', keys: Object.keys(LOOKS).map((w) => `hero:${w}`) },
    { id: 'retratos', title: 'Retratos', why: 'El frame de frente de cada hoja, como lo usan el login, el HUD y el telar (textures.ts › portrait).', keys: [...Object.keys(LOOKS), ...Object.keys(SKINS)].map((w) => `portrait:${w}`), scale: 4 },
    { id: 'skins', title: 'Skins', why: 'Las ocho skins de la costurera (skins.ts, skinsWar.ts, skinsShrine.ts), dos por clase.', keys: Object.keys(SKIN_ART).map((s) => `skin:${s}`) },
    { id: 'armas', title: 'Armas en mano', why: 'Lo que el jugador empuña (textures.ts y el `held` de cada skin): Entities las balancea con el golpe.', keys: uiKeys.filter((k) => k.startsWith('w-')).map((k) => `tex:${k}`), scale: 4 },
  ];
  for (const [w, keys] of [...sheets].filter(([w]) => w > 0).sort((a, b) => a[0] - b[0])) {
    out.push({ id: `mobs-${w}`, title: `Monstruos y jefes · mundo ${w}: ${WORLD_NAME[w]}`, why: `Las hojas de ${WORLD_NAME[w]} (sheets.ts), con su sombra bajo los pies y su número de frames.`, keys });
  }
  const orphan = sheets.get(0) ?? [];
  if (orphan.length) out.push({ id: 'mobs-0', title: 'Hojas sin mapa', why: 'Hojas registradas que ningún mapa coloca hoy (el cuerpo del dragón va aparte de su cabeza).', keys: orphan });
  out.push(
    { id: 'servicios', title: 'Servicios de aldea', why: 'Cada servicio es una escena pequeña sobre su bloque (npcs.ts, village.ts, seamstress.ts), colocada como en scene/npcs.ts.', keys: SERVICES.map((s) => s.id), kind: 'service' },
    { id: 'props', title: 'Props de los tres mundos', why: 'Lo que tiene altura y se rodea: su textura y su línea en PROPS (props.ts, mountainProps.ts, ancestralProps.ts).', keys: propKeys.map((k) => `tex:${k}`), scale: 2 },
    { id: 'proyectiles', title: 'Proyectiles y efectos', why: 'Lo que vuela y lo que destella (textures.ts): el cliente los rota y los tiñe.', keys: uiKeys.filter((k) => !k.startsWith('w-')).map((k) => `tex:${k}`), scale: 4 },
    { id: 'iconos', title: 'Iconos de la interfaz', why: 'Los iconos propios de la UI (icons.ts, iconsWorld.ts, iconsUi.ts): 16×16 en una sola paleta, con contorno.', keys: Object.keys(ICONS).map((i) => `icon:${i}`), scale: 4 },
    { id: 'objetos', title: 'Iconos de objeto', why: 'Uno por base de GEAR_BASES más el fragmento Kintsugi (items.ts): 16×16 con 1 px de contorno.', keys: Object.keys(game.BASES).filter((b) => game.BASES[b].slot !== 'skin'), kind: 'item' },
    { id: 'mapas', title: 'Mapas', why: 'Cada MapDef pintado entero (map.ts › renderMap) con sus props y servicios encima, y-sorted.', keys: Object.keys(world.MAPS), kind: 'map' },
  );
  return out;
}
