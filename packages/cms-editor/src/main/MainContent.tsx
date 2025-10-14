import { type CmsData, type CmsDeleteArgs } from '@axonivy/cms-editor-protocol';
import {
  adjustSelectionAfterDeletionOfRow,
  BasicField,
  Flex,
  IvyIcon,
  PanelMessage,
  SelectRow,
  selectRow,
  SortableHeader,
  Table,
  TableBody,
  TableCell,
  TableResizableHeader,
  useHotkeys,
  useMultiSelectRow,
  useReadonly,
  useTableGlobalFilter,
  useTableKeyHandler,
  useTableSelect,
  useTableSort
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useClient } from '../protocol/ClientContextProvider';
import { useQueryKeys } from '../query/query-client';
import { fileIcon, fileName, isCmsDataFileDataObject, isCmsValueDataObject, type CmsValueDataObject } from '../utils/cms-utils';
import { useKnownHotkeys } from '../utils/hotkeys';
import { toLanguages } from '../utils/language-utils';
import './MainContent.css';
import { EmptyMainControl, MainControl } from './control/MainControl';

export const MainContent = () => {
  const { t } = useTranslation();
  const {
    context,
    contentObjects,
    selectedContentObjects,
    setSelectedContentObjects,
    detail,
    setDetail,
    defaultLanguageTags,
    languageDisplayName
  } = useAppContext();

  const selection = useTableSelect<CmsValueDataObject>({
    onSelect: selectedRows => setSelectedContentObjects(Object.keys(selectedRows).map(key => Number(key)))
  });

  const sort = useTableSort();

  const globalFilter = useTableGlobalFilter();

  const columns = useMemo(() => {
    const columns: Array<ColumnDef<CmsValueDataObject, ReactNode>> = [
      {
        accessorKey: 'uri',
        header: ({ column }) => <SortableHeader column={column} name={t('common.label.path')} />,
        cell: cell => (
          <Flex alignItems='center' gap={1}>
            {<IvyIcon icon={isCmsDataFileDataObject(cell.row.original) ? fileIcon(cell.row.original.mimeType) : IvyIcons.Quote} />}
            <span>{cell.getValue()}</span>
          </Flex>
        ),
        minSize: 200,
        size: 500,
        maxSize: 1000
      }
    ];
    toLanguages(defaultLanguageTags, languageDisplayName).forEach(language =>
      columns.push({
        id: language.value,
        accessorFn: co => (isCmsDataFileDataObject(co) && co.values[language.value] ? fileName(co) : co.values[language.value]),
        header: ({ column }) => <SortableHeader column={column} name={language.label} />,
        cell: cell => <span>{cell.getValue()}</span>,
        minSize: 200,
        size: 500,
        maxSize: 1000
      })
    );
    return columns;
  }, [defaultLanguageTags, languageDisplayName, t]);

  const table = useReactTable({
    ...selection.options,
    enableMultiRowSelection: true,
    ...sort.options,
    ...globalFilter.options,
    data: contentObjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      ...selection.tableState,
      rowSelection: Object.fromEntries(selectedContentObjects.map(index => [index, true])),
      ...sort.tableState,
      ...globalFilter.tableState
    }
  });
  const { handleMultiSelectOnRow } = useMultiSelectRow(table);

  const rows = table.getRowModel().rows;
  const tableContainer = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 32,
    getScrollElement: () => tableContainer.current,
    overscan: 20
  });

  const { handleKeyDown } = useTableKeyHandler({ table, data: contentObjects, options: { multiSelect: true } });

  const hotkeys = useKnownHotkeys();

  const firstElement = useRef<HTMLDivElement>(null);
  useHotkeys(hotkeys.focusMain.hotkey, () => firstElement.current?.focus(), { scopes: ['global'] });

  const readonly = useReadonly();

  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();

  const { mutate } = useMutation({
    mutationFn: async (args: CmsDeleteArgs) => {
      const data = queryClient.setQueryData<CmsData>(dataKey({ context, languageTags: defaultLanguageTags }), data => {
        if (!data) {
          return;
        }
        return { ...data, data: data.data.filter(co => !args.uris.includes(co.uri)) };
      });
      if (data !== undefined && selectedContentObjects[0] !== undefined) {
        const contentObjects = data?.data.filter(co => isCmsValueDataObject(co));
        const selection = adjustSelectionAfterDeletionOfRow(contentObjects, table, selectedContentObjects[0]);
        const newSelectedContentObjects = [];
        if (selection !== undefined) {
          newSelectedContentObjects.push(selection);
        }
        setSelectedContentObjects(newSelectedContentObjects);
      }
      client.delete(args);
    }
  });

  const deleteContentObjects = () => {
    const selectedContentObjectUris = table.getSelectedRowModel().flatRows.map(row => row.original.uri);
    mutate({ context, uris: selectedContentObjectUris });
  };

  const ref = useHotkeys(hotkeys.deleteContentObject.hotkey, () => deleteContentObjects(), { scopes: ['global'], enabled: !readonly });

  if (contentObjects === undefined || contentObjects.length === 0) {
    return (
      <Flex direction='column' alignItems='center' justifyContent='center' style={{ height: '100%' }}>
        <PanelMessage icon={IvyIcons.Tool} message={t('message.addFirstItem')} mode='column'>
          <EmptyMainControl selectRow={(rowId: string) => selectRow(table, rowId)} />
        </PanelMessage>
      </Flex>
    );
  }

  return (
    <Flex direction='column' onClick={() => table.resetRowSelection()} className='cms-editor-main-content' ref={ref}>
      <BasicField
        label={t('label.contentObjects')}
        control={
          !readonly && (
            <MainControl
              selectRow={(rowId: string) => selectRow(table, rowId)}
              deleteContentObjects={deleteContentObjects}
              hasSelection={table.getSelectedRowModel().flatRows.length !== 0}
            />
          )
        }
        tabIndex={-1}
        ref={firstElement}
        onClick={event => event.stopPropagation()}
        className='cms-editor-main-table-field'
      >
        {globalFilter.filter}
        <div ref={tableContainer} className='cms-editor-main-table-container'>
          <Table onKeyDown={event => handleKeyDown(event, () => setDetail(!detail))} className='cms-editor-main-table'>
            <TableResizableHeader headerGroups={table.getHeaderGroups()} onClick={() => table.resetRowSelection()} />
            <TableBody style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                if (row === undefined) {
                  return null;
                }
                return (
                  <SelectRow
                    key={row.id}
                    row={row}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                    vindex={virtualRow.index}
                    onClick={event => handleMultiSelectOnRow(row, event)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </SelectRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </BasicField>
    </Flex>
  );
};
