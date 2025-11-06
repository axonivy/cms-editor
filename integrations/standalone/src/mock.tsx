import { ClientContextProvider, CmsEditor, initQueryClient, QueryProvider } from '@axonivy/cms-editor';
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
        <QueryProvider client={queryClient}>
          <ReadonlyProvider readonly={readonly}>
            <HotkeysProvider initiallyActiveScopes={['global']}>
              <CmsEditor context={{ app: '', pmv: 'pmv-name', file: '' }} initializePromise={initializePromise} />
            </HotkeysProvider>
          </ReadonlyProvider>
        </QueryProvider>
      </ClientContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
