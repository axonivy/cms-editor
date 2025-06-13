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
      updateValue(baseProps.languageTag, await fileValue(file));
      setFileExtension?.(file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '');
    }
  };

  const value = baseProps.values[baseProps.languageTag];

  return (
    <BaseValueField deleteValue={deleteFileValue} {...baseProps}>
      <Input
        type='file'
        accept={fileExtension ? `.${fileExtension}` : undefined}
        onChange={onChange}
        disabled={baseProps.disabled}
        ref={inputRef}
      />
      <ValueFieldTextArea value={value !== undefined ? window.atob(value) : undefined} disabled />
    </BaseValueField>
  );
};

export const fileValue = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
