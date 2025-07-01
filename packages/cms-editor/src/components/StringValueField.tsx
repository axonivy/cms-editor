import type { CmsStringDataObject } from '@axonivy/cms-editor-protocol';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';
import { ValueFieldTextArea } from './ValueFieldTextArea';

type StringValueFieldProps = BaseValueFieldProps<CmsStringDataObject> & {
  updateValue: (languageTag: string, value: string) => void;
};

export const StringValueField = ({ updateValue, ...baseProps }: StringValueFieldProps) => {
  return (
    <BaseValueField {...baseProps}>
      <ValueFieldTextArea
        value={baseProps.contentObject.values[baseProps.language.value]}
        onChange={event => updateValue(baseProps.language.value, event.target.value)}
        disabled={baseProps.disabled}
      />
    </BaseValueField>
  );
};
