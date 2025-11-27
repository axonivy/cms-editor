import type { CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import {
  BasicCheckbox,
  BasicCollapsible,
  BasicDialogContent,
  BasicField,
  BasicSelect,
  Button,
  Flex,
  type BasicCheckboxProps,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useMeta } from '../../../../protocol/use-meta';
import { defaultLanguageTag, toLanguages } from '../../../../utils/language-utils';
import type { DisabledWithReason } from '../../../../utils/types';
import './TranslationWizard.css';
import { TranslationWizardReview } from './TranslationWizardReview';

export const TRANSLATION_WIZARD_DIALOG_HOTKEY_IDS = ['translationWizardDialog'];

type CheckedState = Required<BasicCheckboxProps>['checked'];

export const TranslationWizardContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { t } = useTranslation();
  const { context, defaultLanguageTags, languageDisplayName } = useAppContext();

  const sourceLanguages = toLanguages(defaultLanguageTags, languageDisplayName);
  const defaultSourceLanguageTag = defaultLanguageTag(defaultLanguageTags);

  const [sourceLanguageTag, setSourceLanguageTag] = useState(defaultSourceLanguageTag ?? '');
  const onSourceTagLanguageChange = (languageTag: string) => {
    removeTargetLanguageTag(languageTag);
    setSourceLanguageTag(languageTag);
  };

  const notTranslatableFilters = useNotTranslatableFilters(sourceLanguageTag);
  const { allSelectedContentObjects, translatableSelectedContentObjectUris, selectedContentObjectsCollapsibleMessages } =
    useTranslatableSelectedContentObjects(notTranslatableFilters);
  const amountOfTranslatableSelectedContentObjects = translatableSelectedContentObjectUris.length;

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

  const locales = useMeta('meta/locales', context, []).data;
  const targetLanguages = toLanguages(locales, languageDisplayName).filter(language => language.value !== sourceLanguageTag);
  const selectableTargetLanguageTags = targetLanguages.map(language => language.value);
  const selectAll = () => setTargetLanguageTags(selectableTargetLanguageTags);
  const deselectAll = () => setTargetLanguageTags([]);

  let translationDisabledWithReason: DisabledWithReason = { disabled: false };
  const selectedContentObjectsError = selectedContentObjectsCollapsibleMessages.find(message => message.variant === 'error');
  if (selectedContentObjectsError) {
    translationDisabledWithReason = { disabled: true, reason: selectedContentObjectsError.message };
  } else if (targetLanguageTags.length === 0) {
    translationDisabledWithReason = { disabled: true, reason: t('dialog.translationWizard.noSelectedTargetLanguages') };
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
            <span
              key={co.uri}
              className={
                notTranslatableFilters.some(filter => !filter.condition(co))
                  ? 'cms-editor-translation-wizard-ignored-content-object'
                  : undefined
              }
            >
              {co.uri}
            </span>
          ))}
        </Flex>
      </BasicCollapsible>
      <BasicField
        label={t('common.label.sourceLanguage')}
        message={{ variant: 'info', message: t('dialog.translationWizard.sourceLanguageInfo') }}
      >
        <BasicSelect value={sourceLanguageTag} items={sourceLanguages} onValueChange={onSourceTagLanguageChange} />
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

export const useTranslatableSelectedContentObjects = (notTranslatableFilters: Array<NotTranslatableFilter>) => {
  const { contentObjects, selectedContentObjects } = useAppContext();
  const allSelectedContentObjects =
    selectedContentObjects.length === 0
      ? contentObjects
      : selectedContentObjects.map(index => contentObjects[index]).filter(co => co !== undefined);
  const { translatableSelectedContentObjectUris, messages: selectedContentObjectsCollapsibleMessages } =
    useFilterNotTranslatableContentObjects(allSelectedContentObjects, notTranslatableFilters);
  return { allSelectedContentObjects, translatableSelectedContentObjectUris, selectedContentObjectsCollapsibleMessages };
};

const useFilterNotTranslatableContentObjects = (
  contentObjects: Array<CmsValueDataObject>,
  notTranslatableFilters: Array<NotTranslatableFilter>
) => {
  const { t } = useTranslation();
  let translatableContentObjects = contentObjects;
  const messages: Array<MessageData> = [];
  notTranslatableFilters.forEach(
    filter => (translatableContentObjects = applyNotTranslatableFilter(translatableContentObjects, messages, filter))
  );
  if (translatableContentObjects.length === 0) {
    messages.unshift({ variant: 'error', message: t('dialog.translationWizard.noTranslatableSelectedContentObjects') });
  }
  const translatableSelectedContentObjectUris = translatableContentObjects.map(co => co.uri);
  return { translatableSelectedContentObjectUris, messages };
};

const applyNotTranslatableFilter = (
  contentObjects: Array<CmsValueDataObject>,
  messages: Array<MessageData>,
  filter: NotTranslatableFilter
) => {
  const filteredContentObjects = contentObjects.filter(filter.condition);
  if (filteredContentObjects.length !== contentObjects.length) {
    messages.push(filter.message);
  }
  return filteredContentObjects;
};

type NotTranslatableFilter = { condition: (co: CmsValueDataObject) => boolean; message: MessageData };
const useNotTranslatableFilters = (sourceLanguageTag: string): Array<NotTranslatableFilter> => {
  const { t } = useTranslation();
  return [
    { condition: co => co.type !== 'FILE', message: { variant: 'warning', message: t('dialog.translationWizard.ignoreFiles') } },
    {
      condition: co => co.values[sourceLanguageTag] !== undefined,
      message: { variant: 'warning', message: t('dialog.translationWizard.ignoreEmptySourceLanguageValues') }
    }
  ];
};
