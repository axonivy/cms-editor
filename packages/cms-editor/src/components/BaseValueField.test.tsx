import type { MapStringString } from '@axonivy/cms-editor-protocol';
import { screen } from '@testing-library/react';
import { customRender } from '../context/test-utils/test-utils';
import { BaseValueField } from './BaseValueField';

test('state', () => {
  const view = renderBaseValueField({});
  expect(screen.getByRole('button')).toBeDisabled();

  view.rerenderWithValues({ en: '' });
  expect(screen.getByRole('button')).toBeEnabled();

  view.rerenderWithValues({ en: 'value' });
  expect(screen.getByRole('button')).toBeEnabled();
});

test('readonly', () => {
  renderBaseValueField({}, true);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

const renderBaseValueField = (values: MapStringString, readonly?: boolean) => {
  const ui = (values: MapStringString) => <BaseValueField values={values} deleteValue={() => {}} label='English' languageTag='en' />;
  const view = customRender(ui(values), {
    wrapperProps: {
      readonlyContext: { readonly },
      appContext: { languageDisplayName: new Intl.DisplayNames(['en'], { type: 'language' }) }
    }
  });
  return { ...view, rerenderWithValues: (values: MapStringString) => view.rerender(ui(values)) };
};
