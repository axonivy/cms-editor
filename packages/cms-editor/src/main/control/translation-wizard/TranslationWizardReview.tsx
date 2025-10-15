import type { CmsTranslationRequest } from '@axonivy/cms-editor-protocol';
import {
  BasicDialogContent,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useQuery } from '@tanstack/react-query';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { useClient } from '../../../protocol/ClientContextProvider';
import { useQueryKeys } from '../../../query/query-client';

type TranslationWizardProps = {
  hasSelectedTargetLanguages: boolean;
  closeTranslationWizard: () => void;
  translationRequest: CmsTranslationRequest;
};

export const TranslationWizardReview = ({
  hasSelectedTargetLanguages,
  closeTranslationWizard,
  translationRequest
}: TranslationWizardProps) => {
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
        <TranslationWizardReviewContent closeTranslationWizard={closeTranslationWizard} translationRequest={translationRequest} />
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
  translationRequest: CmsTranslationRequest;
};

const TranslationWizardReviewContent = ({ closeTranslationWizard, translationRequest }: TranslationWizardContentProps) => {
  const { t } = useTranslation();
  const { data } = useContentObjectTranslation(translationRequest);
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
    >
      {data?.map(contentObject => (
        <Flex key={contentObject.uri}>
          <span style={{ flex: 1 }}>{contentObject.uri}</span>
          <Flex direction='column' gap={2} style={{ flex: 1 }}>
            {Object.entries(contentObject.values).map(([languageTag, value]) => (
              <span key={languageTag}>{`${languageTag}: ${value}`}</span>
            ))}
          </Flex>
        </Flex>
      ))}
    </BasicDialogContent>
  );
};

const useContentObjectTranslation = (translationRequest: CmsTranslationRequest) => {
  const { context } = useAppContext();
  const { translateKey } = useQueryKeys();
  const client = useClient();
  return useQuery({
    queryKey: translateKey({ context, translationRequest }),
    queryFn: async () => await client.translate({ context, translationRequest }),
    structuralSharing: false
  });
};
