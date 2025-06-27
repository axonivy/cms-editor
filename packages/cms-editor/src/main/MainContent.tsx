import { type CmsData, type CmsDeleteArgs } from '@axonivy/cms-editor-protocol';
import {
  adjustSelectionAfterDeletionOfRow,
  BasicField,
  Flex,
  IvyIcon,
  SelectRow,
  selectRow,
  SortableHeader,
  Table,
  TableBody,
  TableCell,
  TableResizableHeader,
  useHotkeys,
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
import { isCmsFileDataObject, isCmsValueDataObject, type CmsValueDataObject } from '../utils/cms-utils';
import { useKnownHotkeys } from '../utils/hotkeys';
import './MainContent.css';
import { MainControl } from './control/MainControl';
import { toLanguages } from './control/language-tool/language-utils';

export const MainContent = () => {
  const { t } = useTranslation();
  const {
    context,
    contentObjects,
    selectedContentObject,
    setSelectedContentObject,
    detail,
    setDetail,
    defaultLanguageTags,
    languageDisplayName
  } = useAppContext();

  const selection = useTableSelect<CmsValueDataObject>({
    onSelect: selectedRows => {
      if (Object.keys(selectedRows).length === 0) {
        setSelectedContentObject(undefined);
        return;
      }
      const selectedRowId = Object.keys(selectedRows).find(key => selectedRows[key]);
      const selectedContentObject = table.getRowModel().flatRows.find(row => row.id === selectedRowId)?.index;
      if (selectedContentObject !== undefined) {
        setSelectedContentObject(selectedContentObject);
      }
    }
  });

  const sort = useTableSort();

  const globalFilter = useTableGlobalFilter();

  const columns = useMemo(() => {
    const columns: Array<ColumnDef<CmsValueDataObject, ReactNode>> = [
      {
        accessorKey: 'uri',
        header: ({ column }) => <SortableHeader column={column} name={t('common.label.path')} />,
        cell: cell => <span>{cell.getValue()}</span>,
        minSize: 200,
        size: 500,
        maxSize: 1000
      }
    ];
    toLanguages(defaultLanguageTags, languageDisplayName).forEach(language =>
      columns.push({
        id: language.value,
        accessorFn: co => {
          if (isCmsFileDataObject(co)) {
            return co.values[language.value] ? <IvyIcon icon={IvyIcons.File} /> : '';
          }
          return co.values[language.value];
        },
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
    ...sort.options,
    ...globalFilter.options,
    data: contentObjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      ...selection.tableState,
      ...sort.tableState,
      ...globalFilter.tableState,
      rowSelection: { [String(selectedContentObject)]: true }
    }
  });

  const rows = table.getRowModel().rows;
  const tableContainer = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 32,
    getScrollElement: () => tableContainer.current,
    overscan: 20
  });

  const { handleKeyDown } = useTableKeyHandler({ table, data: contentObjects });

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
        return { ...data, data: data.data.filter(co => co.uri !== args.uri) };
      });
      if (data !== undefined && selectedContentObject !== undefined) {
        const contentObjects = data?.data.filter(co => isCmsValueDataObject(co));
        const selection = adjustSelectionAfterDeletionOfRow(contentObjects, table, selectedContentObject);
        setSelectedContentObject(selection);
      }
      client.delete(args);
    }
  });

  const deleteContentObject = () => {
    if (selectedContentObject === undefined) {
      return;
    }
    mutate({ context, uri: contentObjects[selectedContentObject].uri });
  };

  const ref = useHotkeys(hotkeys.deleteContentObject.hotkey, () => deleteContentObject(), { scopes: ['global'], enabled: !readonly });

  return (
    <Flex direction='column' onClick={() => table.resetRowSelection()} className='cms-editor-main-content' ref={ref}>
      <BasicField
        label={t('label.contentObjects')}
        control={
          !readonly && (
            <MainControl
              selectRow={(rowId: string) => selectRow(table, rowId)}
              deleteContentObject={deleteContentObject}
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
                return (
                  <SelectRow key={row.id} row={row} style={{ transform: `translateY(${virtualRow.start}px)` }} vindex={virtualRow.index}>
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
