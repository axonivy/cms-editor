import type { CmsStringDataObject, CmsTranslationRequest, CmsTranslationResponse } from '@axonivy/cms-editor-protocol';
import { useMemo } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { isCmsStringDataObject } from '../../../../utils/cms-utils';

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
  contentObject: CmsTranslationResponse,
  translationRequest: CmsTranslationRequest,
  contentObjects: Array<CmsStringDataObject>
): ContentObjectTranslation => {
  const existingValues = contentObjects.find(obj => obj.uri === contentObject.uri);
  const sourceValue = existingValues?.values[translationRequest.sourceLanguageTag];
  const values: Record<string, { originalvalue?: string; value: string }> = {};
  translationRequest.targetLanguageTags.forEach((l: string) => {
    const translatedValue = contentObject.values[l]?.translation ?? '';
    const originalvalue = contentObject.values[l]?.original ?? '';

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
  data: Array<CmsTranslationResponse>
): Array<ContentObjectTranslation> => {
  const { contentObjects } = useAppContext();
  const filtered = useMemo(() => contentObjects.filter(isCmsStringDataObject), [contentObjects]);
  return useMemo(
    () => data.map(contentObject => aggregateContentObjectTranslation(contentObject, translationRequest, filtered)),
    [data, translationRequest, filtered]
  );
};
