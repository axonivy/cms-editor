import type { CmsReadFileDataObject } from '@axonivy/cms-editor-protocol';
import { screen } from '@testing-library/react';
import { customRender } from '../context/test-utils/test-utils';
import { FileValueField } from './FileValueField';

test('openFileButton', () => {
  const view = renderFileValueField('text/plain');
  expect(screen.queryByRole('button', { name: 'Open File' })).not.toBeInTheDocument();

  view.rerenderWithValues('text/plain', true);
  expect(screen.getByRole('button', { name: 'Open File' }).childNodes[0]).toHaveClass('ivy-file');

  view.rerenderWithValues('image/png', true);
  expect(screen.getByRole('button', { name: 'Open File' }).childNodes[0]).toHaveClass('ivy-custom-image');
});

const renderFileValueField = (mimeType: string, allowOpenFile?: boolean) => {
  const ui = (mimeType: string, allowOpenFile?: boolean) => (
    <FileValueField
      contentObject={{ type: 'FILE', values: { en: 'url' }, mimeType } as unknown as CmsReadFileDataObject}
      updateValue={() => {}}
      deleteValue={() => {}}
      language={{ label: 'English', value: 'en' }}
      allowOpenFile={allowOpenFile}
    />
  );
  const view = customRender(ui(mimeType, allowOpenFile));
  return {
    ...view,
    rerenderWithValues: (mimeType: string, allowOpenFile?: boolean) => view.rerender(ui(mimeType, allowOpenFile))
  };
};
