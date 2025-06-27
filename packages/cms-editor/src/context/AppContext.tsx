import type { CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import { createContext, useContext } from 'react';
import type { CmsValueDataObject } from '../utils/cms-utils';

type AppContext = {
  context: CmsEditorDataContext;
  contentObjects: Array<CmsValueDataObject>;
  selectedContentObject?: number;
  setSelectedContentObject: (index?: number) => void;
  detail: boolean;
  setDetail: (visible: boolean) => void;
  defaultLanguageTags: Array<string>;
  setDefaultLanguageTags: (languageTags: Array<string>) => void;
  languageDisplayName: Intl.DisplayNames;
  cmUrl: string;
};

const appContext = createContext<AppContext>({
  context: { app: '', pmv: '', file: '' },
  contentObjects: [],
  selectedContentObject: undefined,
  setSelectedContentObject: () => {},
  detail: true,
  setDetail: () => {},
  defaultLanguageTags: [],
  setDefaultLanguageTags: () => {},
  languageDisplayName: new Intl.DisplayNames(undefined, { type: 'language' }),
  cmUrl: ''
});

export const AppProvider = appContext.Provider;

export const useAppContext = (): AppContext => {
  return useContext(appContext);
};
