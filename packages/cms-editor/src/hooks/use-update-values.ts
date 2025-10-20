import type {
  CmsData,
  CmsDataFileDataObject,
  CmsDataObject,
  CmsStringDataObject,
  CmsUpdateValuesArgs,
  CmsUpdateValuesRequest,
  CmsValueDataObject,
  MapStringBoolean,
  MapStringString
} from '@axonivy/cms-editor-protocol';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useClient } from '../protocol/ClientContextProvider';
import { useQueryKeys } from '../query/query-client';
import { isCmsValueDataObject } from '../utils/cms-utils';

export const useUpdateValues = () => {
  const { context, defaultLanguageTags } = useAppContext();
  const client = useClient();
  const queryClient = useQueryClient();
  const { dataKey, readKey } = useQueryKeys();

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
      if (updatesValuesOfDefaultLanguages(args.updateRequests, defaultLanguageTags)) {
        updateContentObjectsInDataQuery<CmsStringDataObject>(args.updateRequests, changeValuesUpdater);
      }
      return client.updateStringValues(args);
    }
  });

  const updateFileValuesMutation = useMutation({
    mutationFn: async (args: CmsUpdateValuesArgs) => {
      if (updatesValuesOfDefaultLanguages(args.updateRequests, defaultLanguageTags)) {
        const changeValuesUpdater = (currentValues: MapStringBoolean, newValues?: MapStringString) => ({
          ...currentValues,
          ...Object.fromEntries(Object.keys(newValues ?? {}).map(key => [key, true]))
        });
        updateContentObjectsInDataQuery<CmsDataFileDataObject>(args.updateRequests, changeValuesUpdater);
      }
      return client.updateFileValues(args);
    },
    onSuccess: (_, args) =>
      args.updateRequests.forEach(updateRequest =>
        queryClient.invalidateQueries({ queryKey: readKey({ context, uri: updateRequest.uri }) })
      )
  });

  return {
    updateValuesInReadQuery,
    updateValuesInDataQuery,
    updateStringValuesMutation,
    updateFileValuesMutation
  };
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

export const updatesValuesOfDefaultLanguages = (updateRequests: Array<CmsUpdateValuesRequest>, defaultLanguageTags: Array<string>) =>
  updateRequests.flatMap(updateRequest => Object.keys(updateRequest.values)).some(languageTag => defaultLanguageTags.includes(languageTag));
