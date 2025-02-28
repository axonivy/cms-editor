import {
  Button,
  Field,
  Flex,
  IvyIcon,
  Label,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  ReadonlyProvider,
  Switch,
  Toolbar,
  ToolbarTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useHotkeys,
  useTheme
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useKnownHotkeys } from '../utils/hotkeys';

type MainToolbarProps = {
  title: string;
};

export const MainToolbar = ({ title }: MainToolbarProps) => {
  const { detail, setDetail } = useAppContext();
  const { theme, setTheme, disabled } = useTheme();

  const hotkeys = useKnownHotkeys();

  const firstElement = useRef<HTMLDivElement>(null);
  useHotkeys(hotkeys.focusToolbar.hotkey, () => firstElement.current?.focus(), { scopes: ['global'] });

  return (
    <Toolbar tabIndex={-1} ref={firstElement} className='cms-editor-main-toolbar'>
      <ToolbarTitle className='cms-editor-main-toolbar-title'>{title}</ToolbarTitle>
      <Flex gap={1}>
        {!disabled && (
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button icon={IvyIcons.Settings} size='large' aria-label='Settings' />
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent sideOffset={12}>
              <ReadonlyProvider readonly={false}>
                <Flex direction='column' gap={2}>
                  <Field direction='row' alignItems='center' justifyContent='space-between' gap={4}>
                    <Label>
                      <Flex alignItems='center' gap={1}>
                        <IvyIcon icon={IvyIcons.DarkMode} />
                        Theme
                      </Flex>
                    </Label>
                    <Switch
                      defaultChecked={theme === 'dark'}
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      size='small'
                      aria-label='Theme'
                    />
                  </Field>
                </Flex>
                <PopoverArrow />
              </ReadonlyProvider>
            </PopoverContent>
          </Popover>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                icon={IvyIcons.LayoutSidebarRightCollapse}
                size='large'
                onClick={() => setDetail(!detail)}
                aria-label='Details toggle'
              />
            </TooltipTrigger>
            <TooltipContent>Details toggle</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Flex>
    </Toolbar>
  );
};
