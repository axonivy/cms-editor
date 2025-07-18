import {
  BasicField,
  Button,
  Flex,
  Separator,
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
import type { Language } from '../main/control/language-tool/language-utils';
import type { CmsValueDataObject } from '../utils/cms-utils';

export type BaseValueFieldProps<T extends CmsValueDataObject> = {
  contentObject: T;
  deleteValue: (languageTag: string) => void;
  language: Language;
  customControl?: ReactNode;
  disabled?: boolean;
  disabledDelete?: boolean;
  deleteTooltip?: string;
  message?: MessageData;
  children?: ReactNode;
};

export const BaseValueField = ({
  contentObject,
  deleteValue,
  language,
  customControl,
  disabled,
  disabledDelete,
  deleteTooltip,
  message,
  children
}: BaseValueFieldProps<CmsValueDataObject>) => {
  const { t } = useTranslation();
  const readonly = useReadonly();

  const isValuePresent = contentObject.values[language.value] !== undefined;
  const deleteButton =
    readonly || !isValuePresent ? null : (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              icon={IvyIcons.Trash}
              onClick={() => deleteValue(language.value)}
              disabled={disabled || disabledDelete}
              aria-label={t('value.delete')}
            />
          </TooltipTrigger>
          <TooltipContent>{deleteTooltip ?? t('value.delete')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

  return (
    <BasicField
      label={language.label}
      control={
        <Flex gap={2}>
          {customControl}
          {customControl && deleteButton && <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />}
          {deleteButton}
        </Flex>
      }
      className='cms-editor-value-field'
      message={message}
    >
      {children}
    </BasicField>
  );
};
