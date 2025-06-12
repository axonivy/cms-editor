import { Input } from '@axonivy/ui-components';
import { useRef } from 'react';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';
import { ValueFieldTextArea } from './ValueFieldTextArea';

type FileValueFieldProps = BaseValueFieldProps & {
  updateValue: (languageTag: string, value: string) => void;
  deleteValue: (languageTag: string) => void;
  fileExtension?: string;
  setFileExtension?: (fileExtension?: string) => void;
};

export const FileValueField = ({ updateValue, deleteValue, fileExtension, setFileExtension, ...baseProps }: FileValueFieldProps) => {
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
      updateValue(baseProps.languageTag, await file.text());
      setFileExtension?.(file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '');
    }
  };

  return (
    <BaseValueField deleteValue={deleteFileValue} {...baseProps}>
      <Input
        type='file'
        accept={fileExtension ? `.${fileExtension}` : undefined}
        onChange={onChange}
        disabled={baseProps.disabled}
        ref={inputRef}
      />
      <ValueFieldTextArea value={baseProps.values[baseProps.languageTag]} disabled />
    </BaseValueField>
  );
};
