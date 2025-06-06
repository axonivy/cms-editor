import { Input } from '@axonivy/ui-components';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';

type FileValueFieldProps = BaseValueFieldProps & {
  updateValue: (languageTag: string, value: string) => void;
};

export const FileValueField = ({ updateValue, ...baseProps }: FileValueFieldProps) => {
  return (
    <BaseValueField {...baseProps}>
      <Input type='file' onChange={event => updateValue(baseProps.languageTag, event.target.value)} disabled={baseProps.disabled} />
    </BaseValueField>
  );
};
