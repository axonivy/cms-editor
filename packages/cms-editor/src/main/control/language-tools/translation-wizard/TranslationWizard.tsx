import { BasicCheckbox, BasicCollapsible, BasicDialogContent, BasicField, BasicSelect, Button, Flex } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useMeta } from '../../../../protocol/use-meta';
import { defaultLanguageTag, toLanguages } from '../../../../utils/language-utils';
import { TranslationWizardReview } from './TranslationWizardReview';

export const TRANSLATION_WIZARD_DIALOG_HOTKEY_IDS = ['translationWizardDialog'];

export const TranslationWizardContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { t } = useTranslation();
  const { languages, defaultSourceLanguageTag } = useLanguages();
  const { amountOfSelectedContentObjects, selectedContentObjectsUris } = useSelectedContentObjects();

  const [sourceLanguageTag, setSourceLanguageTag] = useState(defaultSourceLanguageTag ?? '');
  const onSourceTagLanguageChange = (languageTag: string) => {
    removeTargetLanguageTag(languageTag);
    setSourceLanguageTag(languageTag);
  };

  const [targetLanguageTags, setTargetLanguageTags] = useState<Array<string>>([]);
  const onTargetLanguageTagCheckedChange = (checked: CheckedState, languageTag: string) => {
    if (checked) {
      setTargetLanguageTags(targetLanguageTags => [...targetLanguageTags, languageTag]);
    } else {
      removeTargetLanguageTag(languageTag);
    }
  };
  const removeTargetLanguageTag = (languageTag: string) =>
    setTargetLanguageTags(targetLanguageTags => targetLanguageTags.filter(tag => tag !== languageTag));

  const targetLanguages = languages.filter(language => language.value !== sourceLanguageTag);
  const selectableTargetLanguageTags = targetLanguages.map(language => language.value);
  const selectAll = () => setTargetLanguageTags(selectableTargetLanguageTags);
  const deselectAll = () => setTargetLanguageTags([]);

  return (
    <BasicDialogContent
      title={t('dialog.translationWizard.title')}
      description={t('dialog.translationWizard.description')}
      submit={
        <TranslationWizardReview
          hasSelectedTargetLanguages={targetLanguageTags.length > 0}
          closeTranslationWizard={closeDialog}
          translationRequest={{ sourceLanguageTag, targetLanguageTags, uris: selectedContentObjectsUris }}
        />
      }
      cancel={
        <Button variant='outline' size='large'>
          {t('common.label.cancel')}
        </Button>
      }
    >
      <BasicCollapsible
        label={
          amountOfSelectedContentObjects === 1
            ? t('dialog.translationWizard.amountOfContentObjectsSelectedSingular')
            : t('dialog.translationWizard.amountOfContentObjectsSelectedPlural', { amount: amountOfSelectedContentObjects })
        }
      >
        <Flex direction='column' gap={1}>
          {selectedContentObjectsUris.map(uri => (
            <span key={uri}>{uri}</span>
          ))}
        </Flex>
      </BasicCollapsible>
      <BasicField label={t('common.label.sourceLanguage')}>
        <BasicSelect value={sourceLanguageTag} items={languages} onValueChange={onSourceTagLanguageChange} />
      </BasicField>
      <BasicField
        label={t('common.label.targetLanguages')}
        control={
          <TargetLanguagesControl
            selectAll={selectAll}
            deselectAll={deselectAll}
            areAllSelected={targetLanguageTags.length == selectableTargetLanguageTags.length}
          />
        }
        className='cms-editor-translation-wizard-target-languages'
      >
        {targetLanguages.map(language => (
          <BasicCheckbox
            key={language.value}
            label={language.label}
            checked={targetLanguageTags.includes(language.value)}
            onCheckedChange={checked => onTargetLanguageTagCheckedChange(checked, language.value)}
          />
        ))}
      </BasicField>
    </BasicDialogContent>
  );
};

type TargetLanguagesControlProps = {
  selectAll: () => void;
  deselectAll: () => void;
  areAllSelected: boolean;
};

const TargetLanguagesControl = ({ selectAll, deselectAll, areAllSelected }: TargetLanguagesControlProps) => {
  const { t } = useTranslation();
  return areAllSelected ? (
    <Button icon={IvyIcons.Close} size='small' onClick={deselectAll}>
      {t('common.label.deselectAll')}
    </Button>
  ) : (
    <Button icon={IvyIcons.Check} size='small' onClick={selectAll}>
      {t('common.label.selectAll')}
    </Button>
  );
};

export const useLanguages = () => {
  const { context, defaultLanguageTags, languageDisplayName } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;

  return useMemo(() => {
    const languages = toLanguages(locales, languageDisplayName);

    let defaultSourceLanguageTag;
    if (defaultLanguageTags.length > 0) {
      defaultSourceLanguageTag = defaultLanguageTag(defaultLanguageTags);
    } else {
      defaultSourceLanguageTag = defaultLanguageTag(locales);
    }

    return { languages, defaultSourceLanguageTag };
  }, [locales, languageDisplayName, defaultLanguageTags]);
};

export const useSelectedContentObjects = () => {
  const { contentObjects, selectedContentObjects } = useAppContext();
  let amountOfSelectedContentObjects;
  let selectedContentObjectsUris;
  if (selectedContentObjects.length === 0) {
    amountOfSelectedContentObjects = contentObjects.length;
    selectedContentObjectsUris = contentObjects.map(co => co.uri);
  } else {
    amountOfSelectedContentObjects = selectedContentObjects.length;
    selectedContentObjectsUris = selectedContentObjects.map(index => contentObjects[index]?.uri).filter(uri => uri !== undefined);
  }
  return { amountOfSelectedContentObjects, selectedContentObjectsUris };
};
