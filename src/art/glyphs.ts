// Small pixel kana and kanji for the headings (one per section), 8×8 in the lacquer and red of the icon palette: drawn, not emoji.
import { ic, type Icon } from '../../../awo/client/src/art/iconsWorld.ts';

/** 山 (yama, mountain): worlds. */
export const YAMA = ic(['...k....', '...k....', '.k.k.k..', '.k.k.k..', '.k.k.k..', '.k.k.k..', '.kkkkk..', '........']);
/** 鬼 simplified to 田 over legs is unreadable at 8 px: the yokai use 妖's radical 女 (onna) → we use 虫 (mushi, creature). */
export const MUSHI = ic(['...k....', '.kkkkk..', '.k.k.k..', '.kkkkk..', '...k....', '.k.k.k..', '..kk.kk.', '........']);
/** 王 (ō, king): the main bosses. */
export const OU = ic(['.kkkkk..', '...k....', '...k....', '.kkkkk..', '...k....', '...k....', 'kkkkkkk.', '........']);
/** 刀 (katana, blade): classes and combat. */
export const KATANA = ic(['.kkkkk..', '...k.k..', '...k.k..', '...k.k..', '..k..k..', '.k...k..', 'k...kk..', '........']);
/** 金 (kin, gold): items. */
export const KIN = ic(['...k....', '..k.k...', '.k...k..', 'kkkkkkk.', '.k.k.k..', '..kkk...', '.kkkkk..', '........']);
/** 文 (mon, the coin): economy. */
export const MON = ic(['...k....', 'kkkkkkk.', '..k.k...', '..k.k...', '...k....', '..k.k...', '.k...k..', '........']);
/** 力 (chikara, strength): progression. */
export const CHIKARA = ic(['...k....', '.kkkkk..', '...k.k..', '...k.k..', '..k..k..', '.k...k..', 'k...kk..', '........']);
/** 手 (te, hand): the interface and controls. */
export const TE = ic(['..kkkk..', '...k....', '.kkkkk..', '...k....', 'kkkkkkk.', '...k....', '..kk....', '........']);
/** 絵 (e, picture) is too dense; 画 (ga) too: we use 美 (bi) reduced to 大 (dai) under a line → 示's kin, the shrine: 示 (shi). */
export const SHI = ic(['.kkkkk..', '........', 'kkkkkkk.', '...k....', '.k.k.k..', 'k..k..k.', '...k....', '........']);
/** 工 (kō, craft): the technical section. */
export const KOU = ic(['kkkkkkk.', '...k....', '...k....', '...k....', '...k....', '...k....', 'kkkkkkk.', '........']);

export const GLYPHS: Record<string, Icon> = { mundos: YAMA, bestiario: MUSHI, jefes: OU, clases: KATANA, objetos: KIN, economia: MON, progresion: CHIKARA, interfaz: TE, arte: SHI, tecnico: KOU, diseno: SHI };
