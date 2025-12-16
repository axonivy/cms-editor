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
  CmsInitializeResult,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsTranslationArgs,
  CmsTranslationResponse,
  CmsUpdateValuesArgs,
  MapStringBoolean,
  MapStringLong,
  MapStringString,
  MapStringURI,
  Void
} from './editor';

export type EditorProps = { context: CmsEditorDataContext; initializePromise: Promise<CmsInitializeResult> };

export type CmsDataObjectValues = MapStringString | MapStringBoolean | MapStringURI;
export type CmsCreateObjectArgs = CmsCreateStringArgs | CmsCreateFileArgs;

export interface Client {
  initialize(args: CmsEditorDataContext): Promise<CmsInitializeResult>;
  data(args: CmsDataArgs): Promise<CmsData>;
  createString(args: CmsCreateStringArgs): Promise<Void>;
  createFile(args: CmsCreateFileArgs): Promise<Void>;
  read(args: CmsReadArgs): Promise<CmsDataObject>;
  updateStringValues(args: CmsUpdateValuesArgs): Promise<Void>;
  updateFileValues(args: CmsUpdateValuesArgs): Promise<Void>;
  deleteValue(args: CmsDeleteValueArgs): Promise<Void>;
  delete(args: CmsDeleteArgs): Promise<Void>;
  addLocales(args: CmsAddLocalesArgs): Promise<Void>;
  removeLocales(args: CmsRemoveLocalesArgs): Promise<Void>;
  translate(args: CmsTranslationArgs): Promise<Array<CmsTranslationResponse>>;
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
  initialize: [CmsEditorDataContext, CmsInitializeResult];
  data: [CmsDataArgs, CmsData];
  createString: [CmsCreateStringArgs, Void];
  createFile: [CmsCreateFileArgs, Void];
  read: [CmsReadArgs, CmsDataObject];
  updateStringValues: [CmsUpdateValuesArgs, Void];
  updateFileValues: [CmsUpdateValuesArgs, Void];
  deleteValue: [CmsDeleteValueArgs, Void];
  delete: [CmsDeleteArgs, Void];
  addLocales: [CmsAddLocalesArgs, Void];
  removeLocales: [CmsRemoveLocalesArgs, Void];
  translate: [CmsTranslationArgs, Array<CmsTranslationResponse>];
}

export interface NotificationTypes {
  action: CmsActionArgs;
}
