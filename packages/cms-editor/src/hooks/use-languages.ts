import type { CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import i18next from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useMeta } from '../protocol/use-meta';
import { defaultLanguageTag } from '../utils/language-utils';

export const defaultLanguageTagsKey = 'cms-editor-default-language-tags' as const;

export const useLanguages = (context: CmsEditorDataContext) => {
  const clientLanguageTag = i18next.language;
  const languageDisplayName = useMemo(() => new Intl.DisplayNames([clientLanguageTag], { type: 'language' }), [clientLanguageTag]);

  const locales = useMeta('meta/locales', context, []);
  const [defaultLanguageTags, setDefaultLanguageTagsState] = useState(defaultLanguages(locales.data));
  const setDefaultLanguageTags = (languageTags: Array<string>) => {
    setDefaultLanguageTagsState(filterNotPresentDefaultLanguageTags(languageTags, locales.data));
    setDefaultLanguageTagsLocalStorage(languageTags);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDefaultLanguageTagsState(defaultLanguages(locales.data)), [locales.data]);

  return { defaultLanguageTags, setDefaultLanguageTags, languageDisplayName };
};

const defaultLanguages = (locales: Array<string>): Array<string> => {
  if (locales.length === 0) {
    return [];
  }
  const defaultLanguageTags = getDefaultLanguageTagsLocalStorage();
  if (defaultLanguageTags) {
    return filterNotPresentDefaultLanguageTags(defaultLanguageTags, locales);
  }
  const defaultLanguages: Array<string> = [];
  const defaultLanguage = defaultLanguageTag(locales);
  if (defaultLanguage) {
    defaultLanguages.push(defaultLanguage);
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

export const filterNotPresentDefaultLanguageTags = (defaultLanguageTags: Array<string>, locales: Array<string>) =>
  defaultLanguageTags.filter(languageTag => locales.includes(languageTag));

const setDefaultLanguageTagsLocalStorage = (languageTags: Array<string>) =>
  localStorage.setItem(defaultLanguageTagsKey, JSON.stringify(languageTags));
