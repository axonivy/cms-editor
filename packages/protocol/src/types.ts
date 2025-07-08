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
  CmsUpdateFileValueArgs,
  CmsUpdateStringValueArgs,
  MapStringBoolean,
  MapStringByte,
  MapStringLong,
  MapStringString,
  MapStringURI,
  Void
} from './editor';

export type EditorProps = { context: CmsEditorDataContext };

export type CmsDataObjectValues = MapStringString | MapStringByte | MapStringBoolean | MapStringURI;
export type CmsCreateObjectArgs = CmsCreateStringArgs | CmsCreateFileArgs;
export type CmsUpdateValueArgs = CmsUpdateStringValueArgs | CmsUpdateFileValueArgs;

export interface Client {
  data(args: CmsDataArgs): Promise<CmsData>;
  createString(args: CmsCreateStringArgs): Promise<Void>;
  createFile(args: CmsCreateFileArgs): Promise<Void>;
  read(args: CmsReadArgs): Promise<CmsDataObject>;
  updateStringValue(args: CmsUpdateStringValueArgs): void;
  updateFileValue(args: CmsUpdateFileValueArgs): Promise<Void>;
  deleteValue(args: CmsDeleteValueArgs): void;
  delete(args: CmsDeleteArgs): void;
  addLocales(args: CmsAddLocalesArgs): void;
  removeLocales(args: CmsRemoveLocalesArgs): void;
  meta<TMeta extends keyof MetaRequestTypes>(path: TMeta, args: MetaRequestTypes[TMeta][0]): Promise<MetaRequestTypes[TMeta][1]>;
  action(action: CmsActionArgs): void;
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
  updateStringValue: [CmsUpdateStringValueArgs, Void];
  updateFileValue: [CmsUpdateFileValueArgs, Void];
  deleteValue: [CmsDeleteValueArgs, Void];
  delete: [CmsDeleteArgs, Void];
  addLocales: [CmsAddLocalesArgs, Void];
  removeLocales: [CmsRemoveLocalesArgs, Void];
}

export interface NotificationTypes {
  action: CmsActionArgs;
}
