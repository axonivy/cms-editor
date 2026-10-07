import { ClientContextProvider, CmsEditor, initQueryClient } from '@axonivy/cms-editor';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HotkeysProvider, ReadonlyProvider, ThemeProvider } from '@axonivy/ui-components';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { initTranslation } from './i18n';
import './index.css';
import { CmsClientMock } from './mock/cms-client-mock';
import { readonlyParam, themeParam, translationServiceEnabledParam } from './url-helper';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found.');
}
const root = ReactDOM.createRoot(rootElement);

const client = new CmsClientMock();
const queryClient = initQueryClient();

const theme = themeParam();
const readonly = readonlyParam();
const initializePromise = Promise.resolve({ capabilities: { translationServiceEnabled: translationServiceEnabledParam() } });

initTranslation();

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme={theme}>
      <ClientContextProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <ReadonlyProvider readonly={readonly}>
            <HotkeysProvider initiallyActiveScopes={['global']}>
              <CmsEditor context={{ app: '', project: 'project-name', file: '' }} initializePromise={initializePromise} />
            </HotkeysProvider>
          </ReadonlyProvider>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition={'bottom-left'} />
        </QueryClientProvider>
      </ClientContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
