import type {
  CmsActionArgs,
  CmsAddLocalesArgs,
  CmsCountLocaleValuesArgs,
  CmsCreateFileArgs,
  CmsCreateStringArgs,
  CmsData,
  CmsDataArgs,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsEditorDataContext,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsStringDataObject,
  CmsTranslationArgs,
  CmsUpdateValueArgs,
  MapStringBoolean,
  MapStringLong,
  MapStringString,
  MapStringURI,
  Void
} from './editor';

export type EditorProps = { context: CmsEditorDataContext };

export type CmsDataObjectValues = MapStringString | MapStringBoolean | MapStringURI;
export type CmsCreateObjectArgs = CmsCreateStringArgs | CmsCreateFileArgs;

export interface Client {
  data(args: CmsDataArgs): Promise<CmsData>;
  createString(args: CmsCreateStringArgs): Promise<Void>;
  createFile(args: CmsCreateFileArgs): Promise<Void>;
  read(args: CmsReadArgs): Promise<CmsDataObject>;
  updateStringValue(args: CmsUpdateValueArgs): Promise<Void>;
  updateFileValue(args: CmsUpdateValueArgs): Promise<Void>;
  deleteValue(args: CmsDeleteValueArgs): Promise<Void>;
  delete(args: CmsDeleteArgs): Promise<Void>;
  addLocales(args: CmsAddLocalesArgs): Promise<Void>;
  removeLocales(args: CmsRemoveLocalesArgs): Promise<Void>;
  translate(args: CmsTranslationArgs): Promise<Array<CmsStringDataObject>>;
  meta<TMeta extends keyof MetaRequestTypes>(path: TMeta, args: MetaRequestTypes[TMeta][0]): Promise<MetaRequestTypes[TMeta][1]>;
  action(action: CmsActionArgs): Promise<void>;
}

export interface ClientContext {
  client: Client;
}

export interface MetaRequestTypes {
  'meta/supportedLocales': [null, Array<string>];
  'meta/locales': [CmsEditorDataContext, Array<string>];
  'meta/countLocaleValues': [CmsCountLocaleValuesArgs, MapStringLong];
}

export interface RequestTypes extends MetaRequestTypes {
  data: [CmsDataArgs, CmsData];
  createString: [CmsCreateStringArgs, Void];
  createFile: [CmsCreateFileArgs, Void];
  read: [CmsReadArgs, CmsDataObject];
  updateStringValue: [CmsUpdateValueArgs, Void];
  updateFileValue: [CmsUpdateValueArgs, Void];
  deleteValue: [CmsDeleteValueArgs, Void];
  delete: [CmsDeleteArgs, Void];
  addLocales: [CmsAddLocalesArgs, Void];
  removeLocales: [CmsRemoveLocalesArgs, Void];
  translate: [CmsTranslationArgs, Array<CmsStringDataObject>];
}

export interface NotificationTypes {
  action: CmsActionArgs;
}
