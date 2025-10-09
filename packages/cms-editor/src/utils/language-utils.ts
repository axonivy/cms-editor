import i18next from 'i18next';

export type Language = {
  value: string;
  label: string;
};

export const toLanguages = (locales: Array<string>, languageDisplayName: Intl.DisplayNames) => {
  return sortLanguages(locales.map(locale => ({ value: locale, label: languageDisplayName.of(locale) ?? locale })));
};

export const sortLanguages = (languages: Array<Language>) => {
  return languages.sort((option1, option2) => option1.label.localeCompare(option2.label));
};

export const defaultLanguageTag = (languageTags: Array<string>) => {
  if (languageTags.length === 0) {
    return;
  }
  const clientLanguageTag = i18next.language;
  if (languageTags.includes(clientLanguageTag)) {
    return clientLanguageTag;
  }
  if (languageTags.includes('en')) {
    return 'en';
  }
  return languageTags[0];
};
