import type { CmsDataObjectValues } from '@axonivy/cms-editor-protocol';
import {
  BasicField,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useReadonly,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type BaseValueFieldProps<T extends CmsDataObjectValues> = {
  values: T;
  deleteValue: (languageTag: string) => void;
  label: string;
  languageTag: string;
  disabled?: boolean;
  disabledDelete?: boolean;
  deleteTooltip?: string;
  message?: MessageData;
  children?: ReactNode;
};

export const BaseValueField = ({
  values,
  deleteValue,
  label,
  languageTag,
  disabled,
  disabledDelete,
  deleteTooltip,
  message,
  children
}: BaseValueFieldProps<CmsDataObjectValues>) => {
  const { t } = useTranslation();
  const readonly = useReadonly();

  const isValuePresent = values[languageTag] !== undefined;

  return (
    <BasicField
      label={label}
      control={
        readonly ? null : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  icon={IvyIcons.Trash}
                  onClick={() => deleteValue(languageTag)}
                  disabled={disabled || disabledDelete || !isValuePresent}
                  aria-label={t('value.delete')}
                />
              </TooltipTrigger>
              <TooltipContent>{deleteTooltip ?? t('value.delete')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      className='cms-editor-value-field'
      message={message}
    >
      {children}
    </BasicField>
  );
};
