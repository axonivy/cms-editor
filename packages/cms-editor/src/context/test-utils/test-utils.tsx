import type { Client, CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import { ReadonlyProvider } from '@axonivy/ui-components';
import { QueryClient } from '@tanstack/react-query';
import { render, renderHook, type RenderHookOptions, type RenderOptions } from '@testing-library/react';
import i18n from 'i18next';
import type { ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import { enTranslation, type CmsValueDataObject } from '../..';
import { ClientContextProvider } from '../../protocol/ClientContextProvider';
import { QueryProvider } from '../../query/QueryProvider';
import { AppProvider } from '../AppContext';

type ContextHelperProps = {
  clientLanguage?: string;
  readonlyContext?: {
    readonly?: boolean;
  };
  clientContext?: {
    client?: Partial<Client>;
  };
  appContext?: {
    context?: CmsEditorDataContext;
    contentObjects?: Array<CmsValueDataObject>;
    selectedContentObject?: number;
    setSelectedContentObject?: (index?: number) => void;
    detail?: boolean;
    setDetail?: (visible: boolean) => void;
    defaultLanguageTags?: Array<string>;
    setDefaultLanguageTags?: (languageTags: Array<string>) => void;
    languageDisplayName?: Intl.DisplayNames;
    cmUrl?: string;
  };
};

const initTranslation = (clientLanguage?: string) => {
  if (i18n.isInitializing || i18n.isInitialized) return;
  i18n.use(initReactI18next).init({
    lng: clientLanguage ?? 'en',
    fallbackLng: 'en',
    ns: ['cms-editor'],
    defaultNS: 'cms-editor',
    resources: { en: { 'cms-editor': enTranslation } }
  });
};

const ContextHelper = ({
  clientLanguage,
  readonlyContext,
  clientContext,
  appContext,
  children
}: ContextHelperProps & { children: ReactNode }) => {
  const readonly = readonlyContext?.readonly !== undefined ? readonlyContext.readonly : false;

  const client = (clientContext?.client ?? {}) as Client;

  const aContext = {
    context: appContext?.context ?? ({} as CmsEditorDataContext),
    contentObjects: appContext?.contentObjects ?? [],
    selectedContentObject: appContext?.selectedContentObject,
    setSelectedContentObject: appContext?.setSelectedContentObject ?? (() => {}),
    detail: appContext?.detail !== undefined ? appContext.detail : true,
    setDetail: appContext?.setDetail ?? (() => {}),
    defaultLanguageTags: appContext?.defaultLanguageTags ?? [],
    setDefaultLanguageTags: appContext?.setDefaultLanguageTags ?? (() => {}),
    languageDisplayName: appContext?.languageDisplayName ?? ({} as Intl.DisplayNames),
    cmUrl: appContext?.cmUrl ?? ''
  };

  initTranslation(clientLanguage);

  return (
    <ReadonlyProvider readonly={readonly}>
      <ClientContextProvider client={client}>
        <QueryProvider client={new QueryClient()}>
          <AppProvider value={aContext}>{children}</AppProvider>
        </QueryProvider>
      </ClientContextProvider>
    </ReadonlyProvider>
  );
};

export const customRender = (ui: React.ReactElement, options?: RenderOptions & { wrapperProps: ContextHelperProps }) => {
  return render(ui, {
    wrapper: props => <ContextHelper {...props} {...options?.wrapperProps} />,
    ...options
  });
};

export const customRenderHook = <Result, Props>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props> & { wrapperProps: ContextHelperProps }
) => {
  return renderHook(render, {
    wrapper: props => <ContextHelper {...props} {...options?.wrapperProps} />,
    ...options
  });
};
