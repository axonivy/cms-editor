import type { CmsTranslationRequest } from '@axonivy/cms-editor-protocol';
import { useAppContext } from '../../../../context/AppContext';

export type ContentObjectTranslation = {
  uri: string;
  source: {
    languageTag: string;
    value: string;
  };
  values: {
    languageTag: string;
    value: string;
  }[];
};

export const ContentObjectTranslations = (translationRequests: CmsTranslationRequest[]): ContentObjectTranslation[] => {
  const { contentObjects } = useAppContext();
  return translationRequests.flatMap(translationRequest => {
    const targetLanguageTags = translationRequest.targetLanguageTags;
    const sourceLanguage = translationRequest.sourceLanguageTag;

    return contentObjects.map(contentObject => {
      const translations = targetLanguageTags.map(languageTag => {
        const value = contentObject.values[languageTag];
        return {
          languageTag,
          value: typeof value === 'string' ? value : ''
        };
      });

      const sourceValue = contentObject.values[sourceLanguage];
      return {
        uri: contentObject.uri,
        source: {
          languageTag: sourceLanguage,
          value: typeof sourceValue === 'string' ? sourceValue : ''
        },
        values: translations
      };
    });
  });
};

export const findTranslationByUri = (translations: ContentObjectTranslation[], uri: string): ContentObjectTranslation | undefined => {
  return translations.find(t => t.uri === uri);
};

export const getSourceValue = (translations: ContentObjectTranslation[], uri: string): string => {
  const translation = findTranslationByUri(translations, uri);
  return translation?.source.value ?? '-';
};

export const getTranslatedValue = (translations: ContentObjectTranslation[], uri: string, languageTag: string): string | null => {
  const translation = findTranslationByUri(translations, uri);
  if (!translation) return null;

  const value = translation.values.find(v => v.languageTag === languageTag);
  return value?.value ?? null;
};
