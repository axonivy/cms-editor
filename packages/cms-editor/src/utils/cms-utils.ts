import type {
  CmsDataFileDataObject,
  CmsDataObject,
  CmsDataObjectValues,
  CmsFileDataObject,
  CmsReadFileDataObject,
  CmsStringDataObject
} from '@axonivy/cms-editor-protocol';

export const removeValue = <V extends CmsDataObjectValues>(values: V, languageTag: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [languageTag]: _, ...newValues } = values;
  return newValues as V;
};

export const isCmsStringDataObject = (object?: CmsDataObject): object is CmsStringDataObject => object?.type === 'STRING';
const isAnyCmsFileDataObject = (object?: CmsDataObject): object is CmsFileDataObject | CmsDataFileDataObject | CmsReadFileDataObject =>
  object?.type === 'FILE';
export const isCmsFileDataObject = (object?: CmsDataObject): object is CmsFileDataObject =>
  isAnyCmsFileDataObject(object) &&
  (!object.values || Object.values(object.values).every(value => Array.isArray(value) && value.every(num => typeof num === 'number')));
export const isCmsDataFileDataObject = (object?: CmsDataObject): object is CmsDataFileDataObject =>
  isAnyCmsFileDataObject(object) && (!object.values || Object.values(object.values).every(value => typeof value === 'boolean'));
export const isCmsReadFileDataObject = (object?: CmsDataObject): object is CmsReadFileDataObject =>
  isAnyCmsFileDataObject(object) && (!object.values || Object.values(object.values).every(value => typeof value === 'string'));

export type CmsValueDataObject = CmsStringDataObject | CmsFileDataObject | CmsDataFileDataObject | CmsReadFileDataObject;
export const isCmsValueDataObject = (object?: CmsDataObject): object is CmsValueDataObject =>
  isCmsStringDataObject(object) || isCmsFileDataObject(object) || isCmsDataFileDataObject(object) || isCmsReadFileDataObject(object);
