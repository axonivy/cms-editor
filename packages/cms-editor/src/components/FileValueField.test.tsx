import type { CmsFileDataObject, CmsReadFileDataObject } from '@axonivy/cms-editor-protocol';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { customRender } from '../context/test-utils/test-utils';
import type { Language } from '../main/control/language-tool/language-utils';
import { fileValue, FileValueField, type FileValueFieldProps } from './FileValueField';

test('open file button', () => {
  const contentObject = { type: 'FILE', uri: '/ContentObject', values: { en: 'url' } } as unknown as CmsReadFileDataObject;
  const language = { label: 'English', value: 'en' };

  const view = renderFileValueField({ contentObject, language });
  expect(screen.queryByRole('button', { name: 'Open File' })).not.toBeInTheDocument();

  view.rerenderWithValues({ contentObject, language, allowOpenFile: true });
  expect(screen.getByRole('button', { name: 'Open File' })).toBeInTheDocument();

  view.rerenderWithValues({ contentObject, language: { label: 'German', value: 'de' }, allowOpenFile: true });
  expect(screen.queryByRole('button', { name: 'Open File' })).not.toBeInTheDocument();
});

describe('file pcker', () => {
  File.prototype.arrayBuffer = async () => new ArrayBuffer();

  test('choose file', async () => {
    const contentObject = { uri: '/ContentObject', values: {}, fileExtension: 'txt' } as CmsReadFileDataObject;
    const language = { label: 'English', value: 'en' };

    renderFileValueField({ contentObject, language, updateValue: (languageTag: string) => (contentObject.values[languageTag] = 'url') });
    expect(screen.getByRole('link')).toHaveTextContent('Choose File');

    await userEvent.upload(screen.getByLabelText('English'), new File(['content'], 'TestFile.txt'));
    await waitFor(() => {
      expect(screen.getByText('TestFile.txt')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('link')).toHaveTextContent('Change File');
    });
  });

  test('change file', async () => {
    const contentObject = { uri: '/ContentObject', values: { en: 'url' }, fileExtension: 'txt' } as unknown as CmsReadFileDataObject;
    const language = { label: 'English', value: 'en' };

    renderFileValueField({ contentObject, language });
    expect(screen.getByText('ContentObject.txt')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Change File');

    await userEvent.upload(screen.getByLabelText('English'), new File(['content'], 'TestFile.txt'));
    expect(screen.getByText('TestFile.txt')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Change File');
  });
});

test('fileValue', async () => {
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  expect(await fileValue(file)).toEqual('dGVzdA==');
});

const renderFileValueField = (props?: Partial<FileValueFieldProps>) => {
  const ui = (props?: Partial<FileValueFieldProps>) => (
    <FileValueField
      contentObject={props?.contentObject ?? ({} as CmsFileDataObject)}
      updateValue={props?.updateValue ?? (() => {})}
      deleteValue={props?.deleteValue ?? (() => {})}
      language={props?.language ?? ({} as Language)}
      allowOpenFile={props?.allowOpenFile}
      {...props}
    />
  );
  const view = customRender(ui(props));
  return {
    ...view,
    rerenderWithValues: (props?: Partial<FileValueFieldProps>) => view.rerender(ui(props))
  };
};
