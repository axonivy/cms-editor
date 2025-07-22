import {
  BasicCheckbox,
  BasicDialog,
  BasicField,
  Button,
  deleteFirstSelectedRow,
  DialogTrigger,
  SelectRow,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useHotkeyLocalScopes,
  useHotkeys,
  useTableKeyHandler,
  useTableSelect
} from '@axonivy/ui-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { useClient } from '../../../protocol/ClientContextProvider';
import { useMeta } from '../../../protocol/use-meta';
import { genQueryKey, useQueryKeys } from '../../../query/query-client';
import { filterNotPresentDefaultLanugageTags, getDefaultLanguageTagsLocalStorage } from '../../../use-languages';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import { sortLanguages, toLanguages, type Language } from './language-utils';
import './LanguageTool.css';
import { LanguageToolControl } from './LanguageToolControl';
import { LanguageToolSaveConfirmation } from './LanguageToolSaveConfirmation';

export const LanguageTool = ({ children }: { children: ReactNode }) => {
  const { context, setDefaultLanguageTags, languageDisplayName } = useAppContext();
  const { t } = useTranslation();

  const { restoreLocalScopes, activateLocalScopes } = useHotkeyLocalScopes(['languageToolDialog']);
  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      activateLocalScopes();
      initializeDialog();
    } else {
      restoreLocalScopes();
    }
  };

  const initialDefaultLanguages = () => {
    const defaultLanguageTags = getDefaultLanguageTagsLocalStorage();
    if (!defaultLanguageTags) {
      return [];
    }
    return defaultLanguageTags;
  };

  const [defaultLanguages, setDefaultLanguages] = useState(initialDefaultLanguages());
  const [languages, setLanguages] = useState<Array<Language>>([]);

  const addLanguage = (language: Language) => setLanguages(languages => sortLanguages([...languages, language]));

  const deleteSelectedLanguage = () => {
    const { newData } = deleteFirstSelectedRow(table, languages);
    setLanguages(newData);
  };

  const locales = useMeta('meta/locales', context, []).data;

  const initializeDialog = () => {
    setDefaultLanguages(initialDefaultLanguages());
    setLanguages(toLanguages(locales, languageDisplayName));
    table.resetRowSelection();
  };

  const addDefaultLanguage = (languageTag: string) => setDefaultLanguages(languages => [...languages, languageTag]);
  const removeDefaultLanguage = (languageTag: string) =>
    setDefaultLanguages(languages => languages.filter(language => language !== languageTag));
  const onCheckedChange = (checked: boolean, languageTag: string) =>
    checked ? addDefaultLanguage(languageTag) : removeDefaultLanguage(languageTag);

  const selection = useTableSelect<Language>();
  const columns: Array<ColumnDef<Language, string>> = [
    {
      accessorKey: 'label',
      cell: cell => (
        <BasicCheckbox
          label={cell.getValue()}
          checked={defaultLanguages.includes(cell.row.original.value)}
          onCheckedChange={(checked: boolean) => onCheckedChange(checked, cell.row.original.value)}
          tabIndex={-1}
        />
      )
    }
  ];
  const table = useReactTable<Language>({
    ...selection.options,
    data: languages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      ...selection.tableState
    }
  });

  const { handleKeyDown } = useTableKeyHandler({ table, data: languages });

  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();

  const saveMutation = useMutation({
    mutationFn: async (args: { localesToAdd: Array<string>; localesToRemove: Array<string> }) => {
      queryClient.setQueryData<Array<string>>(genQueryKey('meta/locales', context), locales => {
        if (!locales) {
          return undefined;
        }
        let newLocales = locales;
        if (args.localesToRemove.length > 0) {
          newLocales = newLocales.filter(locale => !args.localesToRemove.includes(locale));
          client.removeLocales({ context, locales: args.localesToRemove });
        }
        if (args.localesToAdd.length > 0) {
          newLocales = [...newLocales, ...args.localesToAdd];
          client.addLocales({ context, locales: args.localesToAdd });
        }
        return newLocales;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dataKey({ context, languageTags: filterNotPresentDefaultLanugageTags(defaultLanguages, locales) })
      });
    }
  });

  const save = (localesToRemove: Array<string>) => {
    const localesToAdd = languages.map(language => language.value).filter(locale => !locales.includes(locale));
    saveMutation.mutate(
      { localesToAdd, localesToRemove },
      {
        onSuccess: () => {
          setDefaultLanguageTags(defaultLanguages);
          onOpenChange(false);
        }
      }
    );
  };

  const hotkeys = useKnownHotkeys();
  useHotkeys(hotkeys.languageTool.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: !open });
  const deleteRef = useHotkeys(hotkeys.deleteLanguage.hotkey, () => deleteSelectedLanguage(), { scopes: ['languageToolDialog'] });

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.code === 'Space') {
      const languageTag = table.getSelectedRowModel().flatRows[0].original.value;
      onCheckedChange(!defaultLanguages.includes(languageTag), languageTag);
    } else {
      handleKeyDown(event);
    }
  };

  return (
    <BasicDialog
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{
        title: t('dialog.languageTool.title'),
        description: t('dialog.languageTool.description'),
        onClick: () => table.resetRowSelection(),
        style: { display: 'flex', flexDirection: 'column' },
        className: 'cms-editor-language-tool-content',
        buttonClose: (
          <Button variant='outline' size='large'>
            {t('common.label.cancel')}
          </Button>
        ),
        buttonCustom: (
          <LanguageToolSaveConfirmation
            localesToDelete={locales.filter(locale => !languages.some(language => language.value === locale))}
            save={save}
          />
        )
      }}
      dialogTrigger={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>{children}</DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>{hotkeys.languageTool.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <BasicField
        className='cms-editor-language-tool-languages-field'
        label={t('common.label.languages')}
        control={
          <LanguageToolControl
            languages={languages}
            addLanguage={addLanguage}
            deleteSelectedLanguage={deleteSelectedLanguage}
            hasSelection={table.getSelectedRowModel().flatRows.length !== 0}
          />
        }
      >
        <Table onKeyDown={onKeyDown} onClick={event => event.stopPropagation()} ref={deleteRef}>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <SelectRow key={row.id} row={row}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </SelectRow>
            ))}
          </TableBody>
        </Table>
      </BasicField>
    </BasicDialog>
  );
};
