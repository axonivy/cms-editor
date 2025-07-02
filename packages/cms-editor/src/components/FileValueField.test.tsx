import type { CmsReadFileDataObject } from '@axonivy/cms-editor-protocol';
import { screen } from '@testing-library/react';
import { customRender } from '../context/test-utils/test-utils';
import { FileValueField } from './FileValueField';

test('openFileButton', () => {
  const view = renderFileValueField('txt');
  expect(screen.queryByRole('button', { name: 'Open File' })).not.toBeInTheDocument();

  view.rerenderWithValues('txt', true);
  expect(screen.getByRole('button', { name: 'Open File' }).childNodes[0]).toHaveClass('ivy-file');

  view.rerenderWithValues('png', true);
  expect(screen.getByRole('button', { name: 'Open File' }).childNodes[0]).toHaveClass('ivy-custom-image');
});

const renderFileValueField = (fileExtension: string, allowOpenFile?: boolean) => {
  const ui = (fileExtension: string, allowOpenFile?: boolean) => (
    <FileValueField
      contentObject={{ values: { en: 'url' }, fileExtension } as unknown as CmsReadFileDataObject}
      updateValue={() => {}}
      deleteValue={() => {}}
      language={{ label: 'English', value: 'en' }}
      allowOpenFile={allowOpenFile}
    />
  );
  const view = customRender(ui(fileExtension, allowOpenFile));
  return {
    ...view,
    rerenderWithValues: (fileExtension: string, allowOpenFile?: boolean) => view.rerender(ui(fileExtension, allowOpenFile))
  };
};
