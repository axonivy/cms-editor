import {
  BasicCheckbox,
  BasicCollapsible,
  BasicDialogContent,
  BasicField,
  BasicSelect,
  Button,
  Flex,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useMeta } from '../../../../protocol/use-meta';
import { defaultLanguageTag, toLanguages } from '../../../../utils/language-utils';
import './TranslationWizard.css';
import { TranslationWizardReview, type DisabledWithReason } from './TranslationWizardReview';

export const TRANSLATION_WIZARD_DIALOG_HOTKEY_IDS = ['translationWizardDialog'];

export const TranslationWizardContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { t } = useTranslation();
  const { languages, defaultSourceLanguageTag } = useLanguages();
  const { allSelectedContentObjects, translatableSelectedContentObjectUris, amountOfTranslatableSelectedContentObjects } =
    useSelectedContentObjects();

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

  const selectedContentObjectsCollapsibleMessages: Array<MessageData> = [];
  let translationDisabledWithReason: DisabledWithReason = { disabled: false };
  if (translatableSelectedContentObjectUris.length === 0) {
    const reason = t('dialog.translationWizard.noTranslatableSelectedContentObjects');
    translationDisabledWithReason = { disabled: true, reason };
    selectedContentObjectsCollapsibleMessages.push({ variant: 'error', message: reason });
  } else if (targetLanguageTags.length === 0) {
    translationDisabledWithReason = { disabled: true, reason: t('dialog.translationWizard.noSelectedTargetLanguages') };
  }

  if (allSelectedContentObjects.length !== translatableSelectedContentObjectUris.length) {
    selectedContentObjectsCollapsibleMessages.push({
      variant: 'warning',
      message: t('dialog.translationWizard.ignoreFiles')
    });
  }

  return (
    <BasicDialogContent
      title={t('dialog.translationWizard.title')}
      description={t('dialog.translationWizard.description')}
      submit={
        <TranslationWizardReview
          disabledWithReason={translationDisabledWithReason}
          closeTranslationWizard={closeDialog}
          translationRequest={{ sourceLanguageTag, targetLanguageTags, uris: translatableSelectedContentObjectUris }}
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
          amountOfTranslatableSelectedContentObjects === 1
            ? t('dialog.translationWizard.amountOfContentObjectsSelectedSingular')
            : t('dialog.translationWizard.amountOfContentObjectsSelectedPlural', { amount: amountOfTranslatableSelectedContentObjects })
        }
        defaultOpen={false}
        state={{ messages: selectedContentObjectsCollapsibleMessages }}
      >
        <Flex direction='column' gap={1}>
          {allSelectedContentObjects.map(co => (
            <span key={co.uri} className={co.type === 'FILE' ? 'cms-editor-translation-wizard-ignored-content-object' : undefined}>
              {co.uri}
            </span>
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
  const allSelectedContentObjects =
    selectedContentObjects.length === 0
      ? contentObjects
      : selectedContentObjects.map(index => contentObjects[index]).filter(co => co !== undefined);
  const translatableSelectedContentObjectUris = allSelectedContentObjects.filter(co => co.type !== 'FILE').map(co => co.uri);
  const amountOfTranslatableSelectedContentObjects = translatableSelectedContentObjectUris.length;
  return { allSelectedContentObjects, translatableSelectedContentObjectUris, amountOfTranslatableSelectedContentObjects };
};
