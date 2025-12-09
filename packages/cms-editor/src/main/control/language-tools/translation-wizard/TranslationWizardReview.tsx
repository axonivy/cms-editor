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
      <DialogContent
        style={{
          width: 'auto',
          maxWidth: '60vw',
          height: 'auto',
          maxHeight: '80vh'
        }}
      >
        <TranslationDialogContent closeTranslationWizard={closeTranslationWizard} translationRequest={translationRequest} />
      </DialogContent>
    </Dialog>
  );
};

const TranslationDialogContent = ({ closeTranslationWizard, translationRequest }: TranslationWizardContentProps) => {
  const query = useContentObjectTranslation(translationRequest);
  const { t } = useTranslation();

  if (query.isPending) {
    return (
      <Flex alignItems='center' justifyContent='center' style={{ width: '100%', height: '100%' }}>
        <Spinner className='cms-editor-translation-wizard-review-spinner' />
      </Flex>
    );
  }

  if (query.isError) {
    return (
      <PanelMessage
        icon={IvyIcons.ErrorXMark}
        message={t('message.error', { error: query.error })}
        className='cms-editor-translation-wizard-review-error'
      />
    );
  }

  return (
    <TranslationWizardReviewContent
      closeTranslationWizard={closeTranslationWizard}
      translationRequest={translationRequest}
      data={query.data ?? []}
    />
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
  data: Array<CmsStringDataObject>;
};

const TranslationWizardReviewContent = ({ closeTranslationWizard, translationRequest, data }: TranslationWizardReviewContentProps) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const { updateStringValuesMutation } = useUpdateValues();

  const [translationData, setTranslationData] = useState<Array<CmsStringDataObject>>(data ?? []);

  const applyTranslations = () => {
    updateStringValuesMutation.mutate({ context, updateRequests: translationData });
    closeTranslationWizard();
  };

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
        <Button variant='primary' size='large' icon={IvyIcons.Check} onClick={applyTranslations}>
          {t('common.label.apply')}
        </Button>
      }
    >
      <TranslationWizardReviewDialogContent data={data} translationRequest={translationRequest} setTranslationData={setTranslationData} />
    </BasicDialogContent>
  );
};

const TranslationWizardReviewDialogContent = ({
  data,
  translationRequest,
  setTranslationData
}: {
  data: Array<CmsStringDataObject>;
  translationRequest: CmsTranslationRequest;
  setTranslationData: React.Dispatch<React.SetStateAction<Array<CmsStringDataObject>>>;
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
        const translationValue = value?.value ?? '';
        const originalValue = value?.originalvalue ?? null;

        if (originalValue === null) {
          return <TranslationCellSimple languageTag={languageTag} translationValue={translationValue} />;
        }

        return (
          <TranslationCellWithToggle
            originalRow={originalRow}
            languageTag={languageTag}
            translationValue={translationValue}
            originalValue={originalValue}
            setTranslationData={setTranslationData}
          />
        );
      }
    }));

    return [...baseColumns, ...targetColumns];
  }, [translationRequest, languageDisplayName, t, setTranslationData]);

  const TranslationCellSimple = ({ languageTag, translationValue }: { languageTag: string; translationValue: string }) => (
    <Flex>
      <span>
        {languageTag}: {translationValue}
      </span>
    </Flex>
  );

  const TranslationCellWithToggle = ({
    originalRow,
    languageTag,
    translationValue,
    originalValue,
    setTranslationData
  }: {
    originalRow: ContentObjectTranslation;
    languageTag: string;
    translationValue: string;
    originalValue: string;
    setTranslationData: React.Dispatch<React.SetStateAction<Array<CmsStringDataObject>>>;
  }) => {
    const [isTranslationSelected, setIsTranslationSelected] = useState(true);

    const handleClick = () => {
      const newTranslatedState = !isTranslationSelected;
      setIsTranslationSelected(newTranslatedState);

      setTranslationData(prev => {
        const newData = structuredClone(prev);
        const contentObject = newData.find(value => value.uri === originalRow.uri);
        if (!contentObject) {
          return newData;
        }

        if (newTranslatedState) {
          contentObject.values[languageTag] = translationValue;
        } else {
          contentObject.values[languageTag] = originalValue;
        }
        return newData;
      });
    };

    return (
      <Flex style={{ cursor: 'pointer' }} onClick={handleClick} direction='column'>
        <span style={{ textDecoration: !isTranslationSelected ? 'line-through' : 'none' }}>
          {languageTag}: {translationValue}
        </span>
        <Separator />
        <span style={{ textDecoration: isTranslationSelected ? 'line-through' : 'none' }}>{originalValue}</span>
      </Flex>
    );
  };

  const table = useReactTable({
    data: translations,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

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
