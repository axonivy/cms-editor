import type { CmsData, CmsDataObject } from '@axonivy/cms-editor-protocol';
import { updateValuesOfContentObjectInData } from './DetailContent';

test('updateValuesOfContentObjectInData', () => {
  const data = {
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ] as Array<CmsDataObject>
  } as CmsData;
  expect(updateValuesOfContentObjectInData(data, 'uriOne', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { new: 'values' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValuesOfContentObjectInData(data, 'uriTwo', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { new: 'values' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValuesOfContentObjectInData(data, 'uriThree', () => ({ new: 'values' }))).toBeUndefined();
  expect(updateValuesOfContentObjectInData(data, 'uriFour', () => ({ new: 'values' }))).toBeUndefined();
});
