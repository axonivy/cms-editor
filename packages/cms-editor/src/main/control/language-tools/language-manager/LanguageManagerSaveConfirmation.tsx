import { BasicDialogContent, Button, Dialog, DialogContent, Spinner, useDialogHotkeys } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useMeta } from '../../../../protocol/use-meta';

type LanguageManagerSaveConfirmationProps = {
  localesToDelete: Array<string>;
  save: (localesToDelete: Array<string>) => void;
};

export const LanguageManagerSaveConfirmation = ({ localesToDelete, save }: LanguageManagerSaveConfirmationProps) => {
  const { t } = useTranslation();
  const { open, onOpenChange } = useDialogHotkeys(['languageManagerSaveDialog']);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const onSaveClick = () => {
    if (localesToDelete.length > 0) {
      onOpenChange(true);
    } else {
      save(localesToDelete);
    }
  };

  return (
    <>
      <Button
        ref={saveButtonRef}
        variant='primary'
        size='large'
        icon={IvyIcons.Check}
        aria-label={t('common.label.save')}
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
          <LanguageManagerSaveConfirmationContent localesToDelete={localesToDelete} save={save} onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const LanguageManagerSaveConfirmationContent = ({
  localesToDelete,
  save,
  onClose
}: LanguageManagerSaveConfirmationProps & { onClose: () => void }) => {
  const { t } = useTranslation();
  const { context, languageDisplayName } = useAppContext();
  const { data: amountOfValuesToDeleteRaw, isFetching } = useMeta('meta/countLocaleValues', { context, locales: localesToDelete }, {});

  const amountOfValuesToDelete = Object.entries(amountOfValuesToDeleteRaw).filter(([, amount]) => amount > 0);

  useEffect(() => {
    if (!isFetching && amountOfValuesToDelete.length === 0) {
      save(localesToDelete);
      onClose();
    }
  }, [isFetching, amountOfValuesToDelete.length, save, localesToDelete, onClose]);

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
          disabled={isFetching}
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
      {isFetching ? (
        <div className='flex items-center justify-center p-8'>
          <Spinner />
        </div>
      ) : (
        amountOfValuesToDelete.map(([languageTag, amount]) => (
          <span key={languageTag}>{languageValuesDisplayString(languageTag, amount)}</span>
        ))
      )}
    </BasicDialogContent>
  );
};
