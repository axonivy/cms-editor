import {
  BasicDialogContent,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

type TranslationWizardProps = {
  hasSelectedTargetLanguages: boolean;
  closeTranslationWizard: () => void;
};

export const TranslationWizardReview = ({ hasSelectedTargetLanguages, closeTranslationWizard }: TranslationWizardProps) => {
  const { t } = useTranslation();
  return (
    <Dialog>
      {hasSelectedTargetLanguages ? (
        <TranslationWizardReviewTrigger disabled={false} />
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <TranslationWizardReviewTrigger disabled={true} />
            </TooltipTrigger>
            <TooltipContent>{t('dialog.translationWizard.translateDisabled')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <DialogContent>
        <TranslationWizardReviewContent closeTranslationWizard={closeTranslationWizard} />
      </DialogContent>
    </Dialog>
  );
};

const TranslationWizardReviewTrigger = ({ ...props }: ComponentProps<typeof Button>) => {
  const { t } = useTranslation();
  return (
    <DialogTrigger asChild>
      <Button variant='primary' size='large' icon={IvyIcons.Check} {...props}>
        {t('common.label.translate')}
      </Button>
    </DialogTrigger>
  );
};

type TranslationWizardContentProps = {
  closeTranslationWizard: () => void;
};

const TranslationWizardReviewContent = ({ closeTranslationWizard }: TranslationWizardContentProps) => {
  const { t } = useTranslation();
  return (
    <BasicDialogContent
      title={t('dialog.translationWizard.review.title')}
      description={t('dialog.translationWizard.review.description')}
      cancel={
        <Button variant='outline' size='large'>
          {t('common.label.cancel')}
        </Button>
      }
      submit={
        <Button variant='primary' size='large' icon={IvyIcons.Check} onClick={closeTranslationWizard}>
          {t('common.label.apply')}
        </Button>
      }
    ></BasicDialogContent>
  );
};
