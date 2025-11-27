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
  contentObjects: CmsStringDataObject[]
): ContentObjectTranslation => {
  const existingValues = contentObjects.find(obj => obj.uri === contentObject.uri);
  const sourceValue = existingValues?.values[translationRequest.sourceLanguageTag];
  const values: Record<string, { originalvalue?: string; value: string }> = {};
  translationRequest.targetLanguageTags.forEach((l: string) => {
    const translatedValue = contentObject.values[l] as string;
    const originalvalue = existingValues?.values[l];

    values[l] = {
      originalvalue,
      value: translatedValue
    };
  });
  return {
    uri: contentObject.uri,
    sourceValue: sourceValue ?? '',
    values
  };
};

export const useContentObjectTranslations = (
  translationRequest: CmsTranslationRequest,
  data: CmsStringDataObject[]
): Array<ContentObjectTranslation> => {
  const { contentObjects } = useAppContext();
  const filtered = contentObjects.filter(isCmsStringDataObject);
  return data.map(contentObject => aggregateContentObjectTranslation(contentObject, translationRequest, filtered));
};

export const isCmsStringDataObject = (contentObject: CmsValueDataObject): contentObject is CmsStringDataObject => {
  return typeof contentObject === 'object' && typeof contentObject.uri === 'string' && typeof contentObject.values === 'object';
};
