import { BasicDialogContent, Button, Dialog, DialogContent, useDialogHotkeys } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useClient } from '../../../../protocol/ClientContextProvider';

type LanguageManagerSaveConfirmationProps = {
  localesToDelete: Array<string>;
  save: (localesToDelete: Array<string>) => void;
};

export const LanguageManagerSaveConfirmation = ({ localesToDelete, save }: LanguageManagerSaveConfirmationProps) => {
  const { t } = useTranslation();
  const { context, languageDisplayName } = useAppContext();
  const client = useClient();
  const { open, onOpenChange } = useDialogHotkeys(['languageManagerSaveDialog']);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [isCheckingValues, setIsCheckingValues] = useState(false);
  const [amountOfValuesToDelete, setAmountOfValuesToDelete] = useState<Array<[string, number]>>([]);

  const onSaveClick = async () => {
    if (localesToDelete.length === 0) {
      save(localesToDelete);
      return;
    }

    setIsCheckingValues(true);
    try {
      const amountOfValuesToDeleteRaw = await client.meta('meta/countLocaleValues', { context, locales: localesToDelete });
      const amountOfValuesToDelete = Object.entries(amountOfValuesToDeleteRaw).filter(([, amount]) => amount > 0);

      if (amountOfValuesToDelete.length === 0) {
        save(localesToDelete);
      } else {
        setAmountOfValuesToDelete(amountOfValuesToDelete);
        onOpenChange(true);
      }
    } finally {
      setIsCheckingValues(false);
    }
  };

  return (
    <>
      <Button
        ref={saveButtonRef}
        variant='primary'
        size='large'
        icon={isCheckingValues ? IvyIcons.Spinner : IvyIcons.Check}
        spin={isCheckingValues}
        aria-label={t('common.label.save')}
        disabled={isCheckingValues}
        onClick={onSaveClick}
      >
        {t('common.label.save')}
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onCloseAutoFocus={e => {
            e.preventDefault();
            saveButtonRef.current?.focus();
          }}
        >
          <LanguageManagerSaveConfirmationContent
            localesToDelete={localesToDelete}
            amountOfValuesToDelete={amountOfValuesToDelete}
            languageDisplayName={languageDisplayName}
            save={save}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const LanguageManagerSaveConfirmationContent = ({
  localesToDelete,
  amountOfValuesToDelete,
  languageDisplayName,
  save,
  onClose
}: LanguageManagerSaveConfirmationProps & {
  amountOfValuesToDelete: Array<[string, number]>;
  languageDisplayName: Intl.DisplayNames;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  const languageValuesDisplayString = (languageTag: string, amount: number) => {
    const valueDisplayString = amount === 1 ? t('common.label.value') : t('common.label.values');
    return `${languageDisplayName.of(languageTag)}: ${amount} ${valueDisplayString}`;
  };

  return (
    <BasicDialogContent
      title={t('dialog.languageManager.saveConfirmation.title')}
      description={t('dialog.languageManager.saveConfirmation.description')}
      submit={
        <Button
          variant='primary'
          size='large'
          icon={IvyIcons.Check}
          aria-label={t('common.label.save')}
          onClick={() => {
            save(localesToDelete);
            onClose();
          }}
        >
          {t('common.label.save')}
        </Button>
      }
      cancel={
        <Button variant='outline' size='large' onClick={onClose}>
          {t('common.label.cancel')}
        </Button>
      }
    >
      {amountOfValuesToDelete.map(([languageTag, amount]) => (
        <span key={languageTag}>{languageValuesDisplayString(languageTag, amount)}</span>
      ))}
    </BasicDialogContent>
  );
};
