import {
  type CmsData,
  type CmsDataObject,
  type CmsDataObjectValues,
  type CmsEditorDataContext,
  type CmsFileDataObject,
  type CmsStringDataObject,
  type ContentObjectType,
  type MapStringString
} from '@axonivy/cms-editor-protocol';
import {
  BasicDialogContent,
  BasicField,
  BasicSelect,
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogTrigger,
  hotkeyText,
  Input,
  Message,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDialogHotkeys,
  useHotkeys,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FileValueField } from '../../../components/FileValueField';
import { StringValueField } from '../../../components/StringValueField';
import { useAppContext } from '../../../context/AppContext';
import { useClient } from '../../../protocol/ClientContextProvider';
import { useMeta } from '../../../protocol/use-meta';
import { useQueryKeys } from '../../../query/query-client';
import { isCmsFileDataObject, isCmsStringDataObject, isCmsValueDataObject, removeValue } from '../../../utils/cms-utils';
import { isNotUndefined } from '../../../utils/guards';
import { useKnownHotkeys } from '../../../utils/hotkeys';
import { toLanguages, type Language } from '../../../utils/language-utils';
import './AddContentObject.css';
import { useValidateAddContentObject } from './use-validate-add-content-object';

const DIALOG_HOTKEY_IDS = ['addContentObjectDialog'];

type AddContentObjectProps = {
  selectRow: (rowId: string) => void;
  children: ReactNode;
};

