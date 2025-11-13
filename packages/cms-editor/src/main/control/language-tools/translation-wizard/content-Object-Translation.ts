import type { CmsTranslationRequest, CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { useAppContext } from '../../../../context/AppContext';

export type ContentObjectTranslation = {
  uri: string;
  source: Record<string, string>;
  values: Record<
    string,
    {
      originalvalue?: string;
      value: string;
    }
  >;
};

export const useContentObjectTranslations = (translationRequest: CmsTranslationRequest): Array<ContentObjectTranslation> => {
  const { contentObjects } = useAppContext();

  const aggregateContentObjectTranslation = (
    contentObject: CmsValueDataObject,
    translationRequest: CmsTranslationRequest
  ): ContentObjectTranslation => {
    const sourceValue = contentObject.values[translationRequest.sourceLanguageTag];
    const values: Record<string, { originalvalue?: string; value: string }> = {};
    translationRequest.targetLanguageTags.forEach((l: string) => {
      const translatedValue = contentObject.values[l];

      values[l] = {
        originalvalue: typeof translatedValue === 'string' ? translatedValue : undefined,
        value: typeof translatedValue === 'string' && translatedValue !== sourceValue ? translatedValue : ''
      };
    });

    return {
      uri: contentObject.uri,
      source: {
        [translationRequest.sourceLanguageTag]: typeof sourceValue === 'string' ? sourceValue : ''
      },
      values
    };
  };

  return contentObjects.map(contentObject => aggregateContentObjectTranslation(contentObject, translationRequest));
};
