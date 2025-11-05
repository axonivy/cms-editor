import type { Client, CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { waitFor } from '@testing-library/react';
import { customRenderHook } from '../../../../context/test-utils/test-utils';
import { useLanguages, useTranslatableSelectedContentObjects } from './TranslationWizard';

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

test('useTranslatableSelectedContentObjects', () => {
  let contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  let result = renderSelectedContentObjectsHook(contentObjects, []).result;
  expect(result.current.allSelectedContentObjects).toEqual(contentObjects);
  expect(result.current.translatableSelectedContentObjectUris).toEqual(['contentObjectUri0', 'contentObjectUri2']);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([{ variant: 'warning', message: 'notFileMessage' }]);

  contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' },
    { uri: 'notTranslatable', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  result = renderSelectedContentObjectsHook(contentObjects, [1, 2, 3]).result;
  expect(result.current.allSelectedContentObjects).toEqual([contentObjects[1], contentObjects[2], contentObjects[3]]);
  expect(result.current.translatableSelectedContentObjectUris).toEqual(['contentObjectUri2']);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([
    { variant: 'error', message: 'notTranslatableMessage' },
    { variant: 'warning', message: 'notFileMessage' }
  ]);

  contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' },
    { uri: 'notTranslatable', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  result = renderSelectedContentObjectsHook(contentObjects, [1, 3]).result;
  expect(result.current.allSelectedContentObjects).toEqual([contentObjects[1], contentObjects[3]]);
  expect(result.current.translatableSelectedContentObjectUris).toEqual([]);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([
    { variant: 'error', message: 'No translatable Content Objects selected.' },
    { variant: 'error', message: 'notTranslatableMessage' },
    { variant: 'warning', message: 'notFileMessage' }
  ]);
});

const renderSelectedContentObjectsHook = (contentObjects: Array<CmsValueDataObject>, selectedContentObjects: Array<number>) => {
  return customRenderHook(
    () =>
      useTranslatableSelectedContentObjects([
        { condition: co => co.uri !== 'notTranslatable', message: { variant: 'error', message: 'notTranslatableMessage' } },
        { condition: co => co.type !== 'FILE', message: { variant: 'warning', message: 'notFileMessage' } }
      ]),
    {
      wrapperProps: { appContext: { contentObjects, selectedContentObjects } }
    }
  );
};
