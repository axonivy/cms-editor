import i18next from 'i18next';
import { defaultLanguageTag, sortLanguages, toLanguages, type Language } from './language-utils';

test('toLanguages', () => {
  const languageDisplayNameMock = {
    of: (languageTag: string) => `displayname of ${languageTag}`
  } as Intl.DisplayNames;
  expect(toLanguages(['B', 'A', 'C'], languageDisplayNameMock)).toEqual([
    { value: 'A', label: 'displayname of A' },
    { value: 'B', label: 'displayname of B' },
    { value: 'C', label: 'displayname of C' }
  ]);
});

test('sortLanguages', () => {
  expect(sortLanguages([{ label: 'C' }, { label: 'A' }, { label: 'B' }] as Array<Language>)).toEqual([
    { label: 'A' },
    { label: 'B' },
    { label: 'C' }
  ]);
});

test('defaultLanguageTag', () => {
  expect(defaultLanguageTag([])).toEqual(undefined);
  expect(defaultLanguageTag(['fr'])).toEqual('fr');
  expect(defaultLanguageTag(['de', 'fr'])).toEqual('de');
  expect(defaultLanguageTag(['de', 'en', 'fr'])).toEqual('en');
  i18next.language = 'fr';
  expect(defaultLanguageTag(['de', 'en', 'fr'])).toEqual('fr');
});
