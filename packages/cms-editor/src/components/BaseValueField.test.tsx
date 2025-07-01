import type { CmsDataObjectValues } from '@axonivy/cms-editor-protocol';
import { screen } from '@testing-library/react';
import { customRender } from '../context/test-utils/test-utils';
import type { CmsValueDataObject } from '../utils/cms-utils';
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

const renderBaseValueField = (values: CmsDataObjectValues, readonly?: boolean) => {
  const ui = (values: CmsDataObjectValues) => (
    <BaseValueField contentObject={{ values } as CmsValueDataObject} deleteValue={() => {}} language={{ label: 'English', value: 'en' }} />
  );
  const view = customRender(ui(values), {
    wrapperProps: {
      readonlyContext: { readonly },
      appContext: { languageDisplayName: new Intl.DisplayNames(['en'], { type: 'language' }) }
    }
  });
  return { ...view, rerenderWithValues: (values: CmsDataObjectValues) => view.rerender(ui(values)) };
};
