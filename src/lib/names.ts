// Spanish names for the wiki's build-time tables, read from the game's own catalogue (shared/locales/es.ts): never typed twice.
import { es, game, mains, titles as T } from './shared.ts';

type Dict = Record<string, any>;
const d = es as Dict;

export const mobName = (kind: string) => game.MOBS[kind]?.name ?? kind;
export const itemName = (base: string) => d.item[base] ?? base;
export const rarityName = (r: number) => d.rarity[game.RARITY[r]];
export const statName = (k: string) => d.stat[k] ?? k;
export const className = (w: string) => d.class[w] ?? w;
export const skillName = (w: string) => d.skill[w] ?? w;
export const mapName = (id: string) => d.zone[id]?.name ?? id;
export const mapSub = (id: string): string => d.zone[id]?.sub ?? '';
export const mapIntro = (id: string): string => d.zone[id]?.intro ?? '';
export const mainName = (id: string) => d.main[id]?.name ?? mains.MAIN[id as mains.MainId]?.who ?? id;
export const mainPattern = (id: string, slot: string) => d.main[id]?.pattern?.[slot] ?? slot;
export const patternName = (p: string) => d.bossPat[p] ?? p;
export const titleName = (id: string) => d.titles[id]?.name ?? id;
export const titleHow = (id: string) => d.titles[id]?.how ?? '';
export const titleTier = (id: string) => T.TITLES[id as T.TitleId].tier;
export const roleName = (role: string) => d.zinfo.role[role] ?? role;
export const perkName = (k: string, n: number) => (d.perk[k] as string).replace('{{n}}', String(n));
export const goalText = (key: string) => (key.includes('.') ? key.split('.').reduce((o, k) => o?.[k], d) : d.goal[key]) ?? key;
export const targetName = (t: string) => d.target[t] ?? t;
export const settingsKeys = () => d.settings.key as Record<string, string>;
export const settingsLabel = (k: string) => d.settings[k] ?? k;
