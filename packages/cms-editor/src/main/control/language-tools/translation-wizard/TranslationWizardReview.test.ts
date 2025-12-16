import type { CmsStringDataObject, CmsTranslationResponse } from '@axonivy/cms-editor-protocol';
import { describe, expect, it } from 'vitest';
import { initializeTranslationData } from './TranslationWizardReview';

describe('initializeTranslationData', () => {
  it('should transform CmsTranslationResponse to CmsStringDataObject', () => {
    const input: CmsTranslationResponse[] = [
      {
        uri: 'test-uri',
        values: {
          en: { original: 'Hello', translation: 'translated value Hello' },
          fr: { original: 'Bonjour', translation: 'translated value Bonjour' }
        }
      }
    ];
    const expected: CmsStringDataObject[] = [
      {
        uri: 'test-uri',
        type: 'STRING',
        values: {
          en: 'translated value Hello',
          fr: 'translated value Bonjour'
        }
      }
    ];
    expect(initializeTranslationData(input)).toEqual(expected);
  });
});
