import { Textarea } from '@axonivy/ui-components';
import { useTranslation } from 'react-i18next';

type ValueFieldTextAreaProps = {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
};

export const ValueFieldTextArea = ({ value, onChange, disabled }: ValueFieldTextAreaProps) => {
  const { t } = useTranslation();

  const isValuePresent = value !== undefined;

  return (
    <Textarea
      value={isValuePresent ? value : ''}
      placeholder={isValuePresent ? undefined : t('value.noValue')}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
