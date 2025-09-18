import root from '../../eslint.config.mjs';

export default config.defineConfig(...root, {
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/index.css'
    }
  }
});
