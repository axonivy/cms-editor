import {
  type CmsData,
  type CmsDataObject,
  type CmsDataObjectValues,
  type CmsEditorDataContext,
  type CmsFileDataObject,
  type CmsStringDataObject,
  type ContentObjectType,
  type MapStringByte,
  type MapStringString
} from '@axonivy/cms-editor-protocol';
import {
  BasicField,
  BasicSelect,
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Flex,
  hotkeyText,
  Input,
  Message,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useHotkeyLocalScopes,
  useHotkeys,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileValueField } from '../../components/FileValueField';
import { StringValueField } from '../../components/StringValueField';
import { useAppContext } from '../../context/AppContext';
import { useClient } from '../../protocol/ClientContextProvider';
import { useMeta } from '../../protocol/use-meta';
import { genQueryKey, useQueryKeys } from '../../query/query-client';
import { isCmsFileDataObject, isCmsStringDataObject, removeValue } from '../../utils/cms-utils';
import { useKnownHotkeys } from '../../utils/hotkeys';
import './AddContentObject.css';
import { toLanguages, type Language } from './language-tool/language-utils';
import { useValidateAddContentObject } from './use-validate-add-content-object';

type AddContentObjectProps = {
  selectRow: (rowId: string) => void;
};

export const AddContentObject = ({ selectRow }: AddContentObjectProps) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { context, contentObjects, selectedContentObject, setSelectedContentObject, defaultLanguageTags, languageDisplayName } =
    useAppContext();
  const { restoreLocalScopes, activateLocalScopes } = useHotkeyLocalScopes(['addContentObjectDialog']);

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    if (isPending) {
      return;
    }
    setOpen(open);
    if (open) {
      activateLocalScopes();
      initializeDialog();
    } else {
      restoreLocalScopes();
    }
  };

  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState('');
  const [type, setType] = useState<ContentObjectType>('STRING');
  const [fileExtension, setFileExtension] = useState<string | undefined>();
  const [values, setValues] = useState<MapStringString | MapStringByte>({});

  const { languageTags, languageTagsMessage } = useLanguageTags();

  const setAllValuesEmpty = () => setValues(Object.fromEntries(languageTags.map(tag => [tag, ''])));

  const initializeDialog = () => {
    setName('NewContentObject');
    setNamespace(initialNamespace(contentObjects, selectedContentObject));
    setType('STRING');
    setFileExtension(undefined);
    setAllValuesEmpty();
  };

  const changeType = (type: ContentObjectType) => {
    if (type === 'FILE') {
      setValues({});
    } else {
      setAllValuesEmpty();
    }
    setFileExtension(undefined);
    setType(type);
  };

  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (args: {
      context: CmsEditorDataContext;
      uri: string;
      type: ContentObjectType;
      values: CmsDataObjectValues;
      fileExtension?: string;
    }) => {
      const contentObject = { uri: args.uri, type: args.type, values: args.values };
      if (isCmsStringDataObject(contentObject)) {
        return client.createString({ context, contentObject });
      } else if (isCmsFileDataObject(contentObject)) {
        contentObject.fileExtension = args.fileExtension ?? '';
        return client.createFile({ context, contentObject });
      }
      return;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: genQueryKey('data') })
  });

  const addContentObject = (event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => {
    const uri = `${namespace}/${name}`;
    mutate(
      { context, uri, type, values, fileExtension },
      {
        onSuccess: () => {
          const data: CmsData | undefined = queryClient.getQueryData(dataKey({ context, languageTags: defaultLanguageTags }));
          const selectedContentObject = data?.data
            .filter((contentObject: CmsDataObject) => contentObject.type !== 'FOLDER')
            .findIndex(co => co.uri === uri);
          setSelectedContentObject(selectedContentObject);
          selectRow(String(selectedContentObject));
          if (!event.ctrlKey && !event.metaKey) {
            onOpenChange(false);
          } else {
            setName('');
            nameInputRef.current?.focus();
          }
        }
      }
    );
  };

  const { nameMessage, valuesMessage } = useValidateAddContentObject(name, namespace, values, contentObjects);
  const allInputsValid = !nameMessage && !valuesMessage;

  const locales = useMeta('meta/locales', context, []).data;

  const { addContentObject: shortcut } = useKnownHotkeys();
  useHotkeys(shortcut.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: locales.length > 0 && !open });
  const enter = useHotkeys(
    ['Enter', 'mod+Enter'],
    e => {
      if (!allInputsValid) {
        return;
      }
      addContentObject(e);
    },
    { scopes: ['addContentObjectDialog'], enabled: open, enableOnFormTags: true }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button icon={IvyIcons.Plus} aria-label={shortcut.label} disabled={locales.length === 0} />
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{locales.length === 0 ? t('dialog.addContentObject.noLanguages') : shortcut.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent
        onCloseAutoFocus={e => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column' }}
        className='cms-editor-add-content-object-content'
      >
        <DialogHeader>
          <DialogTitle>{t('dialog.addContentObject.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{t('dialog.addContentObject.description')}</DialogDescription>
        <Flex direction='column' gap={3} ref={enter} tabIndex={-1} className='cms-editor-add-content-object-content-fields'>
          <BasicField label={t('common.label.name')} message={nameMessage}>
            <Input ref={nameInputRef} value={name} onChange={event => setName(event.target.value)} disabled={isPending} />
          </BasicField>
          <BasicField label={t('common.label.namespace')} message={{ variant: 'info', message: t('message.namespaceInfo') }}>
            <Combobox
              value={namespace}
              onChange={setNamespace}
              onInput={event => setNamespace(event.currentTarget.value)}
              options={namespaceOptions(contentObjects)}
              disabled={isPending}
            />
          </BasicField>
          <BasicField label={t('common.label.type')}>
            <BasicSelect value={type} onValueChange={changeType} items={typeItems} disabled={isPending} />
          </BasicField>
          {toLanguages(languageTags, languageDisplayName).map((language: Language) => {
            const props = {
              deleteValue: (languageTag: string) => setValues(values => removeValue(values, languageTag)),
              language,
              disabled: isPending,
              message: valuesMessage ?? languageTagsMessage
            };
            const contentObject = { uri: `${namespace}/${name}`, type, values, fileExtension } as CmsStringDataObject | CmsFileDataObject;
            return isCmsFileDataObject(contentObject) ? (
              <FileValueField
                key={language.value}
                contentObject={contentObject}
                updateValue={(languageTag: string, value: Array<number>) =>
                  setValues(values => ({ ...values, [languageTag]: value }) as MapStringByte)
                }
                setFileExtension={setFileExtension}
                {...props}
              />
            ) : (
              <StringValueField
                key={language.value}
                contentObject={contentObject}
                updateValue={(languageTag: string, value: string) =>
                  setValues(values => ({ ...values, [languageTag]: value }) as MapStringString)
                }
                {...props}
              />
            );
          })}
          {isError && <Message variant='error' message={t('message.error', { error })} className='cms-editor-add-dialog-error-message' />}
        </Flex>
        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='primary'
                  size='large'
                  aria-label={t('dialog.addContentObject.create')}
                  onClick={addContentObject}
                  disabled={!allInputsValid || isPending}
                  icon={isPending ? IvyIcons.Spinner : undefined}
                  spin
                >
                  {t('dialog.addContentObject.create')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dialog.addContentObject.createTooltip', { modifier: hotkeyText('mod') })}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const initialNamespace = (contentObjects: Array<CmsDataObject>, selectedContentObject?: number) => {
  if (selectedContentObject === undefined) {
    return '';
  }
  const uri = contentObjects[selectedContentObject].uri;
  return uri.substring(0, uri.lastIndexOf('/'));
};

export const useLanguageTags = () => {
  const { t } = useTranslation();
  const { context, defaultLanguageTags } = useAppContext();

  const locales = useMeta('meta/locales', context, []).data;

  return useMemo(() => {
    let languageTags: Array<string> = [];
    let languageTagsMessage: MessageData | undefined;

    if (defaultLanguageTags.length !== 0) {
      languageTags = defaultLanguageTags;
    } else if (locales.length !== 0) {
      languageTags = [locales[0]];
      languageTagsMessage = { message: t('dialog.addContentObject.noDefaultLanguages'), variant: 'info' };
    }

    return { languageTags, languageTagsMessage };
  }, [defaultLanguageTags, locales, t]);
};

export const namespaceOptions = (contentObjects: Array<CmsDataObject>) => {
  return [...new Set(contentObjects.map(co => co.uri.substring(0, co.uri.lastIndexOf('/'))))].map(option => ({ value: option }));
};

const typeItems: Array<{ value: ContentObjectType; label: string }> = [
  { value: 'STRING', label: 'String' },
  { value: 'FILE', label: 'File' }
];
