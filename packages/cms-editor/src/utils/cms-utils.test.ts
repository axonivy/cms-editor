import type { CmsFileDataObject, CmsFolderDataObject, CmsStringDataObject } from '@axonivy/cms-editor-protocol';
import { isCmsFileDataObject, isCmsFolderDataObject, isCmsStringDataObject, removeValue } from './cms-utils';

test('removeValue', () => {
  const values = { en: 'value', de: 'wert' };
  const newValues = removeValue(values, 'de');
  expect(newValues).toEqual({ en: 'value' });
});

test('CmsDataObject type guards', () => {
  const folder = { type: 'FOLDER' } as CmsFolderDataObject;
  const string = { type: 'STRING' } as CmsStringDataObject;
  const file = { type: 'FILE' } as CmsFileDataObject;

  expect(isCmsFolderDataObject(folder)).toBeTruthy();
  expect(isCmsStringDataObject(folder)).toBeFalsy();
  expect(isCmsFileDataObject(folder)).toBeFalsy();

  expect(isCmsFolderDataObject(string)).toBeFalsy();
  expect(isCmsStringDataObject(string)).toBeTruthy();
  expect(isCmsFileDataObject(string)).toBeFalsy();

  expect(isCmsFolderDataObject(file)).toBeFalsy();
  expect(isCmsStringDataObject(file)).toBeFalsy();
  expect(isCmsFileDataObject(file)).toBeTruthy();
});
