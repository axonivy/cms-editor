import type {
  Client,
  CmsActionArgs,
  CmsCreateArgs,
  CmsData,
  CmsDataArgs,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsReadArgs,
  CmsUpdateValueArgs,
  MetaRequestTypes,
  NotificationTypes,
  RequestTypes
} from '@axonivy/cms-editor-protocol';
import { BaseRpcClient, createMessageConnection, urlBuilder, type Connection, type MessageConnection } from '@axonivy/jsonrpc';

export class ClientJsonRpc extends BaseRpcClient implements Client {
  data(args: CmsDataArgs): Promise<CmsData> {
    return this.sendRequest('data', args);
  }

  create(args: CmsCreateArgs): void {
    this.sendRequest('create', args);
  }

  read(args: CmsReadArgs): Promise<CmsDataObject> {
    return this.sendRequest('read', args);
  }

  updateValue(args: CmsUpdateValueArgs): void {
    this.sendRequest('updateValue', args);
  }

  deleteValue(args: CmsDeleteValueArgs): void {
    this.sendRequest('deleteValue', args);
  }

  delete(args: CmsDeleteArgs): void {
    this.sendRequest('delete', args);
  }

  meta<TMeta extends keyof MetaRequestTypes>(path: TMeta, args: MetaRequestTypes[TMeta][0]): Promise<MetaRequestTypes[TMeta][1]> {
    return this.sendRequest(path, args);
  }

  action(action: CmsActionArgs): void {
    this.sendNotification('action', action);
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
