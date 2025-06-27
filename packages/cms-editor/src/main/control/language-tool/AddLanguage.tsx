import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useHotkeyLocalScopes,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import './AddLanguage.css';
import type { Language } from './language-utils';
import { LanguageBrowser } from './LanguageBrowser';

type AddLanguageProps = {
  languages: Array<Language>;
  addLanguage: (language: Language) => void;
};

export const AddLanguage = ({ languages, addLanguage }: AddLanguageProps) => {
  const { t } = useTranslation();
  const { restoreLocalScopes, activateLocalScopes } = useHotkeyLocalScopes(['addLanguageDialog']);
  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      activateLocalScopes();
    } else {
      restoreLocalScopes();
    }
  };

  const { addLanguage: shortcut } = useKnownHotkeys();
  useHotkeys(shortcut.hotkey, () => onOpenChange(true), { scopes: ['languageToolDialog'], keyup: true, enabled: !open });

  return (
    <Dialog open={open} onOpenChange={open => onOpenChange(open)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button icon={IvyIcons.Plus} aria-label={shortcut.label} />
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{shortcut.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }} className='cms-editor-add-language-content'>
        <DialogHeader>
          <DialogTitle>{t('dialog.languageTool.languageBrowser.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{t('dialog.languageTool.languageBrowser.description')}</DialogDescription>
        <LanguageBrowser languages={languages} addLanguage={addLanguage} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
