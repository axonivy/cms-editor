import {
  Button,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  hotkeyText,
  IvyIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import type { DisabledWithReason } from '../../../utils/types';
import { LANGUAGE_MANAGER_DIALOG_HOTKEY_IDS, LanguageManagerContent } from './language-manager/LanguageManager';
import { TRANSLATION_WIZARD_DIALOG_HOTKEY_IDS, TranslationWizardContent } from './translation-wizard/TranslationWizard';

export const LanguageTools = () => {
  const { t } = useTranslation();

  const { open: languageManagerDialogOpen, onOpenChange: onLanguageManagerOpenChange } =
    useDialogHotkeys(LANGUAGE_MANAGER_DIALOG_HOTKEY_IDS);
  const { open: translationWizardOpen, onOpenChange: onTranslationWizardOpenChange } = useDialogHotkeys(
    TRANSLATION_WIZARD_DIALOG_HOTKEY_IDS
  );

  const hotkeys = useKnownHotkeys();
  useHotkeys(hotkeys.languageManager.hotkey, () => onLanguageManagerOpenChange(true), {
    scopes: ['global'],
    keyup: true,
    enabled: !languageManagerDialogOpen
  });

  const translationWizardDisabledWithReason = useTranslationWizardDisabledWithReason();
  useHotkeys(hotkeys.translationWizard.hotkey, () => onTranslationWizardOpenChange(true), {
    scopes: ['global'],
    keyup: true,
    enabled: !translationWizardDisabledWithReason.disabled && !translationWizardOpen
  });

  return (
    <Dialog
      open={languageManagerDialogOpen || translationWizardOpen}
      onOpenChange={open => {
        // will only ever be called with open=false as opening is handled explicitly
        onLanguageManagerOpenChange(open);
        onTranslationWizardOpenChange(open);
      }}
    >
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button icon={IvyIcons.Language} aria-label={t('dialog.languageTools')} />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('dialog.languageTools')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onLanguageManagerOpenChange(true)}>
            <IvyIcon icon={IvyIcons.WorldCog} />
            {hotkeys.languageManager.label}
            <DropdownMenuShortcut>{hotkeyText(hotkeys.languageManager.hotkey)}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <TranslationWizardMenuItem
            onTranslationWizardOpenChange={onTranslationWizardOpenChange}
            disabledWithReason={translationWizardDisabledWithReason}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        {languageManagerDialogOpen ? (
          <LanguageManagerContent closeDialog={() => onLanguageManagerOpenChange(false)} />
        ) : (
          <TranslationWizardContent closeDialog={() => onTranslationWizardOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

type TranslationWizardMenuItemProps = {
  onTranslationWizardOpenChange: (open: boolean) => void;
  disabledWithReason: DisabledWithReason;
};

const TranslationWizardMenuItem = ({ onTranslationWizardOpenChange, disabledWithReason }: TranslationWizardMenuItemProps) => {
  const hotkeys = useKnownHotkeys();

  const menuItemContent = (
    <>
      <IvyIcon icon={IvyIcons.Language} />
      {hotkeys.translationWizard.label}
      <DropdownMenuShortcut>{hotkeyText(hotkeys.translationWizard.hotkey)}</DropdownMenuShortcut>
    </>
  );

  if (disabledWithReason.disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <DropdownMenuItem disabled>{menuItemContent}</DropdownMenuItem>
            </span>
          </TooltipTrigger>
          <TooltipContent>{disabledWithReason.reason}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <DropdownMenuItem onClick={() => onTranslationWizardOpenChange(true)}>{menuItemContent}</DropdownMenuItem>;
};

export const useTranslationWizardDisabledWithReason = () => {
  const { t } = useTranslation();
  const { defaultLanguageTags, capabilities } = useAppContext();
  if (!capabilities.translationServiceEnabled) {
    return {
      disabled: true,
      reason: t('dialog.translationWizard.translationServiceNotConfigured')
    };
  }
  if (defaultLanguageTags.length === 0) {
    return {
      disabled: true,
      reason: t('dialog.translationWizard.noDefaultLanguagesConfigured')
    };
  }
  return { disabled: false };
};
