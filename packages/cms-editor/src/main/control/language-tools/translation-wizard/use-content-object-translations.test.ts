import type { CmsTranslationRequest, CmsTranslationResponse, CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { customRenderHook } from '../../../../context/test-utils/test-utils';
import { useContentObjectTranslations } from './use-content-object-translations';

test('useContentObjectTranslations', () => {
  const result = renderContentObjectTranslationHook().result;

  expect(result.current).toEqual([
    {
      uri: '/Dialogs/agileBPM/define_WF/DeleteStep',
      sourceValue: 'Delete',
      values: {
        de: { originalvalue: 'Löschen', value: 'Löschen' },
        fr: { originalvalue: undefined, value: 'Supprimer' }
      }
    },
    {
      uri: '/Dialogs/agileBPM/task_Form/Description',
      sourceValue: 'Description',
      values: {
        de: { originalvalue: undefined, value: 'Beschreibung' },
        fr: { originalvalue: 'Description', value: 'Description' }
      }
    },
    {
      uri: '/Dialogs/agileBPM/define_WF/Cancel',
      sourceValue: 'Cancel',
      values: {
        de: { originalvalue: undefined, value: 'Abbrechen' },
        fr: { originalvalue: undefined, value: 'Annuler' }
      }
    }
  ]);
});

const renderContentObjectTranslationHook = () => {
  const translationRequest: CmsTranslationRequest = {
    sourceLanguageTag: 'en',
    targetLanguageTags: ['de', 'fr'],
    uris: ['/Dialogs/agileBPM/define_WF/DeleteStep', '/Dialogs/agileBPM/task_Form/Description', '/Dialogs/agileBPM/define_WF/Cancel']
  };

  const data: CmsTranslationResponse[] = [
    {
      uri: '/Dialogs/agileBPM/define_WF/DeleteStep',
      values: { fr: { translation: 'Supprimer', original: '' }, de: { translation: 'Löschen', original: '' } }
    },
    {
      uri: '/Dialogs/agileBPM/task_Form/Description',
      values: { fr: { translation: 'Description', original: 'Description' }, de: { translation: 'Beschreibung', original: '' } }
    },
    {
      uri: '/Dialogs/agileBPM/define_WF/Cancel',
      values: { fr: { translation: 'Annuler', original: '' }, de: { translation: 'Abbrechen', original: '' } }
    }
  ];

  const contentObjects: CmsValueDataObject[] = [
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { en: 'Delete', de: 'Löschen' } },
    { uri: '/Dialogs/agileBPM/task_Form/Description', type: 'STRING', values: { en: 'Description', fr: 'Description' } },
    { uri: '/Dialogs/agileBPM/define_WF/Cancel', type: 'STRING', values: { en: 'Cancel' } }
  ];

  return customRenderHook(() => useContentObjectTranslations(translationRequest, data), {
    wrapperProps: { appContext: { contentObjects } }
  });
};
