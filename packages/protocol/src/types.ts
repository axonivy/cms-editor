import type {
  CmsActionArgs,
  CmsAddLocalesArgs,
  CmsCountLocaleValuesArgs,
  CmsCreateArgs,
  CmsData,
  CmsDataArgs,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsEditorDataContext,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsUpdateValueArgs,
  MapStringLong,
  Void
} from './editor';

export type EditorProps = { context: CmsEditorDataContext };

export type { CmsDataObject as ContentObject };

export interface Client {
  data(args: CmsDataArgs): Promise<CmsData>;
  create(args: CmsCreateArgs): Promise<Void>;
  read(args: CmsReadArgs): Promise<CmsDataObject>;
  updateValue(args: CmsUpdateValueArgs): void;
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
  create: [CmsCreateArgs, Void];
  read: [CmsReadArgs, CmsDataObject];
  updateValue: [CmsUpdateValueArgs, Void];
  deleteValue: [CmsDeleteValueArgs, Void];
  delete: [CmsDeleteArgs, Void];
  addLocales: [CmsAddLocalesArgs, Void];
  removeLocales: [CmsRemoveLocalesArgs, Void];
}

export interface NotificationTypes {
  action: CmsActionArgs;
}
