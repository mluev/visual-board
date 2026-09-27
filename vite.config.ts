import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { resultsPlugin } from './vite-plugins/results';

export default defineConfig({
  plugins: [react(), tailwindcss(), resultsPlugin()],
  resolve: {
    alias: {
      '@kit': path.resolve(__dirname, 'src/kit'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // results/ is written by the app itself; reviews/ is watched by the results plugin.
    watch: { ignored: ['**/results/**'] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
