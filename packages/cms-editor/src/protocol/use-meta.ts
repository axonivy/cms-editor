import type { MetaRequestTypes } from '@axonivy/cms-editor-protocol';
import { useQuery } from '@tanstack/react-query';
import { genQueryKey } from '../query/query-client';
import { useClient } from './ClientContextProvider';

type NonUndefinedGuard<T> = T extends undefined ? never : T;

export const useMeta = <TMeta extends keyof MetaRequestTypes>(
  path: TMeta,
  args: MetaRequestTypes[TMeta][0],
  initialData: NonUndefinedGuard<MetaRequestTypes[TMeta][1]>
): { data: MetaRequestTypes[TMeta][1]; isFetching: boolean } => {
  const client = useClient();
  const result = useQuery({
    queryKey: genQueryKey(path, args),
    queryFn: () => client.meta(path, args),
    initialData
  });

  return {
    data: result.data as MetaRequestTypes[TMeta][1],
    isFetching: result.isFetching
  };
};
