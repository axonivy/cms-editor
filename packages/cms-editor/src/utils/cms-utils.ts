import type {
  CmsDataObject,
  CmsDataObjectValues,
  CmsFileDataObject,
  CmsFolderDataObject,
  CmsStringDataObject
} from '@axonivy/cms-editor-protocol';

export const removeValue = <T extends CmsDataObjectValues>(values: T, languageTag: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [languageTag]: _, ...newValues } = values;
  return newValues as T;
};

export const isCmsFolderDataObject = (object?: CmsDataObject): object is CmsFolderDataObject => object?.type === 'FOLDER';
export const isCmsStringDataObject = (object?: CmsDataObject): object is CmsStringDataObject => object?.type === 'STRING';
export const isCmsFileDataObject = (object?: CmsDataObject): object is CmsFileDataObject => object?.type === 'FILE';

export type CmsValueDataObject = CmsStringDataObject | CmsFileDataObject;
export const isCmsValueDataObject = (object?: CmsDataObject): object is CmsValueDataObject =>
  isCmsStringDataObject(object) || isCmsFileDataObject(object);
