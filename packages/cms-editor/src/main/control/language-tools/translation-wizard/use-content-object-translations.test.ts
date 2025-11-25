import type { CmsStringDataObject, CmsTranslationRequest, CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { customRenderHook } from '../../../../context/test-utils/test-utils';
import { useContentObjectTranslations } from './use-content-object-translations';

test('useContentObjectTranslation', () => {
  const contentObjects = [
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { en: 'en' } },
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'FILE', values: { en: 'en' } },
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { en: 'en' } }
  ] as Array<CmsValueDataObject>;
  const result = renderContentObjectTranslationHook(contentObjects, [1, 3]).result;

  expect(result.current).toEqual([
    {
      uri: '/Dialogs/agileBPM/define_WF/DeleteStep',
      sourceValue: 'en',
      values: {
        de: { originalvalue: undefined, value: '' },
        en: { originalvalue: 'en', value: 'en' }
      }
    },
    {
      uri: '/Dialogs/agileBPM/define_WF/DeleteStep',
      sourceValue: 'en',
      values: {
        de: { originalvalue: undefined, value: '' },
        en: { originalvalue: 'en', value: 'en' }
      }
    },
    {
      uri: '/Dialogs/agileBPM/define_WF/DeleteStep',
      sourceValue: 'en',
      values: {
        de: { originalvalue: undefined, value: '' },
        en: { originalvalue: 'en', value: 'en' }
      }
    }
  ]);
});
const renderContentObjectTranslationHook = (contentObjects: Array<CmsValueDataObject>, selectedContentObjects: Array<number>) => {
  const translationRequest: CmsTranslationRequest = {
    sourceLanguageTag: 'en',
    targetLanguageTags: ['de', 'en'],
    uris: ['contentObjectUri1']
  };
  const data: CmsStringDataObject[] = [
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { en: 'en' } },
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'FILE', values: { en: 'en' } },
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { en: 'en' } }
  ];
  return customRenderHook(() => useContentObjectTranslations(translationRequest, data), {
    wrapperProps: { appContext: { contentObjects: contentObjects ?? [], selectedContentObjects: selectedContentObjects ?? [] } }
  });
};
