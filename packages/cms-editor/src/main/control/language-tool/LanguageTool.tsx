import {
  BasicCheckbox,
  BasicDialogContent,
  BasicField,
  Button,
  deleteFirstSelectedRow,
  Dialog,
  DialogContent,
  DialogTrigger,
  SelectRow,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
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

const DIALOG_HOTKEY_IDS = ['languageToolDialog'];

export const LanguageTool = ({ children }: { children: ReactNode }) => {
  const { open, onOpenChange } = useDialogHotkeys(DIALOG_HOTKEY_IDS);
  const hotkeys = useKnownHotkeys();
  useHotkeys(hotkeys.languageTool.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: !open });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{children}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{hotkeys.languageTool.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className='cms-editor-language-tool-content'>
        <LanguageToolContent closeDialog={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export const LanguageToolContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { context, setDefaultLanguageTags, languageDisplayName } = useAppContext();
  const { t } = useTranslation();
  const locales = useMeta('meta/locales', context, []).data;
  const [defaultLanguages, setDefaultLanguages] = useState(getDefaultLanguageTagsLocalStorage() ?? []);
  const [languages, setLanguages] = useState<Array<Language>>(toLanguages(locales, languageDisplayName));

  const addLanguage = (language: Language) => setLanguages(languages => sortLanguages([...languages, language]));

  const deleteSelectedLanguage = () => {
    const { newData } = deleteFirstSelectedRow(table, languages);
    setLanguages(newData);
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
          closeDialog();
        }
      }
    );
  };

  const hotkeys = useKnownHotkeys();
  const deleteRef = useHotkeys(hotkeys.deleteLanguage.hotkey, () => deleteSelectedLanguage(), { scopes: DIALOG_HOTKEY_IDS });

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.code === 'Space') {
      const languageTag = table.getSelectedRowModel().flatRows[0].original.value;
      onCheckedChange(!defaultLanguages.includes(languageTag), languageTag);
    } else {
      handleKeyDown(event);
    }
  };

  return (
    <BasicDialogContent
      title={t('dialog.languageTool.title')}
      description={t('dialog.languageTool.description')}
      submit={
        <LanguageToolSaveConfirmation
          localesToDelete={locales.filter(locale => !languages.some(language => language.value === locale))}
          save={save}
        />
      }
      cancel={
        <Button variant='outline' size='large'>
          {t('common.label.cancel')}
        </Button>
      }
      onClick={() => table.resetRowSelection()}
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
    </BasicDialogContent>
  );
};
