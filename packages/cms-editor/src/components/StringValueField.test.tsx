import type { MapStringString } from '@axonivy/cms-editor-protocol';
import { screen } from '@testing-library/react';
import { customRender } from '../context/test-utils/test-utils';
import { StringValueField } from './StringValueField';

test('state', () => {
  const view = renderStringValueField({});
  expect(screen.getByLabelText('English')).toHaveValue('');
  expect(screen.getByLabelText('English')).toHaveAttribute('placeholder', '[no value]');

  view.rerenderWithValues({ en: '' });
  expect(screen.getByLabelText('English')).toHaveValue('');
  expect(screen.getByLabelText('English')).not.toHaveAttribute('placeholder', expect.anything());

  view.rerenderWithValues({ en: 'value' });
  expect(screen.getByLabelText('English')).toHaveValue('value');
  expect(screen.getByLabelText('English')).not.toHaveAttribute('placeholder', expect.anything());
});

const renderStringValueField = (values: MapStringString, readonly?: boolean) => {
  const ui = (values: MapStringString) => (
    <StringValueField values={values} updateValue={() => {}} deleteValue={() => {}} label='English' languageTag='en' />
  );
  const view = customRender(ui(values), {
    wrapperProps: {
      readonlyContext: { readonly },
      appContext: { languageDisplayName: new Intl.DisplayNames(['en'], { type: 'language' }) }
    }
  });
  return { ...view, rerenderWithValues: (values: MapStringString) => view.rerender(ui(values)) };
};
