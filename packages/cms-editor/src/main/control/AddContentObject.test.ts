import type { Client, CmsDataObject } from '@axonivy/cms-editor-protocol';
import { waitFor } from '@testing-library/react';
import { customRenderHook } from '../../context/test-utils/test-utils';
import { initialNamespace, namespaceOptions, useLanguageTags } from './AddContentObject';

test('initialNamespace', () => {
  const contentObjects = [{ uri: '/contentObject' }, { uri: '/folder/deep/contentObject' }] as Array<CmsDataObject>;
  expect(initialNamespace(contentObjects, undefined)).toEqual('');
  expect(initialNamespace(contentObjects, 0)).toEqual('');
  expect(initialNamespace(contentObjects, 1)).toEqual('/folder/deep');
});

test('useLanguageTags', async () => {
  let result = renderLanguageTagsHook([], []).result;
  expect(result.current.languageTags).toEqual([]);
  expect(result.current.languageTagsMessage).toBeUndefined();

  result = renderLanguageTagsHook(['de', 'en'], []).result;
  await waitFor(() => {
    expect(result.current.languageTags).toEqual(['de']);
  });
  expect(result.current.languageTagsMessage).toBeDefined();
  expect(result.current.languageTagsMessage?.message).toBeDefined();
  expect(result.current.languageTagsMessage?.variant).toEqual('info');

  result = renderLanguageTagsHook([], ['de', 'en']).result;
  await waitFor(() => {
    expect(result.current.languageTags).toEqual(['de', 'en']);
  });
  expect(result.current.languageTagsMessage).toBeUndefined();
});

test('namespaceOptions', () => {
  expect(
    namespaceOptions([
      { uri: '/a' },
      { uri: '/b' },
      { uri: '/c/a' },
      { uri: '/c/b' },
      { uri: '/c/c/a' },
      { uri: '/c/c/b' },
      { uri: '/d/a' }
    ] as Array<CmsDataObject>)
  ).toEqual([{ value: '' }, { value: '/c' }, { value: '/c/c' }, { value: '/d' }]);
});

const renderLanguageTagsHook = (locales: Array<string>, defaultLanguageTags: Array<string>) => {
  return customRenderHook(() => useLanguageTags(), {
    wrapperProps: { clientContext: { client: new TestClient(locales) }, appContext: { defaultLanguageTags } }
  });
};

class TestClient implements Partial<Client> {
  private readonly locales: Array<string>;

  constructor(locales: Array<string>) {
    this.locales = locales;
  }

  meta(): Promise<Array<string>> {
    return Promise.resolve(this.locales);
  }
}
