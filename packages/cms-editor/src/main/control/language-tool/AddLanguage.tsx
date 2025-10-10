import {
  BasicDialogHeader,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useTranslation } from 'react-i18next';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import type { Language } from '../../../utils/language-utils';
import './AddLanguage.css';
import { LanguageBrowser } from './LanguageBrowser';

type AddLanguageProps = {
  languages: Array<Language>;
  addLanguage: (language: Language) => void;
};

export const AddLanguage = ({ languages, addLanguage }: AddLanguageProps) => {
  const { t } = useTranslation();
  const { open, onOpenChange } = useDialogHotkeys(['addLanguageDialog']);
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
      <DialogContent className='cms-editor-add-language-content'>
        <Flex direction='column' gap={4} style={{ overflow: 'hidden' }}>
          <BasicDialogHeader
            title={t('dialog.languageTool.languageBrowser.title')}
            description={t('dialog.languageTool.languageBrowser.description')}
          ></BasicDialogHeader>
          <LanguageBrowser languages={languages} addLanguage={addLanguage} closeDialog={() => onOpenChange(false)} />
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
