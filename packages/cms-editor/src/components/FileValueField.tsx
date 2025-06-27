import type { MapStringByte } from '@axonivy/cms-editor-protocol';
import { Button, Flex, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useAction } from '../protocol/use-action';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';

type FileValueFieldProps = BaseValueFieldProps<MapStringByte> & {
  updateValue: (languageTag: string, value: Array<number>) => void;
  deleteValue: (languageTag: string) => void;
  fileExtension?: string;
  setFileExtension?: (fileExtension?: string) => void;
  openFile?: {
    coUri: string;
  };
};

export const FileValueField = ({
  updateValue,
  deleteValue,
  fileExtension,
  setFileExtension,
  openFile,
  ...baseProps
}: FileValueFieldProps) => {
  const { t } = useTranslation();
  const { cmUrl } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const deleteFileValue = (languageTag: string) => {
    if (setFileExtension && Object.keys(baseProps.values).length === 1) {
      setFileExtension(undefined);
    }
    deleteValue(languageTag);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateValue(baseProps.languageTag, Array.from(new Uint8Array(await file.arrayBuffer())));
      setFileExtension?.(file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '');
    }
  };

  const openUrl = useAction('openUrl');

  return (
    <BaseValueField deleteValue={deleteFileValue} {...baseProps}>
      <Flex gap={2} alignItems='center'>
        <Input
          type='file'
          accept={fileExtension ? `.${fileExtension}` : undefined}
          onChange={onChange}
          disabled={baseProps.disabled}
          ref={inputRef}
        />
        {openFile && baseProps.values[baseProps.languageTag] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  icon={IvyIcons.File}
                  aria-label={t('value.openFile')}
                  onClick={() => openUrl(`${cmUrl}${openFile.coUri}?l=${baseProps.languageTag}`)}
                />
              </TooltipTrigger>
              <TooltipContent>{t('value.openFile')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Flex>
    </BaseValueField>
  );
};
