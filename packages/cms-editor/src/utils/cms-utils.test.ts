import type { CmsFileDataObject, CmsFolderDataObject, CmsStringDataObject } from '@axonivy/cms-editor-protocol';
import { isCmsFileDataObject, isCmsFolderDataObject, isCmsStringDataObject, isCmsValueDataObject, removeValue } from './cms-utils';

test('removeValue', () => {
  const values = { en: 'value', de: 'wert' };
  const newValues = removeValue(values, 'de');
  expect(newValues).toEqual({ en: 'value' });
});

test('CmsDataObject type guards', () => {
  const folder = { type: 'FOLDER' } as CmsFolderDataObject;
  const string = { type: 'STRING' } as CmsStringDataObject;
  const file = { type: 'FILE' } as CmsFileDataObject;

  expect(isCmsFolderDataObject(undefined)).toBeFalsy();
  expect(isCmsFolderDataObject(folder)).toBeTruthy();
  expect(isCmsFolderDataObject(string)).toBeFalsy();
  expect(isCmsFolderDataObject(file)).toBeFalsy();

  expect(isCmsStringDataObject(undefined)).toBeFalsy();
  expect(isCmsStringDataObject(folder)).toBeFalsy();
  expect(isCmsStringDataObject(string)).toBeTruthy();
  expect(isCmsStringDataObject(file)).toBeFalsy();

  expect(isCmsFileDataObject(undefined)).toBeFalsy();
  expect(isCmsFileDataObject(folder)).toBeFalsy();
  expect(isCmsFileDataObject(string)).toBeFalsy();
  expect(isCmsFileDataObject(file)).toBeTruthy();

  expect(isCmsValueDataObject(undefined)).toBeFalsy();
  expect(isCmsValueDataObject(folder)).toBeFalsy();
  expect(isCmsValueDataObject(string)).toBeTruthy();
  expect(isCmsValueDataObject(file)).toBeTruthy();
});
