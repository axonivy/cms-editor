import type { CmsFileDataObject, CmsReadFileDataObject } from '@axonivy/cms-editor-protocol';
import {
  Button,
  Flex,
  Input,
  IvyIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useReadonly
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAction } from '../protocol/use-action';
import { fileName, isCmsReadFileDataObject } from '../utils/cms-utils';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';
import './FileValueField.css';

export type FileValueFieldProps = BaseValueFieldProps<CmsFileDataObject | CmsReadFileDataObject> & {
  updateValue: (languageTag: string, value: Array<number>) => void;
  deleteValue: (languageTag: string) => void;
  setFileExtension?: (fileExtension?: string) => void;
  allowOpenFile?: boolean;
};

export const FileValueField = ({ updateValue, deleteValue, setFileExtension, allowOpenFile, ...baseProps }: FileValueFieldProps) => {
  const { t } = useTranslation();

  const contentObject = baseProps.contentObject;

  const [fileNameValue, setFileNameValue] = useState(fileName(contentObject));

  const inputRef = useRef<HTMLInputElement>(null);

  const deleteFileValue = (languageTag: string) => {
    if (setFileExtension && Object.keys(contentObject.values).length === 1) {
      setFileExtension(undefined);
    }
    deleteValue(languageTag);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || (baseProps.contentObject.fileExtension && !file.name.endsWith(`.${baseProps.contentObject.fileExtension}`))) {
      return;
    }
    updateFile(file);
  };

  const updateFile = async (file?: File) => {
    if (!file) {
      return;
    }
    updateValue(baseProps.language.value, Array.from(new Uint8Array(await file.arrayBuffer())));
    setFileNameValue(file.name);
    setFileExtension?.(file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '');
  };

  const url = contentObject.values[baseProps.language.value];
  const openUrl = useAction('openUrl');

  const readonly = useReadonly();

  return (
    <BaseValueField
      deleteValue={deleteFileValue}
      customControl={
        allowOpenFile &&
        url &&
        isCmsReadFileDataObject(contentObject) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button icon={IvyIcons.Download} aria-label={t('value.openFile')} onClick={() => openUrl(url as string)} />
              </TooltipTrigger>
              <TooltipContent>{t('value.openFile')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      {...baseProps}
    >
      <Flex
        gap={2}
        alignItems='center'
        className='cms-editor-file-picker'
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={event => event.preventDefault()}
        aria-disabled={readonly || baseProps.disabled}
      >
        {contentObject.values[baseProps.language.value] === undefined ? (
          <>
            <IvyIcon icon={IvyIcons.Upload} />
            <span>
              <a href='#' onClick={e => e.preventDefault()}>
                {t('common.label.chooseFile')}
              </a>{' '}
              {t('value.orDragAndDrop')}
            </span>
          </>
        ) : (
          <>
            <IvyIcon icon={IvyIcons.Check} />
            <span>{fileNameValue}</span>
            <a href='#' onClick={e => e.preventDefault()}>
              {t('common.label.changeFile')}
            </a>
          </>
        )}
        <Input
          type='file'
          accept={baseProps.contentObject.fileExtension ? `.${baseProps.contentObject.fileExtension}` : undefined}
          onChange={event => updateFile(event.target.files?.[0])}
          disabled={baseProps.disabled}
          ref={inputRef}
        />
      </Flex>
    </BaseValueField>
  );
};
