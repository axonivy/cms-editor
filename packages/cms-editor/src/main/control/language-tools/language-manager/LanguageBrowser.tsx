import { BrowsersView, groupBy, useBrowser } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useMeta } from '../../../../protocol/use-meta';
import { toLanguages, type Language } from '../../../../utils/language-utils';

type LanguageBrowserProps = {
  languages: Array<Language>;
  addLanguage: (language: Language) => void;
  closeDialog: () => void;
};

export const LanguageBrowser = ({ languages, addLanguage, closeDialog }: LanguageBrowserProps) => {
  const { t } = useTranslation();

  const languageBrowser = useLanguageBrowser(languages);
  const options = useMemo(
    () => ({
      applyBtn: { label: t('dialog.languageManager.languageBrowser.addLanguage') },
      cancelBtn: { label: t('common.label.cancel') },
      info: { label: t('common.label.info') },
      search: { placeholder: t('common.label.search') }
    }),
    [t]
  );

  return (
    <BrowsersView
      browsers={[
        {
          name: t('common.label.language'),
          icon: IvyIcons.Language,
          browser: languageBrowser,
          infoProvider: row => (row ? `${row.original.value} (${(row.original.data as Language).value})` : undefined)
        }
      ]}
      apply={(_browserName, result) => {
        if (result) {
          addLanguage(result.data as Language);
        }
        closeDialog();
      }}
      options={options}
    />
  );
};

const useLanguageBrowser = (languages: Array<Language>) => {
  const { languageDisplayName } = useAppContext();
  const locales = useMeta('meta/supportedLocales', null, []).data;
  const languageNodes = useMemo(
    () => aggregateLanguageNodes(locales, languageDisplayName, languages),
    [languageDisplayName, languages, locales]
  );
  return useBrowser(languageNodes, { expandedState: {} });
};

export const aggregateLanguageNodes = (locales: Array<string>, languageDisplayName: Intl.DisplayNames, languages: Array<Language>) => {
  if (locales.length === 0) {
    return [];
  }
  const languageNodes = toLanguageNodes(locales, languageDisplayName, languages);
  const { baseLanguageNodes, regionalLanguageNodes } = groupBy(languageNodes, node =>
    node.data.value.includes('-') ? 'regionalLanguageNodes' : 'baseLanguageNodes'
  );
  const regionalLanguageNodesByBaseLanguage = groupBy(regionalLanguageNodes, language =>
    language.data.value.substring(0, language.data.value.indexOf('-'))
  );
  return baseLanguageNodes.map(node => ({ ...node, children: regionalLanguageNodesByBaseLanguage[node.data.value] ?? [] }));
};

const toLanguageNodes = (locales: Array<string>, languageDisplayName: Intl.DisplayNames, presentLanguages: Array<Language>) => {
  return toLanguages(locales, languageDisplayName).map(language => ({
    data: language,
    value: language.label,
    info: language.value,
    notSelectable: presentLanguages.some(lang => lang.value === language.value),
    children: []
  }));
};
