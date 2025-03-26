import type { CmsDataArgs, CmsReadArgs } from '@axonivy/cms-editor-protocol';
import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const initQueryClient = () => {
  return new QueryClient();
};

export const useQueryKeys = () =>
  useMemo(
    () => ({
      dataKey: (args: CmsDataArgs) => genQueryKey('data', args),
      readKey: (args: CmsReadArgs) => genQueryKey('read', args)
    }),
    []
  );

export const genQueryKey = (...args: unknown[]) => {
  return ['cms-editor', ...args];
};
