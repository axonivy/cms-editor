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
import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';
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
      <TranslationDialogContent closeTranslationWizard={closeTranslationWizard} translationRequest={translationRequest} />
    </Dialog>
  );
};

const TranslationDialogContent = ({ closeTranslationWizard, translationRequest }: TranslationWizardContentProps) => {
  const query = useContentObjectTranslation(translationRequest);
  return (
    <DialogContent
      style={{
        width: 'auto',
        maxWidth: '60vw',
        height: 'auto',
        maxHeight: '80vh'
      }}
    >
      <TranslationWizardReviewContent
        closeTranslationWizard={closeTranslationWizard}
        translationRequest={translationRequest}
        query={query}
      />
    </DialogContent>
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

type TranslationWizardReviewContentProps = {
  closeTranslationWizard: () => void;
  translationRequest: CmsTranslationRequest;
  query: UseQueryResult<CmsStringDataObject[], Error>;
};

const TranslationWizardReviewContent = ({ closeTranslationWizard, translationRequest, query }: TranslationWizardReviewContentProps) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const { updateStringValuesMutation } = useUpdateValues();

  const [translationData, setTranslationData] = useState<Array<CmsStringDataObject>>(query.data ?? []);

  const applyTranslations = () => {
    if (!translationData) return;

    updateStringValuesMutation.mutate({ context, updateRequests: translationData });
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
      <TranslationWizardReviewDialogContent
        query={query}
        translationRequest={translationRequest}
        translationData={translationData}
        setTranslationData={setTranslationData}
      />
    </BasicDialogContent>
  );
};

const TranslationWizardReviewDialogContent = ({
  query: { data, isPending, isError, error },
  translationRequest,
  translationData,
  setTranslationData
}: {
  query: UseQueryResult<CmsStringDataObject[]>;
  translationRequest: CmsTranslationRequest;
  translationData: CmsStringDataObject[];
  setTranslationData: React.Dispatch<React.SetStateAction<CmsStringDataObject[]>>;
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
        const value = originalRow.values[languageTag];
        return (
          <TranslationCell
            uri={originalRow.uri}
            translationValue={value?.value ?? ''}
            languageTag={languageTag}
            originalValue={value?.originalvalue ?? null}
            translationData={translationData}
            setTranslationData={setTranslationData}
          />
        );
      }
    }));

    return [...baseColumns, ...targetColumns];
  }, [
    translationRequest.targetLanguageTags,
    translationRequest.sourceLanguageTag,
    languageDisplayName,
    t,
    translationData,
    setTranslationData
  ]);

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
  uri,
  translationValue,
  languageTag,
  originalValue,
  setTranslationData
}: {
  uri: string;
  translationValue: string;
  languageTag: string;
  originalValue: string | null;
  translationData: CmsStringDataObject[];
  setTranslationData: React.Dispatch<React.SetStateAction<CmsStringDataObject[]>>;
}) => {
  const hasTranslation = !!translationValue;
  const hasOverridden = originalValue !== null;

  const [isTranslationSelected, setIsTranslationSelected] = useState(true);

  const handleClick = () => {
    const newTranslatedState = !isTranslationSelected;
    setIsTranslationSelected(newTranslatedState);

    setTranslationData(prev => {
      const newData = structuredClone(prev);
      const contentObject = newData.find(value => value.uri === uri);
      if (!contentObject) {
        return newData;
      }

      if (newTranslatedState) {
        contentObject.values[languageTag] = translationValue;
      } else {
        contentObject.values[languageTag] = originalValue ?? '';
      }
      return newData;
    });
  };

  return (
    <Flex style={{ cursor: 'pointer' }} onClick={handleClick} direction='column'>
      {hasTranslation && (
        <span style={{ textDecoration: !isTranslationSelected ? 'line-through' : 'none' }}>
          {languageTag}: {translationValue}
        </span>
      )}
      {hasOverridden && (
        <>
          <Separator />
          <span style={{ textDecoration: isTranslationSelected ? 'line-through' : 'none' }}>{originalValue}</span>
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
