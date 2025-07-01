import type { CmsFileDataObject } from '@axonivy/cms-editor-protocol';
import { Button, Flex, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useAction } from '../protocol/use-action';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';

type FileValueFieldProps = BaseValueFieldProps<CmsFileDataObject> & {
  updateValue: (languageTag: string, value: Array<number>) => void;
  deleteValue: (languageTag: string) => void;
  setFileExtension?: (fileExtension?: string) => void;
  allowOpenFile?: boolean;
};

export const FileValueField = ({ updateValue, deleteValue, setFileExtension, allowOpenFile, ...baseProps }: FileValueFieldProps) => {
  const { t } = useTranslation();
  const { cmUrl } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const deleteFileValue = (languageTag: string) => {
    if (setFileExtension && Object.keys(baseProps.contentObject.values).length === 1) {
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
      updateValue(baseProps.language.value, Array.from(new Uint8Array(await file.arrayBuffer())));
      setFileExtension?.(file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '');
    }
  };

  const openUrl = useAction('openUrl');

  return (
    <BaseValueField deleteValue={deleteFileValue} {...baseProps}>
      <Flex gap={2} alignItems='center'>
        <Input
          type='file'
          accept={baseProps.contentObject.fileExtension ? `.${baseProps.contentObject.fileExtension}` : undefined}
          onChange={onChange}
          disabled={baseProps.disabled}
          ref={inputRef}
        />
        {allowOpenFile && baseProps.contentObject.values[baseProps.language.value] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  icon={IvyIcons.File}
                  aria-label={t('value.openFile')}
                  onClick={() => openUrl(`${cmUrl}${baseProps.contentObject.uri}?l=${baseProps.language.value}`)}
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
