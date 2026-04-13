import { Button, SidebarHeader, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, useHotkeys } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useAction } from '../protocol/use-action';
import { useKnownHotkeys } from '../utils/hotkeys';

type DetailToolbarProps = {
  title: string;
  helpUrl: string;
};

export const DetailToolbar = ({ title, helpUrl }: DetailToolbarProps) => {
  const hotkeys = useKnownHotkeys();

  const firstElementRef = useRef<HTMLDivElement>(null);
  useHotkeys(hotkeys.focusInscription.hotkey, () => firstElementRef.current?.focus(), { scopes: ['global'] });

  const openUrl = useAction('openUrl');
  const { openHelp } = useKnownHotkeys();

  return (
    <SidebarHeader icon={IvyIcons.PenEdit} title={title} tabIndex={-1} ref={firstElementRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button icon={IvyIcons.Help} onClick={() => openUrl({ url: helpUrl })} aria-label={openHelp.label} />
          </TooltipTrigger>
          <TooltipContent>{openHelp.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarHeader>
  );
};
