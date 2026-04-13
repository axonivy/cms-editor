import type { Client, ClientContext } from '@axonivy/cms-editor-protocol';
import type { ReactNode } from 'react';
import { createContext, use } from 'react';

const ClientContext = createContext<ClientContext | undefined>(undefined);

export const useClient = (): Client => {
  const context = use(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientContext');
  }
  return context.client;
};

export const ClientContextProvider = ({ client, children }: { client: Client; children: ReactNode }) => {
  return <ClientContext value={{ client }}>{children}</ClientContext>;
};
