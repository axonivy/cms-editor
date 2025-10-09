import type { Client } from '@axonivy/cms-editor-protocol';
import { waitFor } from '@testing-library/react';
import { customRenderHook } from '../../../context/test-utils/test-utils';
import { useLanguages } from './TranslationWizard';

describe('useLanguages', () => {
  test('languages', async () => {
    let result = renderLanguagesHook([], []).result;
    expect(result.current.languages).toEqual([]);

    result = renderLanguagesHook(['de', 'en', 'fr'], []).result;
    await waitFor(() =>
      expect(result.current.languages).toEqual([
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' }
      ])
    );
  });

  describe('defaultSourceLanguageTag', () => {
    test('no default language tags', async () => {
      let result = renderLanguagesHook([], []).result;
      expect(result.current.defaultSourceLanguageTag).toBeUndefined();

      result = renderLanguagesHook(['de'], []).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('de'));

      result = renderLanguagesHook(['de', 'en'], []).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('en'));

      result = renderLanguagesHook(['de', 'en', 'fr'], []).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('fr'));
    });

    test('use default language tags', async () => {
      let result = renderLanguagesHook(['de', 'en', 'fr'], ['de']).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('de'));

      result = renderLanguagesHook(['de', 'en', 'fr'], ['de', 'en']).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('en'));

      result = renderLanguagesHook(['de', 'en', 'fr'], ['de', 'en', 'fr']).result;
      await waitFor(() => expect(result.current.defaultSourceLanguageTag).toEqual('fr'));
    });
  });
});

const renderLanguagesHook = (locales: Array<string>, defaultLanguageTags: Array<string>) => {
  return customRenderHook(() => useLanguages(), {
    wrapperProps: {
      clientLanguage: 'fr',
      clientContext: { client: new TestClient(locales) },
      appContext: { defaultLanguageTags, languageDisplayName: new Intl.DisplayNames(['en'], { type: 'language' }) }
    }
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
