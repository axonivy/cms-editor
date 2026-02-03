import type { CmsDataObjectValues, CmsDeleteValueArgs } from '@axonivy/cms-editor-protocol';
import { BasicField, BasicInput, Flex, PanelMessage, Spinner } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileValueField } from '../components/FileValueField';
import { StringValueField } from '../components/StringValueField';
import { useAppContext } from '../context/AppContext';
import { useUpdateValues } from '../hooks/use-update-values';
import { useClient } from '../protocol/ClientContextProvider';
import { useMeta } from '../protocol/use-meta';
import { useQueryKeys } from '../query/query-client';
import { isCmsReadFileDataObject, isCmsStringDataObject, removeValue } from '../utils/cms-utils';
import { toLanguages, UNDEFINED_LANGUAGE_TAG } from '../utils/language-utils';
import './DetailContent.css';

export const DetailContent = () => {
  const { t } = useTranslation();
  const { context, contentObjects, selectedContentObjects, defaultLanguageTags, languageDisplayName } = useAppContext();

  const client = useClient();
  const { readKey } = useQueryKeys();
  const { updateStringValuesMutation, updateFileValuesMutation, updateValuesInReadQuery, updateValuesInDataQuery } = useUpdateValues();

  let uri = '';
  if (selectedContentObjects.length === 1 && selectedContentObjects[0] !== undefined && selectedContentObjects[0] < contentObjects.length) {
    uri = contentObjects[selectedContentObjects[0]]?.uri ?? '';
  }

  const deleteMutation = useMutation({
    mutationFn: async (args: CmsDeleteValueArgs) => {
      const deleteValueUpdater = (values: CmsDataObjectValues) => removeValue(values, args.deleteRequest.languageTag);
      updateValuesInReadQuery(args.deleteRequest.uri, deleteValueUpdater);
      if (defaultLanguageTags.includes(args.deleteRequest.languageTag)) {
        updateValuesInDataQuery(args.deleteRequest.uri, deleteValueUpdater);
      }
      return client.deleteValue(args);
    }
  });

  const {
    data: contentObject,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: readKey({ context, uri }),
    queryFn: async () => await client.read({ context, uri }),
    structuralSharing: false
  });

  const locales = useMeta('meta/locales', context, []).data;

  const isFile = isCmsReadFileDataObject(contentObject);
  if (!uri || !(isCmsStringDataObject(contentObject) || isFile)) {
    return <PanelMessage message={t('message.emptyDetail')} />;
  }

  if (isPending) {
    return (
      <Flex alignItems='center' justifyContent='center' style={{ width: '100%', height: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (isError) {
    return <PanelMessage icon={IvyIcons.ErrorXMark} message={t('message.error', { error })} />;
  }

  const languages = toLanguages(locales, languageDisplayName);
  if (isFile || contentObject.values[UNDEFINED_LANGUAGE_TAG] !== undefined) {
    languages.unshift({ value: UNDEFINED_LANGUAGE_TAG, label: t('label.noLanguage') });
  }

  const hasExactlyOneValue = Object.keys(contentObject.values).length === 1;

  return (
    <Flex direction='column' gap={4} className='cms-editor-detail-content'>
      <BasicField label={t('common.label.path')}>
        <BasicInput value={contentObject.uri} disabled />
      </BasicField>
      <Flex direction='column' gap={4}>
        {languages.map(language => {
          const props = {
            deleteValue: (languageTag: string) => deleteMutation.mutate({ context, deleteRequest: { uri, languageTag } }),
            language,
            disabledDelete: hasExactlyOneValue,
            deleteTooltip: hasExactlyOneValue && contentObject.values[language.value] !== undefined ? t('value.lastValue') : undefined
          };
          return isFile ? (
            <FileValueField
              key={language.value}
              contentObject={contentObject}
              updateValue={(languageTag: string, value: string) =>
                updateFileValuesMutation.mutate({ context, updateRequests: [{ uri, values: { [languageTag]: value } }] })
              }
              allowOpenFile
              {...props}
            />
          ) : (
            <StringValueField
              key={language.value}
              contentObject={contentObject}
              updateValue={(languageTag: string, value: string) =>
                updateStringValuesMutation.mutate({ context, updateRequests: [{ uri, values: { [languageTag]: value } }] })
              }
              {...props}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};
