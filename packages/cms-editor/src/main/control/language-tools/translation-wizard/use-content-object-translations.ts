import type { CmsStringDataObject, CmsTranslationRequest, CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { useAppContext } from '../../../../context/AppContext';

export type ContentObjectTranslation = {
  uri: string;
  sourceValue: string;
  values: Record<
    string,
    {
      originalvalue?: string;
      value: string;
    }
  >;
};

const aggregateContentObjectTranslation = (
  contentObject: CmsValueDataObject,
  translationRequest: CmsTranslationRequest,
  contentObjects: CmsValueDataObject[]
): ContentObjectTranslation => {
  const existingValues = contentObjects.find(obj => obj.uri === contentObject.uri);
  const sourceValue = existingValues?.values[translationRequest.sourceLanguageTag];
  const values: Record<string, { originalvalue?: string; value: string }> = {};
  translationRequest.targetLanguageTags.forEach((l: string) => {
    const translatedValue = contentObject.values[l];
    const originalvalue = existingValues?.values[l];

    values[l] = {
      originalvalue: typeof originalvalue === 'string' ? originalvalue : undefined,
      value: typeof translatedValue === 'string' ? translatedValue : ''
    };
  });
  return {
    uri: contentObject.uri,
    sourceValue: typeof sourceValue === 'string' ? sourceValue : '',
    values
  };
};

export const useContentObjectTranslations = (
  translationRequest: CmsTranslationRequest,
  data: CmsStringDataObject[]
): Array<ContentObjectTranslation> => {
  const { contentObjects } = useAppContext();
  return data.map(contentObject => aggregateContentObjectTranslation(contentObject, translationRequest, contentObjects));
};
