import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'exporter': resolve(__dirname, './src/exporter/index.ts'),
        'editor-plugin': resolve(__dirname, './src/index.tsx'),
        'vite-plugin': resolve(__dirname, './src/vite/backend.ts'),
      },
    },
    rollupOptions: {
      external: [
        '@motion-canvas/2d',
        '@motion-canvas/core',
        '@motion-canvas/vite-plugin',
      ],
    },
  },
});
