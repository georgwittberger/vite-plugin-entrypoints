import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import entrypoints from '../dist';

export default defineConfig({
  plugins: [
    entrypoints({
      baseDir: resolve(__dirname, 'src'),
      entryFilePatterns: ['modules/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: { main: resolve(__dirname, 'src/main.ts') },
    },
    rollupOptions: {
      output: [
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: 'chunks/[name].cjs',
          hoistTransitiveImports: false,
        },
        {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name].js',
          hoistTransitiveImports: false,
        },
      ],
    },
  },
});
