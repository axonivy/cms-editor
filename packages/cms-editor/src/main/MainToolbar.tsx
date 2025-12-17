import {
  Button,
  Toolbar,
  ToolbarTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useHotkeys
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useKnownHotkeys } from '../utils/hotkeys';

type MainToolbarProps = {
  title: string;
};

export const MainToolbar = ({ title }: MainToolbarProps) => {
  const { t } = useTranslation();
  const { detail, setDetail } = useAppContext();

  const hotkeys = useKnownHotkeys();

  const firstElement = useRef<HTMLDivElement>(null);
  useHotkeys(hotkeys.focusToolbar.hotkey, () => firstElement.current?.focus(), { scopes: ['global'] });

  return (
    <Toolbar tabIndex={-1} ref={firstElement} className='cms-editor-main-toolbar'>
      <ToolbarTitle className='cms-editor-main-toolbar-title'>{title}</ToolbarTitle>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              icon={IvyIcons.LayoutSidebarRightCollapse}
              size='large'
              onClick={() => setDetail(!detail)}
              aria-label={t('common.label.details')}
            />
          </TooltipTrigger>
          <TooltipContent>{t('common.label.details')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Toolbar>
  );
};
