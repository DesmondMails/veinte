// @ts-check
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** @param {string} path */
const resolvePath = (path) => fileURLToPath(new URL(path, import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://veinte-espanol.netlify.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  vite: {
    resolve: {
      alias: {
        '@': resolvePath('./src'),
        '@components': resolvePath('./src/components'),
        '@layouts': resolvePath('./src/layouts'),
        '@styles': resolvePath('./src/styles'),
        '@scripts': resolvePath('./src/scripts'),
        '@lib': resolvePath('./src/lib'),
      },
    },
  },
});
