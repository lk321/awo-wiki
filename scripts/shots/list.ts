// Every screenshot the wiki shows: where the account has to stand, what to press and what the page must show before the shot.
// Adding a panel to the game is one line here plus its <Shot> on a page (check-refs.ts fails the build if the PNG is missing).
import type { Page } from 'playwright';
import { STATION, TELEPORT } from '../../../awo/shared/zones.ts';
import { markerAt } from './spots.ts';
import { pressUntil } from './game.ts';

export type Shot = {
  name: string;
  /** Where to stand: `by` a service's map marker, explicit pixels, or the map's spawn. */
  at?: { map: string; by?: string; xy?: [number, number] };
  grant?: Record<string, unknown>;
  login?: false;
  phone?: true;
  act?: (page: Page) => Promise<void>;
};

/** A panel opened by its own key. */
const open = (code: string, sel: string) => async (p: Page) => { await pressUntil(p, code, sel); await p.waitForTimeout(900); };
/** E next to the service you are already standing by, then its panel. */
const useNpc = (sel = '#shop') => (p: Page) => open('KeyE', sel)(p);

export const SHOTS: Shot[] = [
  { name: 'login', login: false, act: async (p) => { await p.waitForSelector('#login:not([hidden])'); await p.waitForTimeout(2500); } },
  // the three villages and the three field maps
  { name: 'kiri', at: { map: 'kiri' } },
  { name: 'bamboo', at: { map: 'bamboo' } },
  { name: 'takane', at: { map: 'takane' } },
  { name: 'yama', at: { map: 'yama' } },
  { name: 'hanazono', at: { map: 'hanazono' } },
  { name: 'sorei', at: { map: 'sorei' } },
  // every panel, each one opened the way a player opens it
  { name: 'bag', at: { map: 'kiri' }, act: open('KeyI', '#inv') },
  { name: 'profile', at: { map: 'kiri' }, act: open('KeyP', '#profile') },
  { name: 'zone-info', at: { map: 'bamboo' }, act: open('KeyM', '#zinfo') },
  { name: 'market', at: { map: 'kiri' }, act: open('KeyB', '#market') },
  { name: 'settings', at: { map: 'kiri' }, act: open('Escape', '#cfg') },
  { name: 'stall', at: { map: 'kiri', by: STATION.stall }, act: useNpc() },
  { name: 'smith', at: { map: 'kiri', by: STATION.smith }, act: useNpc() },
  { name: 'healer', at: { map: 'kiri', by: STATION.healer }, act: useNpc() },
  { name: 'seamstress', at: { map: 'takane', by: STATION.seamstress }, act: useNpc() },
  { name: 'storage', at: { map: 'kiri', by: 'K' }, act: useNpc('#inv') },
  { name: 'stele', at: { map: 'kiri', by: 'm' }, act: useNpc('#memory') },
  { name: 'teleport', at: { map: 'kiri', by: TELEPORT.npc }, act: useNpc('#tele') },
  // the chat with its filters, and the touch controls on a phone
  { name: 'chat', at: { map: 'kiri' }, act: async (p) => { await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.type('/help'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); } },
  { name: 'touch', at: { map: 'kiri' }, phone: true, act: async (p) => { await p.touchscreen.tap(188, 500); await p.waitForTimeout(1200); } },
  // the shrine: standing ON the gate tile makes the room travel you in (solo, as the leader of your own party of one)
  { name: 'shrine', at: { map: 'bamboo', xy: markerAt('bamboo', 'S') }, act: async (p) => { await p.waitForTimeout(10_000); } },
];
