import { type CmsData, type CmsDataObject, type CmsEditorDataContext } from '@axonivy/cms-editor-protocol';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useClient } from '../protocol/ClientContextProvider';
import { useQueryKeys } from '../query/query-client';
import { isCmsValueDataObject } from './cms-utils';

export const useData = (
  context: CmsEditorDataContext,
  languageTags: Array<string>,
  options?: Omit<UseQueryOptions<CmsData, Error, CmsData, Array<unknown>>, 'queryKey'>
) => {
  const client = useClient();
  const { dataKey } = useQueryKeys();
  const { data, isPending, isError, error } = useQuery<CmsData, Error, CmsData, Array<unknown>>({
    queryKey: dataKey({ context, languageTags }),
    queryFn: async () => await client.data({ context, languageTags }),
    structuralSharing: false,
    ...options
  });
  return {
    data: { ...data, data: data ? data.data.filter((contentObject: CmsDataObject) => isCmsValueDataObject(contentObject)) : [] },
    isPending,
    isError,
    error
  };
};
