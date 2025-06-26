import type {
  CmsDataObject,
  CmsDataObjectValues,
  CmsFileDataObject,
  CmsFolderDataObject,
  CmsStringDataObject
} from '@axonivy/cms-editor-protocol';

export const removeValue = (values: CmsDataObjectValues, languageTag: string): CmsDataObjectValues => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [languageTag]: _, ...newValues } = values;
  return newValues;
};

export const isCmsFolderDataObject = (object?: CmsDataObject): object is CmsFolderDataObject => object?.type === 'FOLDER';
export const isCmsStringDataObject = (object?: CmsDataObject): object is CmsStringDataObject => object?.type === 'STRING';
export const isCmsFileDataObject = (object?: CmsDataObject): object is CmsFileDataObject => object?.type === 'FILE';

export type CmsValueDataObject = CmsStringDataObject | CmsFileDataObject;
export const isCmsValueDataObject = (object?: CmsDataObject): object is CmsValueDataObject =>
  isCmsStringDataObject(object) || isCmsFileDataObject(object);
