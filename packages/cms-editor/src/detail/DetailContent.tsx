import type {
  CmsData,
  CmsDataFileDataObject,
  CmsDataObject,
  CmsDataObjectValues,
  CmsDeleteValueArgs,
  CmsStringDataObject,
  CmsUpdateValuesArgs,
  CmsUpdateValuesRequest,
  MapStringBoolean,
  MapStringString
} from '@axonivy/cms-editor-protocol';
import { BasicField, BasicInput, Flex, PanelMessage, Spinner } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileValueField } from '../components/FileValueField';
import { StringValueField } from '../components/StringValueField';
import { useAppContext } from '../context/AppContext';
import { useClient } from '../protocol/ClientContextProvider';
import { useMeta } from '../protocol/use-meta';
import { useQueryKeys } from '../query/query-client';
import {
  isCmsReadFileDataObject,
  isCmsStringDataObject,
  isCmsValueDataObject,
  removeValue,
  type CmsValueDataObject
} from '../utils/cms-utils';
import { toLanguages } from '../utils/language-utils';
import './DetailContent.css';

export const DetailContent = () => {
  const { t } = useTranslation();
  const { context, contentObjects, selectedContentObjects, defaultLanguageTags, languageDisplayName } = useAppContext();

  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey, readKey } = useQueryKeys();

  let uri = '';
  if (selectedContentObjects.length === 1 && selectedContentObjects[0] !== undefined && selectedContentObjects[0] < contentObjects.length) {
    uri = contentObjects[selectedContentObjects[0]]?.uri ?? '';
  }

  const updateValuesInReadQuery = useCallback(
    <T extends CmsValueDataObject>(
      uri: string,
      valueUpdater: (currentValues: T['values'], newValues?: MapStringString) => T['values'],
      newValues?: MapStringString
    ) =>
      queryClient.setQueryData<CmsDataObject>(readKey({ context, uri }), data => {
        if (!data || !isCmsValueDataObject(data)) {
          return;
        }
        return { ...data, values: valueUpdater(data.values, newValues) };
      }),
    [context, queryClient, readKey]
  );

  const updateContentObjectsInReadQuery = useCallback(
    <T extends CmsValueDataObject>(
      updateRequests: Array<CmsUpdateValuesRequest>,
      valueUpdater: (currentValues: T['values'], newValues?: MapStringString) => T['values']
    ) => updateRequests.forEach(updateRequest => updateValuesInReadQuery(updateRequest.uri, valueUpdater, updateRequest.values)),
    [updateValuesInReadQuery]
  );

  const updateValuesInDataQuery = useCallback(
    <T extends CmsValueDataObject>(
      uri: string,
      valueUpdater: (currentValues: T['values'], newValues?: MapStringString) => T['values'],
      newValues?: MapStringString
    ) =>
      queryClient.setQueryData<CmsData>(dataKey({ context, languageTags: defaultLanguageTags }), data => {
        if (!data) {
          return;
        }
        return updateValueOfContentObjectInData(data, uri, valueUpdater, newValues);
      }),
    [context, dataKey, defaultLanguageTags, queryClient]
  );

  const updateContentObjectsInDataQuery = useCallback(
    <T extends CmsValueDataObject>(
      updateRequests: Array<CmsUpdateValuesRequest>,
      valueUpdater: (currentValues: T['values'], newValues?: MapStringString) => T['values']
    ) => updateRequests.forEach(updateRequest => updateValuesInDataQuery(updateRequest.uri, valueUpdater, updateRequest.values)),
    [updateValuesInDataQuery]
  );

  const updateStringValuesMutation = useMutation({
    mutationFn: async (args: CmsUpdateValuesArgs) => {
      const changeValuesUpdater = (currentValues: MapStringString, newValues?: MapStringString) => ({ ...currentValues, ...newValues });
      updateContentObjectsInReadQuery<CmsStringDataObject>(args.updateRequests, changeValuesUpdater);
      if (
        args.updateRequests
          .flatMap(updateRequest => Object.keys(updateRequest.values))
          .some(languageTag => defaultLanguageTags.includes(languageTag))
      ) {
        updateContentObjectsInDataQuery<CmsStringDataObject>(args.updateRequests, changeValuesUpdater);
      }
      return client.updateStringValues(args);
    }
  });

  const updateFileValuesMutation = useMutation({
    mutationFn: async (args: CmsUpdateValuesArgs) => {
      if (
        args.updateRequests
          .flatMap(updateRequest => Object.keys(updateRequest.values))
          .some(languageTag => defaultLanguageTags.includes(languageTag))
      ) {
        const changeValuesUpdater = (currentValues: MapStringBoolean, newValues?: MapStringString) => ({
          ...currentValues,
          ...Object.fromEntries(Object.keys(newValues ?? {}).map(key => [key, true]))
        });
        updateContentObjectsInDataQuery<CmsDataFileDataObject>(args.updateRequests, changeValuesUpdater);
      }
      return client.updateFileValues(args);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: readKey({ context, uri }) })
  });

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

  if (!uri || !(isCmsStringDataObject(contentObject) || isCmsReadFileDataObject(contentObject))) {
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

  const hasExactlyOneValue = Object.keys(contentObject.values).length === 1;

  return (
    <Flex direction='column' gap={4} className='cms-editor-detail-content'>
      <BasicField label={t('common.label.path')}>
        <BasicInput value={contentObject.uri} disabled />
      </BasicField>
      <Flex direction='column' gap={4}>
        {toLanguages(locales, languageDisplayName).map(language => {
          const props = {
            deleteValue: (languageTag: string) => deleteMutation.mutate({ context, deleteRequest: { uri, languageTag } }),
            language,
            disabledDelete: hasExactlyOneValue,
            deleteTooltip: hasExactlyOneValue && contentObject.values[language.value] !== undefined ? t('value.lastValue') : undefined
          };
          return isCmsReadFileDataObject(contentObject) ? (
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

export const updateValueOfContentObjectInData = <T extends CmsValueDataObject>(
  data: CmsData,
  uri: string,
  valueUpdater: (currentValues: T['values'], newValues?: MapStringString) => T['values'],
  newValues?: MapStringString
) => {
  const index = data.data.findIndex(co => co.uri === uri);
  if (index === -1) {
    return;
  }
  const co = data.data[index];
  if (!isCmsValueDataObject(co)) {
    return;
  }
  const newCo = { ...co, values: valueUpdater(co.values, newValues) };
  const newData = [...data.data];
  newData[index] = newCo;
  return { ...data, data: newData };
};
