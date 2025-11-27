import type { CmsStringDataObject, CmsTranslationRequest } from '@axonivy/cms-editor-protocol';
import {
  BasicDialogContent,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  PanelMessage,
  Separator,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useUpdateValues } from '../../../../hooks/use-update-values';
import { useClient } from '../../../../protocol/ClientContextProvider';
import { useQueryKeys } from '../../../../query/query-client';
import { useContentObjectTranslations } from './use-content-object-translations';

export type DisabledWithReason = { disabled: boolean; reason?: string };

type TranslationWizardProps = {
  disabledWithReason: DisabledWithReason;
  closeTranslationWizard: () => void;
  translationRequest: CmsTranslationRequest;
};

export const TranslationWizardReview = ({ disabledWithReason, closeTranslationWizard, translationRequest }: TranslationWizardProps) => {
  return (
    <Dialog>
      {disabledWithReason.disabled && disabledWithReason.reason ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <TranslationWizardReviewTrigger disabled={true} />
            </TooltipTrigger>
            <TooltipContent>{disabledWithReason.reason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TranslationWizardReviewTrigger disabled={disabledWithReason.disabled} />
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
  const { context } = useAppContext();
  const query = useContentObjectTranslation(translationRequest);
  const { updateStringValuesMutation } = useUpdateValues();

  const applyTranslations = () => {
    if (!query.data) return;

    updateStringValuesMutation.mutate({ context, updateRequests: query.data });
    closeTranslationWizard();
  };

  const isSubmitDisabled = query.isPending || query.isError;

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
        <Button variant='primary' size='large' icon={IvyIcons.Check} onClick={applyTranslations} disabled={isSubmitDisabled}>
          {t('common.label.apply')}
        </Button>
      }
    >
      <TranslationWizardReviewDialogContent query={query} translationRequest={translationRequest} />
    </BasicDialogContent>
  );
};

const TranslationWizardReviewDialogContent = ({
  query: { data, isPending, isError, error },
  translationRequest
}: {
  query: UseQueryResult<CmsStringDataObject[]>;
  translationRequest: CmsTranslationRequest;
}) => {
  const { t } = useTranslation();
  const { languageDisplayName } = useAppContext();

  const getFullDisplayName = (languageTag: string): string => languageDisplayName.of(languageTag) ?? languageTag;
  const translations = useContentObjectTranslations(translationRequest, data ?? []);

  if (isPending) {
    return (
      <Flex alignItems='center' justifyContent='center' style={{ width: '100%', height: '100%' }}>
        <Spinner className='cms-editor-translation-wizard-review-spinner' />
      </Flex>
    );
  }

  if (isError) {
    return (
      <PanelMessage
        icon={IvyIcons.ErrorXMark}
        message={t('message.error', { error })}
        className='cms-editor-translation-wizard-review-error'
      />
    );
  }

  return (
    <Flex>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('common.label.path')}</TableHead>
            <TableHead>
              {getFullDisplayName(translationRequest.sourceLanguageTag)} {'(' + t('common.label.sourceLanguage') + ')'}
            </TableHead>
            {translationRequest.targetLanguageTags.map(languageTag => (
              <TableHead key={languageTag}>{getFullDisplayName(languageTag)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {translations.map(contentObject => (
            <TableRow key={contentObject.uri}>
              <TableCell>
                <span>{contentObject.uri}</span>
              </TableCell>
              <TableCell>
                <span>{contentObject.sourceValue}</span>
              </TableCell>
              {translationRequest.targetLanguageTags.map(languageTag => (
                <TranslationCell
                  key={languageTag}
                  contentObject={contentObject.values[languageTag]?.value ?? null}
                  languageTag={languageTag}
                  overriddenValue={contentObject.values[languageTag]?.originalvalue ?? null}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Flex>
  );
};

const TranslationCell = ({
  contentObject,
  languageTag,
  overriddenValue
}: {
  contentObject: string | null;
  languageTag: string;
  overriddenValue: string | null;
}) => {
  const hasTranslation = !!contentObject;
  const hasOverridden = overriddenValue !== null;

  return (
    <TableCell>
      <Flex direction='column'>
        {hasTranslation && (
          <span>
            {languageTag}: {contentObject}
          </span>
        )}

        {hasOverridden && (
          <>
            <Separator />
            <span>{overriddenValue}</span>
          </>
        )}
      </Flex>
    </TableCell>
  );
};

const useContentObjectTranslation = (translationRequest: CmsTranslationRequest) => {
  const { context } = useAppContext();
  const { translateKey } = useQueryKeys();
  const client = useClient();

  return useQuery({
    queryKey: translateKey({ context, translationRequest }),
    queryFn: () => client.translate({ context, translationRequest }),
    structuralSharing: false,
    retry: false
  });
};
