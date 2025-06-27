import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Flex,
  useHotkeyLocalScopes
} from '@axonivy/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { useMeta } from '../../../protocol/use-meta';
import './LanguageToolSaveConfirmation.css';

type LanguageToolSaveConfirmationProps = {
  localesToDelete: Array<string>;
  save: (localesToDelete: Array<string>) => void;
};

export const LanguageToolSaveConfirmation = ({ localesToDelete, save }: LanguageToolSaveConfirmationProps) => {
  const { context, languageDisplayName } = useAppContext();
  const { t } = useTranslation();

  const { restoreLocalScopes, activateLocalScopes } = useHotkeyLocalScopes(['languageToolSaveDialog']);
  const [open, setOpen] = useState(false);

  const amountOfValuesToDelete = useMeta('meta/countLocaleValues', { context, locales: localesToDelete }, {}).data;
  const onOpenChange = (open: boolean) => {
    if (open && Object.values(amountOfValuesToDelete).every(value => value === 0)) {
      setOpen(false);
      save(localesToDelete);
    } else {
      setOpen(open);
      if (open) {
        activateLocalScopes();
      } else {
        restoreLocalScopes();
      }
    }
  };

  const languageValuesDisplayString = (languageTag: string, amount: number) => {
    const valueDisplayString = amount === 1 ? t('common.label.value') : t('common.label.values');
    return `${languageDisplayName.of(languageTag)}: ${amount} ${valueDisplayString}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='primary' size='large' aria-label={t('common.label.save')}>
          {t('common.label.save')}
        </Button>
      </DialogTrigger>
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }} className='cms-editor-language-tool-save-confirmation-content'>
        <DialogHeader>
          <DialogTitle>{t('dialog.languageTool.saveConfirmation.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{t('dialog.languageTool.saveConfirmation.description')}</DialogDescription>
        <Flex direction='column' gap={1} className='cms-editor-language-tool-save-confirmation-language-values'>
          {Object.entries(amountOfValuesToDelete)
            .filter(([, amount]) => amount > 0)
            .map(([languageTag, amount]) => (
              <span key={languageTag}>{languageValuesDisplayString(languageTag, amount)}</span>
            ))}
        </Flex>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='primary' size='large' aria-label={t('common.label.save')} onClick={() => save(localesToDelete)}>
              {t('common.label.save')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant='outline'
              size='large'
              aria-label={t('common.label.cancel')}
              // workaround since prop `autoFocus` is broken in dialogs (https://github.com/facebook/react/issues/23301)
              ref={button => {
                setTimeout(() => button?.focus(), 0);
              }}
            >
              {t('common.label.cancel')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
