import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  vite: {
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      watch: {
        ignored: ['**/tests/e2e/**', '**/playwright-report/**'],
      },
    },
  },
});
