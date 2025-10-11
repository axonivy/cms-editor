import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useKnownHotkeys } from '../../../utils/hotkeys';

type DeleteContentObjectProps = {
  deleteContentObjects: () => void;
  hasSelection: boolean;
};

export const DeleteContentObject = ({ deleteContentObjects, hasSelection }: DeleteContentObjectProps) => {
  const hotkeys = useKnownHotkeys();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            icon={IvyIcons.Trash}
            onClick={deleteContentObjects}
            disabled={!hasSelection}
            aria-label={hotkeys.deleteContentObject.label}
          />
        </TooltipTrigger>
        <TooltipContent>{hotkeys.deleteContentObject.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
