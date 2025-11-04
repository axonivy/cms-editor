import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useKnownHotkeys } from '../../../../utils/hotkeys';

type DeleteLanguageProps = {
  deleteSelectedLanguage: () => void;
  hasSelection: boolean;
};

export const DeleteLanguage = ({ deleteSelectedLanguage, hasSelection }: DeleteLanguageProps) => {
  const { deleteLanguage: shortcut } = useKnownHotkeys();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            icon={IvyIcons.Trash}
            onClick={event => {
              deleteSelectedLanguage();
              event.stopPropagation();
            }}
            disabled={!hasSelection}
            aria-label={shortcut.label}
          />
        </TooltipTrigger>
        <TooltipContent>{shortcut.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
