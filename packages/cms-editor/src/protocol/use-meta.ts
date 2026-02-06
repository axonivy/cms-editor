import type { MetaRequestTypes } from '@axonivy/cms-editor-protocol';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { genQueryKey } from '../query/query-client';
import { useClient } from './ClientContextProvider';

type NonUndefinedGuard<T> = T extends undefined ? never : T;

export const useMeta = <TMeta extends keyof MetaRequestTypes>(
  path: TMeta,
  args: MetaRequestTypes[TMeta][0],
  initialData: NonUndefinedGuard<MetaRequestTypes[TMeta][1]>
): UseQueryResult<MetaRequestTypes[TMeta][1]> => {
  const client = useClient();
  return useQuery({
    queryKey: genQueryKey(path, args),
    queryFn: () => client.meta(path, args),
    initialData
  });
};
