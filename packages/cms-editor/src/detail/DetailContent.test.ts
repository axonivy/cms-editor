import type { CmsData, CmsDataObject } from '@axonivy/cms-editor-protocol';
import { updateValueOfContentObjectInData } from './DetailContent';

test('updateValueOfContentObjectInData', () => {
  const data = {
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ] as Array<CmsDataObject>
  } as CmsData;
  expect(updateValueOfContentObjectInData(data, 'uriOne', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { new: 'values' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValueOfContentObjectInData(data, 'uriTwo', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { new: 'values' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValueOfContentObjectInData(data, 'uriThree', () => ({ new: 'values' }))).toBeUndefined();
  expect(updateValueOfContentObjectInData(data, 'uriFour', () => ({ new: 'values' }))).toBeUndefined();
});
