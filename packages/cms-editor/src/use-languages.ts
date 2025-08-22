import type { CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import i18next from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useMeta } from './protocol/use-meta';

export const defaultLanguageTagsKey = 'cms-editor-default-language-tags' as const;

export const useLanguages = (context: CmsEditorDataContext) => {
  const clientLanguageTag = i18next.language;
  const languageDisplayName = useMemo(() => new Intl.DisplayNames([clientLanguageTag], { type: 'language' }), [clientLanguageTag]);

  const locales = useMeta('meta/locales', context, []);
  const [defaultLanguageTags, setDefaultLanguageTagsState] = useState(defaultLanguages(locales.data, clientLanguageTag));
  const setDefaultLanguageTags = (languageTags: Array<string>) => {
    setDefaultLanguageTagsState(filterNotPresentDefaultLanugageTags(languageTags, locales.data));
    setDefaultLanguageTagsLocalStorage(languageTags);
  };
  useEffect(() => setDefaultLanguageTagsState(defaultLanguages(locales.data, clientLanguageTag)), [locales.data, clientLanguageTag]);

  return { defaultLanguageTags, setDefaultLanguageTags, languageDisplayName };
};

const defaultLanguages = (locales: Array<string>, clientLanguageTag: string): Array<string> => {
  const firstLocale = locales[0];
  if (firstLocale === undefined) {
    return [];
  }
  const defaultLanguageTags = getDefaultLanguageTagsLocalStorage();
  if (defaultLanguageTags) {
    return filterNotPresentDefaultLanugageTags(defaultLanguageTags, locales);
  }
  const defaultLanguages: Array<string> = [];
  if (locales.includes(clientLanguageTag)) {
    defaultLanguages.push(clientLanguageTag);
  } else if (locales.includes('en')) {
    defaultLanguages.push('en');
  } else {
    defaultLanguages.push(firstLocale);
  }
  setDefaultLanguageTagsLocalStorage(defaultLanguages);
  return defaultLanguages;
};

export const getDefaultLanguageTagsLocalStorage = (): Array<string> | undefined => {
  const defaultLanguageTags = localStorage.getItem(defaultLanguageTagsKey);
  if (!defaultLanguageTags) {
    return undefined;
  }
  return JSON.parse(defaultLanguageTags);
};

export const filterNotPresentDefaultLanugageTags = (defaultLanguageTags: Array<string>, locales: Array<string>) =>
  defaultLanguageTags.filter(languageTag => locales.includes(languageTag));

const setDefaultLanguageTagsLocalStorage = (languageTags: Array<string>) =>
  localStorage.setItem(defaultLanguageTagsKey, JSON.stringify(languageTags));
