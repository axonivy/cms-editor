import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';
import { ValueFieldTextArea } from './ValueFieldTextArea';

type StringValueFieldProps = BaseValueFieldProps & {
  updateValue: (languageTag: string, value: string) => void;
};

export const StringValueField = ({ updateValue, ...baseProps }: StringValueFieldProps) => {
  return (
    <BaseValueField {...baseProps}>
      <ValueFieldTextArea
        value={baseProps.values[baseProps.languageTag]}
        onChange={event => updateValue(baseProps.languageTag, event.target.value)}
        disabled={baseProps.disabled}
      />
    </BaseValueField>
  );
};
