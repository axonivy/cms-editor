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
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import React, { type ComponentProps } from 'react';
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
  const { context } = useAppContext();

  const query = useContentObjectTranslation(translationRequest);
  const [striked, setStriked] = React.useState<string[]>([]);

  const { updateStringValuesMutation } = useUpdateValues();
  const applyTranslations = () => {
    const filteredUpdates = (query.data ?? []).map(contentObject => ({
      ...contentObject,
      values: Object.fromEntries(
        Object.entries(contentObject.values).filter(([languageTag]) => !striked.includes(`${contentObject.uri}:${languageTag}`))
      )
    }));
    updateStringValuesMutation.mutate({ context, updateRequests: filteredUpdates });
    closeTranslationWizard();
  };

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
        <Button
          variant='primary'
          size='large'
          icon={IvyIcons.Check}
          onClick={applyTranslations}
          disabled={query.isPending || query.isError}
        >
          {t('common.label.apply')}
        </Button>
      }
    >
      <TranslationWizardReviewDialogContent
        query={query}
        sourceLanguage={translationRequest.sourceLanguageTag}
        striked={striked}
        setStriked={setStriked}
      />
    </BasicDialogContent>
  );
};

const TranslationWizardReviewDialogContent = ({
  query: { data, isPending, isError, error },
  striked,
  sourceLanguage,
  setStriked
}: {
  query: UseQueryResult<Array<CmsStringDataObject>>;
  striked: string[];
  sourceLanguage: string;
  setStriked: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { t } = useTranslation();
  const { contentObjects } = useAppContext();

  const getOverriddenValue = (uri: string, languageTag: string) => {
    const obj = contentObjects.find(co => co.uri === uri);
    return obj?.values?.[languageTag] ?? null;
  };

  const getSourceValue = (uri: string) => {
    const obj = contentObjects.find(co => co.uri === uri);
    return obj?.values?.[sourceLanguage] ?? '-';
  };

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

  const allLanguageTags = Array.from(new Set(data.flatMap(contentObject => Object.keys(contentObject.values)))).filter(
    tag => tag !== sourceLanguage
  );

  return (
    <Flex>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('common.label.cms')}</TableHead>
            <TableHead>{t('common.label.sourceLanguage')}</TableHead>
            {allLanguageTags.map(languageTag => (
              <TableHead key={languageTag}>
                {t('label.targetLanguages')} {languageTag}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(contentObject => (
            <TableRow key={contentObject.uri}>
              <TableCell>{contentObject.uri}</TableCell>
              <TableCell>{getSourceValue(contentObject.uri)}</TableCell>
              {allLanguageTags.map(languageTag => {
                const cellKey = `${contentObject.uri}:${languageTag}`;
                const overriddenValue = getOverriddenValue(contentObject.uri, languageTag);
                const hasOverridden = overriddenValue !== null;
                const showValue = contentObject.values[languageTag];
                const showOverridden = hasOverridden;
                const isStrikedValue = striked.includes(cellKey + ':value');
                const isStrikedOverridden = striked.includes(cellKey + ':overridden');

                return (
                  <TableCell key={languageTag} style={{ cursor: showValue || showOverridden ? 'pointer' : 'default' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {showValue && (
                        <span
                          style={{ textDecoration: isStrikedValue ? 'line-through' : 'none' }}
                          onClick={() =>
                            setStriked(prev =>
                              isStrikedValue ? prev.filter(tag => tag !== cellKey + ':value') : [...prev, cellKey + ':value']
                            )
                          }
                        >
                          {languageTag}: {showValue}
                        </span>
                      )}
                      {showOverridden && (
                        <>
                          <Separator />
                          <span
                            style={{ textDecoration: isStrikedOverridden ? 'line-through' : 'none' }}
                            onClick={() =>
                              setStriked(prev =>
                                isStrikedOverridden
                                  ? prev.filter(tag => tag !== cellKey + ':overridden')
                                  : [...prev, cellKey + ':overridden']
                              )
                            }
                          >
                            {overriddenValue}
                          </span>
                        </>
                      )}
                      {!showValue && !showOverridden && <span>-</span>}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Flex>
  );
};

const useContentObjectTranslation = (translationRequest: CmsTranslationRequest) => {
  const { context } = useAppContext();
  const { translateKey } = useQueryKeys();
  const client = useClient();
  return useQuery({
    queryKey: translateKey({ context, translationRequest }),
    queryFn: async () => await client.translate({ context, translationRequest }),
    structuralSharing: false,
    retry: false
  });
};
