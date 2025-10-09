import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useKnownHotkeys } from '../../../utils/hotkeys';

type DeleteContentObjectProps = {
  deleteContentObject: () => void;
  hasSelection: boolean;
};

export const DeleteContentObject = ({ deleteContentObject, hasSelection }: DeleteContentObjectProps) => {
  const hotkeys = useKnownHotkeys();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            icon={IvyIcons.Trash}
            onClick={deleteContentObject}
            disabled={!hasSelection}
            aria-label={hotkeys.deleteContentObject.label}
          />
        </TooltipTrigger>
        <TooltipContent>{hotkeys.deleteContentObject.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
