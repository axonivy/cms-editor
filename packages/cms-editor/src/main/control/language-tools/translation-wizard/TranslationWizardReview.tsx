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
  SortableHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableResizableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useMemo, type ComponentProps, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';
import { useUpdateValues } from '../../../../hooks/use-update-values';
import { useClient } from '../../../../protocol/ClientContextProvider';
import { useQueryKeys } from '../../../../query/query-client';
import './TranslationWizardReview.css';
import { useContentObjectTranslations, type ContentObjectTranslation } from './use-content-object-translations';

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
      <DialogContent
        style={{
          width: 'auto',
          maxWidth: '60vw'
        }}
      >
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
      style={{ maxHeight: '60vh' }}
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

  const translations = useContentObjectTranslations(translationRequest, data ?? []);

  const columns = useMemo<Array<ColumnDef<ContentObjectTranslation, ReactNode>>>(() => {
    const getFullDisplayName = (languageTag: string): string => languageDisplayName.of(languageTag) ?? languageTag;
    const baseColumns: Array<ColumnDef<ContentObjectTranslation, ReactNode>> = [
      {
        accessorKey: 'uri',
        header: ({ column }) => <SortableHeader column={column} name={t('common.label.path')} />,
        cell: cell => <span>{cell.getValue()}</span>
      },
      {
        accessorKey: 'sourceValue',
        header: ({ column }) => (
          <SortableHeader
            column={column}
            name={`${getFullDisplayName(translationRequest.sourceLanguageTag)} (${t('common.label.sourceLanguage')})`}
          />
        ),
        cell: cell => <span>{cell.getValue()}</span>
      }
    ];

    const targetColumns: Array<ColumnDef<ContentObjectTranslation, ReactNode>> = translationRequest.targetLanguageTags.map(languageTag => ({
      id: `target-${languageTag}`,
      header: ({ column }) => <SortableHeader column={column} name={getFullDisplayName(languageTag)} />,
      cell: cell => {
        const originalRow = cell.row.original;
        const value = originalRow.values?.[languageTag];
        return (
          <TranslationCell contentObject={value?.value ?? null} languageTag={languageTag} overriddenValue={value?.originalvalue ?? null} />
        );
      }
    }));

    return [...baseColumns, ...targetColumns];
  }, [translationRequest.sourceLanguageTag, translationRequest.targetLanguageTags, languageDisplayName, t]);

  const table = useReactTable({
    data: translations,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

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
      <Table style={{ width: 'auto' }}>
        <TableResizableHeader headerGroups={table.getHeaderGroups()} className='cms-editor-translation-wizard-review-table-header' />
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
