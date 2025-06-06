import { Textarea } from '@axonivy/ui-components';
import { useTranslation } from 'react-i18next';
import { BaseValueField, type BaseValueFieldProps } from './BaseValueField';

type StringValueFieldProps = BaseValueFieldProps & {
  updateValue: (languageTag: string, value: string) => void;
};

export const StringValueField = ({ updateValue, ...baseProps }: StringValueFieldProps) => {
  const { t } = useTranslation();

  const value = baseProps.values[baseProps.languageTag];
  const isValuePresent = value !== undefined;

  return (
    <BaseValueField {...baseProps}>
      <Textarea
        value={isValuePresent ? value : ''}
        placeholder={isValuePresent ? undefined : t('value.noValue')}
        onChange={event => updateValue(baseProps.languageTag, event.target.value)}
        disabled={baseProps.disabled}
      />
    </BaseValueField>
  );
};
