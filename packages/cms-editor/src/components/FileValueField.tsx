import type { MapStringByte } from '@axonivy/cms-editor-protocol';
import { Button, Flex, Input } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';
import './FileValueField.css';

type FileValueFieldProps = BaseValueFieldProps<MapStringByte> & {
  updateValue: (languageTag: string, value: Array<number>) => void;
  deleteValue: (languageTag: string) => void;
  fileExtension?: string;
  setFileExtension?: (fileExtension?: string) => void;
  allowOpenFile?: boolean;
};

export const FileValueField = ({
  updateValue,
  deleteValue,
  fileExtension,
  setFileExtension,
  allowOpenFile,
  ...baseProps
}: FileValueFieldProps) => {
  const { t } = useTranslation();

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

  return (
    <BaseValueField deleteValue={deleteFileValue} {...baseProps}>
      <Flex gap={2} className='cms-editor-file-value-field'>
        <Input
          type='file'
          accept={fileExtension ? `.${fileExtension}` : undefined}
          onChange={onChange}
          disabled={baseProps.disabled}
          ref={inputRef}
        />
        {allowOpenFile && baseProps.values[baseProps.languageTag] && <Button icon={IvyIcons.File} aria-label={t('value.openFile')} />}
      </Flex>
    </BaseValueField>
  );
};
