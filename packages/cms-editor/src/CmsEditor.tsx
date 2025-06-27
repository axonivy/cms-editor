import type { CmsDataObject, EditorProps } from '@axonivy/cms-editor-protocol';
import { Flex, PanelMessage, ResizableHandle, ResizablePanel, ResizablePanelGroup, Spinner, useHotkeys } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CmsEditor.css';
import { AppProvider } from './context/AppContext';
import { DetailContent } from './detail/DetailContent';
import { DetailToolbar } from './detail/DetailToolbar';
import { MainContent } from './main/MainContent';
import { MainToolbar } from './main/MainToolbar';
import { useClient } from './protocol/ClientContextProvider';
import { useAction } from './protocol/use-action';
import { useQueryKeys } from './query/query-client';
import { useLanguages } from './use-languages';
import { isCmsValueDataObject } from './utils/cms-utils';
import { useKnownHotkeys } from './utils/hotkeys';

function CmsEditor(props: EditorProps) {
  const [detail, setDetail] = useState(true);
  const { t } = useTranslation();

  const [context, setContext] = useState(props.context);
  useEffect(() => {
    setContext(props.context);
  }, [props]);
  const [selectedContentObject, setSelectedContentObject] = useState<number>();

  const client = useClient();
  const { dataKey } = useQueryKeys();

  const { defaultLanguageTags, setDefaultLanguageTags, languageDisplayName } = useLanguages(context);
  const { data, isPending, isError, error } = useQuery({
    queryKey: dataKey({ context, languageTags: defaultLanguageTags }),
    queryFn: async () => await client.data({ context, languageTags: defaultLanguageTags }),
    structuralSharing: false
  });

  const hotkeys = useKnownHotkeys();

  const openUrl = useAction('openUrl');
  useHotkeys(hotkeys.openHelp.hotkey, () => openUrl(data?.helpUrl), { scopes: ['global'] });

  if (isPending) {
    return (
      <Flex alignItems='center' justifyContent='center' style={{ width: '100%', height: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (isError) {
    return <PanelMessage icon={IvyIcons.ErrorXMark} message={t('message.error', { error })} />;
  }

  const contentObjects = data.data.filter((contentObject: CmsDataObject) => isCmsValueDataObject(contentObject));
  const contentObject = selectedContentObject !== undefined ? contentObjects[selectedContentObject] : undefined;
  const { mainTitle, detailTitle } = toolbarTitles(context.pmv, contentObject);

  return (
    <AppProvider
      value={{
        context,
        contentObjects,
        selectedContentObject,
        setSelectedContentObject,
        detail,
        setDetail,
        defaultLanguageTags,
        setDefaultLanguageTags,
        languageDisplayName,
        cmUrl: data.cmUrl
      }}
    >
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={75} minSize={50} className='cms-editor-main-panel'>
          <Flex direction='column' className='cms-editor-panel-content'>
            <MainToolbar title={mainTitle} />
            <MainContent />
          </Flex>
        </ResizablePanel>
        {detail && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={10} className='cms-editor-detail-panel'>
              <Flex direction='column' className='cms-editor-panel-content'>
                <DetailToolbar title={detailTitle} helpUrl={data.helpUrl} />
                <DetailContent key={contentObject?.uri} />
              </Flex>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </AppProvider>
  );
}

export default CmsEditor;

export const toolbarTitles = (pmv: string, contentObject?: CmsDataObject) => {
  const mainTitle = `CMS - ${pmv}`;
  let detailTitle = mainTitle;
  if (contentObject) {
    const lastSlashIndex = contentObject.uri.lastIndexOf('/');
    detailTitle += ` - ${contentObject.uri.substring(lastSlashIndex + 1)}`;
  }
  return { mainTitle, detailTitle };
};
