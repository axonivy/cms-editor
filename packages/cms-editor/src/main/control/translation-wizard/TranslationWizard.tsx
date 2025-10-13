import {
  BasicCheckbox,
  BasicCollapsible,
  BasicDialogContent,
  BasicField,
  BasicSelect,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { useMeta } from '../../../protocol/use-meta';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import { defaultLanguageTag, toLanguages } from '../../../utils/language-utils';

const DIALOG_HOTKEY_IDS = ['translationWizardDialog'];

type TranslationWizardProps = {
  children: ReactNode;
  disabled: boolean;
};

export const TranslationWizard = ({ children, disabled }: TranslationWizardProps) => {
  const { open, onOpenChange } = useDialogHotkeys(DIALOG_HOTKEY_IDS);
  const hotkeys = useKnownHotkeys();
  useHotkeys(hotkeys.translationWizard.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: !open && !disabled });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{children}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{hotkeys.translationWizard.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <TranslationWizardContent closeDialog={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

const TranslationWizardContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { t } = useTranslation();
  const { languages, defaultSourceLanguageTag } = useLanguages();
  const { amountOfSelectedContentObjects, selectedContentObjectsUris } = useSelectedContentObjects();

  const [sourceLanguageTag, setSourceLanguageTag] = useState(defaultSourceLanguageTag);
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

  const selectAll = () => setTargetLanguageTags(languages.map(language => language.value).filter(tag => tag !== sourceLanguageTag));
  const deselectAll = () => setTargetLanguageTags([]);

  return (
    <BasicDialogContent
      title={t('dialog.translationWizard.title')}
      description={t('dialog.translationWizard.description')}
      submit={
        <Button variant='primary' size='large' icon={IvyIcons.Check} onClick={closeDialog}>
          {t('common.label.translate')}
        </Button>
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
        control={<TargetLanguagesControl selectAll={selectAll} deselectAll={deselectAll} />}
        className='cms-editor-translation-wizard-target-languages'
      >
        {languages.map(language => (
          <BasicCheckbox
            key={language.value}
            label={language.label}
            checked={targetLanguageTags.includes(language.value)}
            onCheckedChange={checked => onTargetLanguageTagCheckedChange(checked, language.value)}
            disabled={language.value === sourceLanguageTag}
          />
        ))}
      </BasicField>
    </BasicDialogContent>
  );
};

const TargetLanguagesControl = ({ selectAll, deselectAll }: { selectAll: () => void; deselectAll: () => void }) => {
  const { t } = useTranslation();
  return (
    <Flex gap={2}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button icon={IvyIcons.Check} aria-label={t('common.label.selectAll')} onClick={selectAll} />
          </TooltipTrigger>
          <TooltipContent>{t('common.label.selectAll')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button icon={IvyIcons.Close} aria-label={t('common.label.deselectAll')} onClick={deselectAll} />
          </TooltipTrigger>
          <TooltipContent>{t('common.label.deselectAll')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Flex>
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
  const amountOfSelectedContentObjects = selectedContentObjects.length;
  const selectedContentObjectsUris = selectedContentObjects.map(index => contentObjects[index]?.uri);
  return { amountOfSelectedContentObjects, selectedContentObjectsUris };
};
