import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        'exporter': resolve(__dirname, './src/exporter/index.ts'),
        'editor-plugin': resolve(__dirname, './src/index.tsx'),
        'vite-plugin': resolve(__dirname, './src/vite/backend.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'node:fs/promises',
        '@motion-canvas/2d',
        '@motion-canvas/core',
        '@motion-canvas/vite-plugin',
        'preact',
      ],
    },
  },
});
