import type { CmsStringDataObject, CmsTranslationResponse } from '@axonivy/cms-editor-protocol';
import { describe, expect, it } from 'vitest';
import { initializeTranslationData } from './TranslationWizardReview';

describe('initializeTranslationData', () => {
  it('should transform CmsTranslationResponse to CmsStringDataObject', () => {
    const input: CmsTranslationResponse[] = [
      {
        uri: 'test-uri',
        values: {
          en: { original: 'Hello', translation: 'Hello' },
          fr: { original: 'Bonjour', translation: 'Bonjour' }
        }
      }
    ];
    const expected: CmsStringDataObject[] = [
      {
        uri: 'test-uri',
        type: 'STRING',
        values: {
          en: 'Hello',
          fr: 'Bonjour'
        }
      }
    ];
    expect(initializeTranslationData(input)).toEqual(expected);
  });

  it('should handle multiple entries', () => {
    const input: CmsTranslationResponse[] = [
      {
        uri: 'uri1',
        values: { en: { original: 'One', translation: 'One' } }
      },
      {
        uri: 'uri2',
        values: { en: { original: 'Two', translation: 'Two' }, de: { original: 'Zwei', translation: 'Zwei' } }
      }
    ];
    const expected: CmsStringDataObject[] = [
      {
        uri: 'uri1',
        type: 'STRING',
        values: { en: 'One' }
      },
      {
        uri: 'uri2',
        type: 'STRING',
        values: { en: 'Two', de: 'Zwei' }
      }
    ];
    expect(initializeTranslationData(input)).toEqual(expected);
  });
});