export const AddContentObject = ({ selectRow, children }: AddContentObjectProps) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;
  const { open, onOpenChange } = useDialogHotkeys(DIALOG_HOTKEY_IDS);
  const { addContentObject: shortcut } = useKnownHotkeys();
  useHotkeys(shortcut.hotkey, () => onOpenChange(true), { scopes: ['global'], keyup: true, enabled: locales.length > 0 && !open });

  const mutate = useMutateContentObject();
  const onDialogOpenChange = (open: boolean) => {
    if (mutate.isPending) {
      return;
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{children}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{locales.length === 0 ? t('dialog.addContentObject.noLanguages') : shortcut.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent onCloseAutoFocus={e => e.preventDefault()} className='cms-editor-add-content-object-content'>
        <AddContentObjectContent selectRow={selectRow} closeDialog={() => onOpenChange(false)} mutate={mutate} />
      </DialogContent>
    </Dialog>
  );
};

type AddContentObjectContentProps = {
  selectRow: (rowId: string) => void;
  closeDialog: () => void;
  mutate: ReturnType<typeof useMutateContentObject>;
};

const AddContentObjectContent = ({
  selectRow,
  closeDialog,
  mutate: { mutate, isPending, isError, error }
}: AddContentObjectContentProps) => {
  const { t } = useTranslation();
  const { languageTags, languageTagsMessage } = useLanguageTags();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { context, contentObjects, selectedContentObjects, setSelectedContentObjects, defaultLanguageTags, languageDisplayName } =
    useAppContext();

  const allValuesEmpty = () => Object.fromEntries(languageTags.map(tag => [tag, '']));

  const [name, setName] = useState('NewContentObject');
  const [namespace, setNamespace] = useState(initialNamespace(contentObjects, selectedContentObjects));
  const [type, setType] = useState<ContentObjectType>('STRING');
  const [fileExtension, setFileExtension] = useState<string | undefined>();
  const [values, setValues] = useState<MapStringString>(() => allValuesEmpty());

  const changeType = (type: ContentObjectType) => {
    if (type === 'FILE') {
      setValues({});
    } else {
      setValues(allValuesEmpty());
    }
    setFileExtension(undefined);
    setType(type);
  };

  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();

  const addContentObject = (event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => {
    const uri = `${namespace.startsWith('/') ? '' : '/'}${namespace}${namespace === '' ? '' : '/'}${name}`;
    mutate(
      { context, uri, type, values, fileExtension },
      {
        onSuccess: () => {
          const data: CmsData | undefined = queryClient.getQueryData(dataKey({ context, languageTags: defaultLanguageTags }));
          const selectedContentObject = data?.data
            .filter((contentObject: CmsDataObject) => isCmsValueDataObject(contentObject))
            .findIndex(co => co.uri === uri);
          const selectedContentObjects = [];
          if (selectedContentObject !== undefined) {
            selectedContentObjects.push(selectedContentObject);
          }
          setSelectedContentObjects(selectedContentObjects);
          selectRow(String(selectedContentObject));
          if (!event.ctrlKey && !event.metaKey) {
            closeDialog();
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

  const enter = useHotkeys(
    ['Enter', 'mod+Enter'],
    e => {
      if (!allInputsValid) {
        return;
      }
      addContentObject(e);
    },
    { scopes: DIALOG_HOTKEY_IDS, enableOnFormTags: true }
  );

  return (
    <BasicDialogContent
      title={t('dialog.addContentObject.title')}
      description={t('dialog.addContentObject.description')}
      submit={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='primary'
                size='large'
                onClick={addContentObject}
                disabled={!allInputsValid || isPending}
                icon={isPending ? IvyIcons.Spinner : IvyIcons.Plus}
                spin={isPending}
              >
                {t('dialog.addContentObject.create')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dialog.addContentObject.createTooltip', { modifier: hotkeyText('mod') })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      cancel={
        <Button variant='outline' size='large'>
          {t('common.label.cancel')}
        </Button>
      }
      ref={enter}
      tabIndex={-1}
      className='cms-editor-add-content-object-content-fields'
    >
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
      {type === 'FILE' && (
        <Message variant='info' message={t('dialog.addContentObject.fileFormatInfo')} className='cms-editor-add-dialog-file-format-info' />
      )}
      {toLanguages(languageTags, languageDisplayName).map((language: Language) => {
        const props = {
          updateValue: (languageTag: string, value: string) => setValues(values => ({ ...values, [languageTag]: value })),
          deleteValue: (languageTag: string) => setValues(values => removeValue(values, languageTag)),
          language,
          disabled: isPending,
          message: valuesMessage ?? languageTagsMessage
        };
        const contentObject = { uri: `${namespace}/${name}`, type, values, fileExtension } as CmsStringDataObject | CmsFileDataObject;
        return isCmsFileDataObject(contentObject) ? (
          <FileValueField key={language.value} contentObject={contentObject} setFileExtension={setFileExtension} {...props} />
        ) : (
          <StringValueField key={language.value} contentObject={contentObject} {...props} />
        );
      })}
      {isError && <Message variant='error' message={t('message.error', { error })} className='cms-editor-add-dialog-error-message' />}
    </BasicDialogContent>
  );
};

const useMutateContentObject = () => {
  const { context } = useAppContext();
  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();
  const mutate = useMutation({
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dataKey() })
  });
  return mutate;
};

export const initialNamespace = (contentObjects: Array<CmsDataObject>, selectedContentObjects: Array<number>) => {
  if (selectedContentObjects[0] === undefined) {
    return '';
  }
  const uri = contentObjects[selectedContentObjects[0]]?.uri ?? '';
  return uri.substring(0, uri.lastIndexOf('/'));
};

export const useLanguageTags = () => {
  const { t } = useTranslation();
  const { context, defaultLanguageTags } = useAppContext();

  const locales = useMeta('meta/locales', context, []).data;

  return useMemo(() => {
    let languageTags = [locales[0]].filter(isNotUndefined);
    let languageTagsMessage: MessageData | undefined = { message: t('dialog.addContentObject.noDefaultLanguages'), variant: 'info' };

    if (defaultLanguageTags.length !== 0) {
      languageTags = defaultLanguageTags;
      languageTagsMessage = undefined;
    }
    if (locales.length === 0) {
      languageTagsMessage = undefined;
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
