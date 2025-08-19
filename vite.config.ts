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
        'editor-plugin': resolve(__dirname, './src/index.tsx'),
        'vite-plugin': resolve(__dirname, './src/vite/backend.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        /node:/,
        /@motion-canvas/,
        /preact/,
      ],
    },
  },
});
