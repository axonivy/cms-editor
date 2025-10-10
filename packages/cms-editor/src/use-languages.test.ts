import type { Client, CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import { act, waitFor } from '@testing-library/react';
import { customRenderHook } from './context/test-utils/test-utils';
import { defaultLanguageTagsKey, getDefaultLanguageTagsLocalStorage, useLanguages } from './use-languages';

afterEach(() => localStorage.clear());

test('default languages set via local storage', async () => {
  localStorage.setItem(defaultLanguageTagsKey, '["de","en","fr"]');
  const view = renderLanguageHook('de', ['en', 'fr', 'ja']);
  await waitFor(() => expect(view.result.current.defaultLanguageTags).toEqual(['en', 'fr']));
  expect(view.result.current.languageDisplayName.resolvedOptions().locale).toEqual('de');
  expect(getDefaultLanguageTagsLocalStorage()).toEqual(['de', 'en', 'fr']);

  act(() => view.result.current.setDefaultLanguageTags(['ja']));
  view.rerender();
  expect(view.result.current.defaultLanguageTags).toEqual(['ja']);
  expect(view.result.current.languageDisplayName.resolvedOptions().locale).toEqual('de');
  expect(getDefaultLanguageTagsLocalStorage()).toEqual(['ja']);
});

test('default languages not set via local storage', async () => {
  let result = renderLanguageHook('de', []).result;
  expect(result.current.defaultLanguageTags).toEqual([]);
  expect(result.current.languageDisplayName.resolvedOptions().locale).toEqual('de');
  expect(getDefaultLanguageTagsLocalStorage()).toBeUndefined();

  result = renderLanguageHook('de', ['ja', 'en']).result;
  await waitFor(() => expect(result.current.defaultLanguageTags).toEqual(['en']));
  expect(result.current.languageDisplayName.resolvedOptions().locale).toEqual('de');
  expect(getDefaultLanguageTagsLocalStorage()).toEqual(['en']);

  localStorage.removeItem(defaultLanguageTagsKey);
  result = renderLanguageHook('de', ['ja', 'fr']).result;
  await waitFor(() => expect(result.current.defaultLanguageTags).toEqual(['ja']));
  expect(result.current.languageDisplayName.resolvedOptions().locale).toEqual('de');
  expect(getDefaultLanguageTagsLocalStorage()).toEqual(['ja']);
});

const renderLanguageHook = (clientLanguage: string, locales: Array<string>) => {
  return customRenderHook(() => useLanguages({} as CmsEditorDataContext), {
    wrapperProps: { clientLanguage, clientContext: { client: new TestClient(locales) } }
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
