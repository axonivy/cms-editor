import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 5000,
    rollupOptions: { input: { index: './index.html', mock: './mock.html' } }
  },
  server: { port: 3003 },
  resolve: {
    alias: {
      '@axonivy/cms-editor': resolve(__dirname, '../../packages/cms-editor/src'),
      '@axonivy/cms-editor-protocol': resolve(__dirname, '../../packages/protocol/src')
    }
  },
  base: './'
});
