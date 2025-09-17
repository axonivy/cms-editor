import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), react(), dts({ tsconfigPath: './tsconfig.production.json' })],
  build: {
    outDir: 'lib',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'editor',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        '@axonivy/ui-components',
        '@axonivy/ui-icons',
        '@tanstack/react-query',
        '@tanstack/react-query-devtools',
        'i18next',
        'react-i18next',
        'react',
        'react-error-boundary',
        'react/jsx-runtime',
        'react-dom'
      ]
    }
  },
  test: {
    dir: 'src',
    include: ['**/*.test.ts?(x)'],
    alias: {
      '@axonivy/cms-editor-protocol': resolve(__dirname, '../../packages/protocol/src')
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/context/test-utils/setup-tests.tsx'],
    css: false,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: 'report.xml'
  }
});
