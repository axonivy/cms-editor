import config from '@axonivy/eslint-config';

export default config.defineConfig(
  ...config.base,
  ...config.i18n,
  ...config.tailwind('packages/cms-editor/src/index.css'),
  // TypeScript recommended configs
  {
    name: 'typescript-eslint',
    languageOptions: {
      parserOptions: {
        project: true, // Uses tsconfig.json from current directory
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
);
