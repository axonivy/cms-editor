import { Input, Textarea } from '@axonivy/ui-components';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';

type FileValueFieldProps = BaseValueFieldProps & {
  updateValue: (languageTag: string, value: string) => void;
};

export const FileValueField = ({ updateValue, ...baseProps }: FileValueFieldProps) => {
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      updateValue(baseProps.languageTag, text);
    }
  };

  return (
    <BaseValueField {...baseProps}>
      <Input type='file' onChange={onChange} disabled={baseProps.disabled} />
      <Textarea value={baseProps.values[baseProps.languageTag]} disabled />
    </BaseValueField>
  );
};
