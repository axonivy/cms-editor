import base from '@axonivy/prettier-config';

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...base,
  tailwindStylesheet: 'packages/cms-editor/src/index.css'
};

export default config;
