// The art files only import Phaser as a type (textures.ts, props.ts): this stub lets `astro check` read them without the engine.
declare namespace Phaser {
  namespace Textures { type TextureManager = { exists(key: string): boolean; addCanvas(key: string, cv: HTMLCanvasElement): { add(i: number, s: number, x: number, y: number, w: number, h: number): void } | null } }
  type Scene = any;
}
export default Phaser;
