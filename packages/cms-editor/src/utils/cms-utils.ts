import type {
  CmsDataObject,
  CmsFileDataObject,
  CmsFolderDataObject,
  CmsStringDataObject,
  MapStringByte,
  MapStringString
} from '@axonivy/cms-editor-protocol';

export const removeValue = <T extends MapStringString | MapStringByte>(values: T, languageTag: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [languageTag]: _, ...newValues } = values;
  return newValues as T;
};

export const isCmsFolderDataObject = (object: CmsDataObject): object is CmsFolderDataObject => object.type === 'FOLDER';
export const isCmsStringDataObject = (object: CmsDataObject): object is CmsStringDataObject => object.type === 'STRING';
export const isCmsFileDataObject = (object: CmsDataObject): object is CmsFileDataObject => object.type === 'FILE';
