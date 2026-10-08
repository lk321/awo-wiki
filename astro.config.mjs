// Starlight over the game's own code: pages import shared/ and client/src/art/ from ../awo by relative path (no copies).
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sidebar } from './src/sidebar.ts';

export default defineConfig({
  site: 'https://awo-ki.pages.dev',
  vite: { server: { fs: { allow: ['..'] } } },
  integrations: [
    starlight({
      title: 'Amazing World Online',
      description: 'La estela del santuario: todo el saber de Amazing World Online, con su arte vivo.',
      defaultLocale: 'root',
      locales: { root: { label: 'Español', lang: 'es' }, en: { label: 'English', lang: 'en' } },
      customCss: ['./src/styles/tokens.css', './src/styles/shrine.css', './src/styles/ema.css', './src/styles/art.css', '../awo/client/src/rarity.css'],
      components: {
        SiteTitle: './src/components/overrides/SiteTitle.astro',
        ThemeSelect: './src/components/overrides/ThemeSelect.astro',
        Hero: './src/components/overrides/Hero.astro',
      },
      favicon: '/favicon.svg',
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+JP:wght@400;700&display=swap' } },
      ],
      sidebar,
      pagefind: true,
      lastUpdated: false,
      credits: false,
    }),
  ],
});
