import type { Capabilities, CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import { createContext, use } from 'react';
import type { CmsValueDataObject } from '../utils/cms-utils';

type AppContext = {
  context: CmsEditorDataContext;
  capabilities: Capabilities;
  contentObjects: Array<CmsValueDataObject>;
  selectedContentObjects: Array<number>;
  setSelectedContentObjects: (indexes: Array<number>) => void;
  detail: boolean;
  setDetail: (visible: boolean) => void;
  defaultLanguageTags: Array<string>;
  setDefaultLanguageTags: (languageTags: Array<string>) => void;
  languageDisplayName: Intl.DisplayNames;
};

const AppContext = createContext<AppContext>({
  context: { app: '', pmv: '', file: '' },
  capabilities: { translationServiceEnabled: false },
  contentObjects: [],
  selectedContentObjects: [],
  setSelectedContentObjects: () => {},
  detail: true,
  setDetail: () => {},
  defaultLanguageTags: [],
  setDefaultLanguageTags: () => {},
  languageDisplayName: new Intl.DisplayNames(undefined, { type: 'language' })
});

export const AppProvider = AppContext.Provider;

export const useAppContext = (): AppContext => {
  return use(AppContext);
};
