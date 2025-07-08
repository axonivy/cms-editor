import type {
  Client,
  CmsActionArgs,
  CmsAddLocalesArgs,
  CmsCreateFileArgs,
  CmsCreateStringArgs,
  CmsData,
  CmsDataArgs,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsUpdateFileValueArgs,
  CmsUpdateStringValueArgs,
  MetaRequestTypes,
  NotificationTypes,
  RequestTypes,
  Void
} from '@axonivy/cms-editor-protocol';
import { BaseRpcClient, createMessageConnection, urlBuilder, type Connection, type MessageConnection } from '@axonivy/jsonrpc';

export class ClientJsonRpc extends BaseRpcClient implements Client {
  data(args: CmsDataArgs): Promise<CmsData> {
    return this.sendRequest('data', args);
  }

  createString(args: CmsCreateStringArgs): Promise<Void> {
    return this.sendRequest('createString', args);
  }

  createFile(args: CmsCreateFileArgs): Promise<Void> {
    return this.sendRequest('createFile', args);
  }

  read(args: CmsReadArgs): Promise<CmsDataObject> {
    return this.sendRequest('read', args);
  }

  updateStringValue = (args: CmsUpdateStringValueArgs): Promise<Void> => {
    return this.sendRequest('updateStringValue', args);
  };

  updateFileValue = (args: CmsUpdateFileValueArgs): Promise<Void> => {
    return this.sendRequest('updateFileValue', args);
  };

  deleteValue(args: CmsDeleteValueArgs): Promise<Void> {
    return this.sendRequest('deleteValue', args);
  }

  delete(args: CmsDeleteArgs): Promise<Void> {
    return this.sendRequest('delete', args);
  }

  addLocales(args: CmsAddLocalesArgs): Promise<Void> {
    return this.sendRequest('addLocales', args);
  }

  removeLocales(args: CmsRemoveLocalesArgs): Promise<Void> {
    return this.sendRequest('removeLocales', args);
  }

  meta<TMeta extends keyof MetaRequestTypes>(path: TMeta, args: MetaRequestTypes[TMeta][0]): Promise<MetaRequestTypes[TMeta][1]> {
    return this.sendRequest(path, args);
  }

  action(action: CmsActionArgs): Promise<void> {
    return this.sendNotification('action', action);
  }

  sendRequest<K extends keyof RequestTypes>(command: K, args: RequestTypes[K][0]): Promise<RequestTypes[K][1]> {
    return args === undefined ? this.connection.sendRequest(command) : this.connection.sendRequest(command, args);
  }

  sendNotification<K extends keyof NotificationTypes>(command: K, args: NotificationTypes[K]): Promise<void> {
    return this.connection.sendNotification(command, args);
  }

  public static webSocketUrl(url: string) {
    return urlBuilder(url, 'ivy-cms-lsp');
  }

  public static async startClient(connection: Connection): Promise<ClientJsonRpc> {
    return this.startMessageClient(createMessageConnection(connection.reader, connection.writer));
  }

  public static async startMessageClient(connection: MessageConnection): Promise<ClientJsonRpc> {
    const client = new ClientJsonRpc(connection);
    await client.start();
    return client;
  }
}
