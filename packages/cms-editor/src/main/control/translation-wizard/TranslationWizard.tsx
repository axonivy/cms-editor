import {
  BasicDialogContent,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useKnownHotkeys } from '../../../utils/hotkeys';

const DIALOG_HOTKEY_IDS = ['translationWizardDialog'];

export const TranslationWizard = ({ children }: { children: ReactNode }) => {
  const { open, onOpenChange } = useDialogHotkeys(DIALOG_HOTKEY_IDS);
  const hotkeys = useKnownHotkeys();
  useHotkeys(hotkeys.translationWizard.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: !open });
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
    ></BasicDialogContent>
  );
};
