// A pixel grid (iconsWorld.ts › Icon) as crisp SVG, at build time: one rect per run of a colour, shape-rendering crispEdges.
import type { Icon } from './art.ts';

export function gridSvg({ grid, palette }: Icon, k = 1) {
  const h = grid.length, w = grid[0].length, rects: string[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x], col = palette[ch];
      let n = 1;
      while (x + n < w && row[x + n] === ch) n++;
      if (col) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${col}"/>`);
      x += n;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * k}" height="${h * k}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
export const gridUrl = (icon: Icon) => `url("data:image/svg+xml,${encodeURIComponent(gridSvg(icon))}")`;
