import type { CmsCreateArgs, CmsData, ContentObject, MapStringString } from '@axonivy/cms-editor-protocol';
import {
  BasicField,
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
  useHotkeys,
  type MessageData
} from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringValueField } from '../../components/StringValueField';
import { useAppContext } from '../../context/AppContext';
import { useClient } from '../../protocol/ClientContextProvider';
import { useMeta } from '../../protocol/use-meta';
import { genQueryKey, useQueryKeys } from '../../query/query-client';
import { removeValue } from '../../utils/cms-utils';
import { useKnownHotkeys } from '../../utils/hotkeys';
import './AddContentObject.css';
import { toLanguages } from './language-tool/language-utils';
import { useValidateAddContentObject } from './use-validate-add-content-object';

type AddContentObjectProps = {
  selectRow: (rowId: string) => void;
};

export const AddContentObject = ({ selectRow }: AddContentObjectProps) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { context, contentObjects, selectedContentObject, setSelectedContentObject, defaultLanguageTags, languageDisplayName } =
    useAppContext();

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    if (isPending) {
      return;
    }
    setOpen(open);
    if (open) {
      initializeDialog();
    }
  };

  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState('');
  const [values, setValues] = useState<MapStringString>({});

  const { languageTags, languageTagsMessage } = useLanguageTags();

  const initializeDialog = () => {
    setName('NewContentObject');
    setNamespace(initialNamespace(contentObjects, selectedContentObject));
    setValues(Object.fromEntries(languageTags.map(tag => [tag, ''])));
  };

  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey } = useQueryKeys();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (args: CmsCreateArgs) => client.create(args),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: genQueryKey('data') })
  });

  const addContentObject = (event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => {
    const uri = `${namespace}/${name}`;
    mutate(
      { context, contentObject: { uri, type: 'STRING', values } },
      {
        onSuccess: () => {
          const data: CmsData | undefined = queryClient.getQueryData(dataKey({ context, languageTags: defaultLanguageTags }));
          const selectedContentObject = data?.data
            .filter((contentObject: ContentObject) => contentObject.type !== 'FOLDER')
            .findIndex(co => co.uri === uri);
          setSelectedContentObject(selectedContentObject);
          selectRow(String(selectedContentObject));
          if (!event.ctrlKey && !event.metaKey) {
            setOpen(false);
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
    { scopes: ['global'], enabled: open, enableOnFormTags: true }
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
          {toLanguages(languageTags, languageDisplayName).map(language => (
            <StringValueField
              key={language.value}
              values={values}
              updateValue={(languageTag: string, value: string) => setValues(values => ({ ...values, [languageTag]: value }))}
              deleteValue={(languageTag: string) => setValues(values => removeValue(values, languageTag))}
              label={language.label}
              languageTag={language.value}
              disabled={isPending}
              message={valuesMessage ?? languageTagsMessage}
            />
          ))}
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

export const initialNamespace = (contentObjects: Array<ContentObject>, selectedContentObject?: number) => {
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

export const namespaceOptions = (contentObjects: Array<ContentObject>) => {
  return [...new Set(contentObjects.map(co => co.uri.substring(0, co.uri.lastIndexOf('/'))))].map(option => ({ value: option }));
};
