import type { CmsDataObject } from '@axonivy/cms-editor-protocol';
import { IvyIcons } from '@axonivy/ui-icons';
import {
  fileIcon,
  isCmsDataFileDataObject,
  isCmsFileDataObject,
  isCmsReadFileDataObject,
  isCmsStringDataObject,
  isCmsValueDataObject,
  removeValue
} from './cms-utils';

test('removeValue', () => {
  const values = { en: 'value', de: 'wert' };
  const newValues = removeValue(values, 'de');
  expect(newValues).toEqual({ en: 'value' });
});

test('CmsDataObject type guards', () => {
  const folder = { type: 'FOLDER' } as CmsDataObject;
  const string = { type: 'STRING' } as CmsDataObject;
  const file = { type: 'FILE' } as CmsDataObject;
  const fileData = {
    type: 'FILE',
    values: { en: Array.from('value').map(c => c.charCodeAt(0)), de: Array.from('wert').map(c => c.charCodeAt(0)) }
  } as unknown as CmsDataObject;
  const dataFileData = { type: 'FILE', values: { en: true, de: false } } as unknown as CmsDataObject;
  const readFileData = {
    type: 'FILE',
    values: { en: 'http://localhost/cm/file?l=en', de: 'http://localhost/cm/file?l=de' }
  } as unknown as CmsDataObject;

  expect(isCmsStringDataObject(undefined)).toBeFalsy();
  expect(isCmsStringDataObject(folder)).toBeFalsy();
  expect(isCmsStringDataObject(string)).toBeTruthy();
  expect(isCmsStringDataObject(file)).toBeFalsy();
  expect(isCmsStringDataObject(fileData)).toBeFalsy();
  expect(isCmsStringDataObject(dataFileData)).toBeFalsy();
  expect(isCmsStringDataObject(readFileData)).toBeFalsy();

  expect(isCmsFileDataObject(undefined)).toBeFalsy();
  expect(isCmsFileDataObject(folder)).toBeFalsy();
  expect(isCmsFileDataObject(string)).toBeFalsy();
  expect(isCmsFileDataObject(file)).toBeTruthy();
  expect(isCmsFileDataObject(fileData)).toBeTruthy();
  expect(isCmsFileDataObject(dataFileData)).toBeFalsy();
  expect(isCmsFileDataObject(readFileData)).toBeFalsy();

  expect(isCmsDataFileDataObject(undefined)).toBeFalsy();
  expect(isCmsDataFileDataObject(folder)).toBeFalsy();
  expect(isCmsDataFileDataObject(string)).toBeFalsy();
  expect(isCmsDataFileDataObject(file)).toBeTruthy();
  expect(isCmsDataFileDataObject(fileData)).toBeFalsy();
  expect(isCmsDataFileDataObject(dataFileData)).toBeTruthy();
  expect(isCmsDataFileDataObject(readFileData)).toBeFalsy();

  expect(isCmsReadFileDataObject(undefined)).toBeFalsy();
  expect(isCmsReadFileDataObject(folder)).toBeFalsy();
  expect(isCmsReadFileDataObject(string)).toBeFalsy();
  expect(isCmsReadFileDataObject(file)).toBeTruthy();
  expect(isCmsReadFileDataObject(fileData)).toBeFalsy();
  expect(isCmsReadFileDataObject(dataFileData)).toBeFalsy();
  expect(isCmsReadFileDataObject(readFileData)).toBeTruthy();

  expect(isCmsValueDataObject(undefined)).toBeFalsy();
  expect(isCmsValueDataObject(folder)).toBeFalsy();
  expect(isCmsValueDataObject(string)).toBeTruthy();
  expect(isCmsValueDataObject(file)).toBeTruthy();
  expect(isCmsValueDataObject(fileData)).toBeTruthy();
  expect(isCmsValueDataObject(dataFileData)).toBeTruthy();
  expect(isCmsValueDataObject(readFileData)).toBeTruthy();
});

test('fileIcon', () => {
  expect(fileIcon('')).toEqual(IvyIcons.File);
  expect(fileIcon('txt')).toEqual(IvyIcons.File);
  expect(fileIcon('jpg')).toEqual(IvyIcons.CustomImage);
  expect(fileIcon('png')).toEqual(IvyIcons.CustomImage);
});
