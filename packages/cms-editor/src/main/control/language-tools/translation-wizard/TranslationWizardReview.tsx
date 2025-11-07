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
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useUpdateValues } from '../../../../hooks/use-update-values';
import { useClient } from '../../../../protocol/ClientContextProvider';
import { useQueryKeys } from '../../../../query/query-client';

type TranslationWizardProps = {
  hasSelectedTargetLanguages: boolean;
  closeTranslationWizard: () => void;
  translationRequest: CmsTranslationRequest;
};

const extractTargetLanguages = (data: CmsStringDataObject[], sourceLanguage: string): string[] => {
  const uniqueTags = new Set(data.flatMap(obj => Object.keys(obj.values)));
  uniqueTags.delete(sourceLanguage);
  return Array.from(uniqueTags);
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

export const TranslationWizardReview = ({
  hasSelectedTargetLanguages,
  closeTranslationWizard,
  translationRequest
}: TranslationWizardProps) => (
  <Dialog>
    <TranslationTriggerWithTooltip disabled={!hasSelectedTargetLanguages} />
    <DialogContent>
      <ReviewDialogContent closeTranslationWizard={closeTranslationWizard} translationRequest={translationRequest} />
    </DialogContent>
  </Dialog>
);

const TranslationTriggerWithTooltip = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation();

  if (!disabled) {
    return <TranslationTrigger disabled={false} />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TranslationTrigger disabled />
        </TooltipTrigger>
        <TooltipContent>{t('dialog.translationWizard.translateDisabled')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TranslationTrigger = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <DialogTrigger asChild>
      <Button variant='primary' size='large' icon={IvyIcons.Check} disabled={disabled}>
        {t('common.label.translate')}
      </Button>
    </DialogTrigger>
  );
};

const ReviewDialogContent = ({
  closeTranslationWizard,
  translationRequest
}: Omit<TranslationWizardProps, 'hasSelectedTargetLanguages'>) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const query = useContentObjectTranslation(translationRequest);
  const { updateStringValuesMutation } = useUpdateValues();

  const applyTranslations = useCallback(() => {
    if (!query.data) return;

    updateStringValuesMutation.mutate({ context, updateRequests: query.data });
    closeTranslationWizard();
  }, [query.data, updateStringValuesMutation, context, closeTranslationWizard]);

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
      <TranslationWizardReviewDialogContent query={query} sourceLanguage={translationRequest.sourceLanguageTag} />
    </BasicDialogContent>
  );
};

const TranslationWizardReviewDialogContent = ({
  query: { data, isPending, isError, error },
  sourceLanguage
}: {
  query: UseQueryResult<CmsStringDataObject[]>;
  sourceLanguage: string;
}) => {
  const { t } = useTranslation();
  const { contentObjects } = useAppContext();

  const targetLanguages = useMemo(() => (data ? extractTargetLanguages(data, sourceLanguage) : []), [data, sourceLanguage]);

  const getContentObjectValue = useCallback(
    (uri: string, languageTag: string) => {
      const obj = contentObjects.find(co => co.uri === uri);
      return obj?.values?.[languageTag];
    },
    [contentObjects]
  );

  const getSourceValue = useCallback(
    (uri: string) => getContentObjectValue(uri, sourceLanguage) ?? '-',
    [getContentObjectValue, sourceLanguage]
  );

  const getOverriddenValue = useCallback(
    (uri: string, languageTag: string): string | null => {
      const value = getContentObjectValue(uri, languageTag);
      return typeof value === 'string' ? value : null;
    },
    [getContentObjectValue]
  );

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
            <TableHead>{t('common.label.cms')}</TableHead>
            <TableHead>{t('common.label.sourceLanguage')}</TableHead>
            {targetLanguages.map(languageTag => (
              <TableHead key={languageTag}>
                {t('common.label.targetLanguages')} {languageTag}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(contentObject => (
            <TableRow key={contentObject.uri}>
              <TableCell>
                <span>{contentObject.uri}</span>
              </TableCell>
              <TableCell>
                <span>{getSourceValue(contentObject.uri)}</span>
              </TableCell>
              {targetLanguages.map(languageTag => (
                <TranslationCell
                  key={languageTag}
                  contentObject={contentObject}
                  languageTag={languageTag}
                  overriddenValue={getOverriddenValue(contentObject.uri, languageTag)}
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
  contentObject: CmsStringDataObject;
  languageTag: string;
  overriddenValue: string | null;
}) => {
  const translatedValue = contentObject.values[languageTag];
  const hasTranslation = !!translatedValue;
  const hasOverridden = overriddenValue !== null;
  const hasContent = hasTranslation || hasOverridden;

  if (!hasContent) {
    return (
      <TableCell>
        <span>-</span>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <Flex direction='column'>
        {hasTranslation && (
          <span>
            {languageTag}: {translatedValue}
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
