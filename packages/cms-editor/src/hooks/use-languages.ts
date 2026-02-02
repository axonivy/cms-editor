import type { CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import i18next from 'i18next';
import { useMemo, useState } from 'react';
import { useMeta } from '../protocol/use-meta';
import { defaultLanguageTag } from '../utils/language-utils';

export const defaultLanguageTagsKey = 'cms-editor-default-language-tags' as const;

export const useLanguages = (context: CmsEditorDataContext) => {
  const clientLanguageTag = i18next.language;
  const languageDisplayName = useMemo(() => new Intl.DisplayNames([clientLanguageTag], { type: 'language' }), [clientLanguageTag]);

  const [defaultLanguageTagsState, setDefaultLanguageTagsState] = useState(getDefaultLanguageTagsLocalStorage());
  const setDefaultLanguageTags = (languageTags: Array<string>) => {
    setDefaultLanguageTagsState(languageTags);
    setDefaultLanguageTagsLocalStorage(languageTags);
  };

  const locales = useMeta('meta/locales', context, []);
  const defaultLanguageTags = useMemo(
    () => defaultLanguages(locales.data, defaultLanguageTagsState, setDefaultLanguageTags),
    [locales.data, defaultLanguageTagsState]
  );

  return { defaultLanguageTags, setDefaultLanguageTags, languageDisplayName };
};

const defaultLanguages = (
  locales: Array<string>,
  defaultLanguageTags: Array<string> | undefined,
  setDefaultLanguageTags: (languageTags: Array<string>) => void
): Array<string> => {
  if (locales.length === 0) {
    return [];
  }
  if (defaultLanguageTags) {
    return filterNotPresentDefaultLanguageTags(defaultLanguageTags, locales);
  }
  const defaultLanguages: Array<string> = [];
  const defaultLanguage = defaultLanguageTag(locales);
  if (defaultLanguage) {
    defaultLanguages.push(defaultLanguage);
  }
  setDefaultLanguageTags(defaultLanguages);
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
