import type {
  Client,
  CmsData,
  CmsDataObject,
  CmsEditorDataContext,
  CmsStringDataObject,
  CmsUpdateValuesArgs,
  CmsUpdateValuesRequest,
  Void
} from '@axonivy/cms-editor-protocol';
import { deepEqual } from '@axonivy/ui-components';
import {
  MutationCache,
  type InferDataFromTag,
  type InvalidateQueryFilters,
  type MutationOptions,
  type NoInfer,
  type QueryClient,
  type QueryKey,
  type Updater
} from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { customRenderHook } from '../context/test-utils/test-utils';
import { updatesValuesOfDefaultLanguages, updateValueOfContentObjectInData, useUpdateValues } from './use-update-values';

test('updateValuesInReadQuery', () => {
  const context = { app: 'app', pmv: 'pmv', file: 'file' };

  const queryClient = new QueryClientMock();
  const queryKey = ['cms-editor', 'read', { context, uri: 'uri' }];
  const initialData = { type: 'STRING', values: { en: 'value', de: 'wert' } };
  queryClient.queryData.set(queryKey, [initialData]);

  const { updateValuesInReadQuery } = renderUseUpdateValuesHook({ context, queryClient }).result.current;
  updateValuesInReadQuery<CmsStringDataObject>('uri', (currentValues, newValues) => ({ ...currentValues, ...newValues }), {
    de: 'neu',
    fr: 'nouveau'
  });

  expect(queryClient.queryData.get(queryKey)).toEqual([initialData, { type: 'STRING', values: { en: 'value', de: 'neu', fr: 'nouveau' } }]);
});

test('updateValuesInDataQuery', () => {
  const context = { app: 'app', pmv: 'pmv', file: 'file' };

  const queryClient = new QueryClientMock();
  const queryKey = ['cms-editor', 'data', { context, languageTags: ['en'] }];
  const initialData = {
    context,
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'valueOne', de: 'wertEins' } },
      { uri: 'uriTwo', type: 'STRING', values: { en: 'valueTwo', de: 'wertZwei' } }
    ],
    helpUrl: 'helpUrl'
  };
  queryClient.queryData.set(queryKey, [initialData]);

  const { updateValuesInDataQuery } = renderUseUpdateValuesHook({ context, defaultLanguageTags: ['en'], queryClient }).result.current;
  updateValuesInDataQuery<CmsStringDataObject>('uriTwo', (currentValues, newValues) => ({ ...currentValues, ...newValues }), {
    de: 'neu',
    fr: 'nouveau'
  });

  expect(queryClient.queryData.get(queryKey)).toEqual([
    initialData,
    {
      context,
      data: [
        { uri: 'uriOne', type: 'STRING', values: { en: 'valueOne', de: 'wertEins' } },
        { uri: 'uriTwo', type: 'STRING', values: { en: 'valueTwo', de: 'neu', fr: 'nouveau' } }
      ],
      helpUrl: 'helpUrl'
    }
  ]);
});

describe('updateStringValuesMutation', () => {
  test('does not update data query when values of default languages are not updated', async () => {
    const context = { app: 'app', pmv: 'pmv', file: 'file' };

    const client = new ClientMock();
    const queryClient = new QueryClientMock();

    const queryKeyOne = ['cms-editor', 'read', { context, uri: 'uriOne' }];
    const initialDataOne = { type: 'STRING', values: { en: 'valueOne', de: 'wertEins' } };
    queryClient.queryData.set(queryKeyOne, [initialDataOne]);

    const queryKeyTwo = ['cms-editor', 'read', { context, uri: 'uriTwo' }];
    const initialDataTwo = { type: 'STRING', values: { en: 'valueTwo', de: 'wertZwei' } };
    queryClient.queryData.set(queryKeyTwo, [initialDataTwo]);

    const queryKeyThree = ['cms-editor', 'read', { context, uri: 'uriThree' }];
    const initialDataThree = { type: 'STRING', values: { en: 'valueThree', de: 'wertDrei' } };
    queryClient.queryData.set(queryKeyThree, [initialDataThree]);

    const { updateStringValuesMutation } = renderUseUpdateValuesHook({ context, client, queryClient }).result.current;
    const args = {
      context,
      updateRequests: [
        { uri: 'uriOne', values: { en: 'newOne' } },
        { uri: 'uriThree', values: { de: 'neuDrei', fr: 'nouveauTrois' } }
      ]
    } as CmsUpdateValuesArgs;
    updateStringValuesMutation.mutate(args);

    await waitFor(() => {
      expect(queryClient.queryData.get(queryKeyOne)).toEqual([
        initialDataOne,
        { type: 'STRING', values: { en: 'newOne', de: 'wertEins' } }
      ]);
    });
    expect(queryClient.queryData.get(queryKeyTwo)).toEqual([initialDataTwo]);
    expect(queryClient.queryData.get(queryKeyThree)).toEqual([
      initialDataThree,
      { type: 'STRING', values: { en: 'valueThree', de: 'neuDrei', fr: 'nouveauTrois' } }
    ]);

    expect(client.calls.get('updateStringValues')).toEqual([args]);
  });

  test('updates data query when values of default languages are updated', async () => {
    const context = { app: 'app', pmv: 'pmv', file: 'file' };

    const client = new ClientMock();
    const queryClient = new QueryClientMock();

    const readQueryKeyOne = ['cms-editor', 'read', { context, uri: 'uriOne' }];
    const readInitialDataOne = { type: 'STRING', values: { en: 'valueOne', de: 'wertEins' } };
    queryClient.queryData.set(readQueryKeyOne, [readInitialDataOne]);

    const readQueryKeyTwo = ['cms-editor', 'read', { context, uri: 'uriTwo' }];
    const readInitialDataTwo = { type: 'STRING', values: { en: 'valueTwo', de: 'wertZwei' } };
    queryClient.queryData.set(readQueryKeyTwo, [readInitialDataTwo]);

    const readQueryKeyThree = ['cms-editor', 'read', { context, uri: 'uriThree' }];
    const readInitialDataThree = { type: 'STRING', values: { en: 'valueThree', de: 'wertDrei' } };
    queryClient.queryData.set(readQueryKeyThree, [readInitialDataThree]);

    const dataQueryKey = ['cms-editor', 'data', { context, languageTags: ['en'] }];
    const dataInitialData = {
      context,
      data: [
        { uri: 'uriOne', ...readInitialDataOne },
        { uri: 'uriTwo', ...readInitialDataTwo },
        { uri: 'uriThree', ...readInitialDataThree }
      ],
      helpUrl: 'helpUrl'
    };
    queryClient.queryData.set(dataQueryKey, [dataInitialData]);

    const { updateStringValuesMutation } = renderUseUpdateValuesHook({ context, defaultLanguageTags: ['en'], client, queryClient }).result
      .current;
    const args = {
      context,
      updateRequests: [
        { uri: 'uriOne', values: { en: 'newOne' } },
        { uri: 'uriThree', values: { de: 'neuDrei', fr: 'nouveauTrois' } }
      ]
    } as CmsUpdateValuesArgs;
    updateStringValuesMutation.mutate(args);

    const readNewDataOne = { type: 'STRING', values: { en: 'newOne', de: 'wertEins' } };
    await waitFor(() => {
      expect(queryClient.queryData.get(readQueryKeyOne)).toEqual([readInitialDataOne, readNewDataOne]);
    });
    expect(queryClient.queryData.get(readQueryKeyTwo)).toEqual([readInitialDataTwo]);
    const readNewDataThree = { type: 'STRING', values: { en: 'valueThree', de: 'neuDrei', fr: 'nouveauTrois' } };
    expect(queryClient.queryData.get(readQueryKeyThree)).toEqual([readInitialDataThree, readNewDataThree]);

    expect(queryClient.queryData.get(dataQueryKey)).toEqual([
      dataInitialData,
      {
        context,
        data: [
          { uri: 'uriOne', ...readNewDataOne },
          { uri: 'uriTwo', ...readInitialDataTwo },
          { uri: 'uriThree', ...readNewDataThree }
        ],
        helpUrl: 'helpUrl'
      }
    ]);

    expect(client.calls.get('updateStringValues')).toEqual([args]);
  });
});

describe('updateFileValuesMutation', () => {
  test('does not update data query when values of default languages are not updated', async () => {
    const context = { app: 'app', pmv: 'pmv', file: 'file' };

    const client = new ClientMock();
    const queryClient = new QueryClientMock();

    const { updateFileValuesMutation } = renderUseUpdateValuesHook({ context, client, queryClient }).result.current;
    const args = {
      context,
      updateRequests: [
        { uri: 'uriOne', values: { en: 'newOne' } },
        { uri: 'uriThree', values: { de: 'neuDrei', fr: 'nouveauTrois' } }
      ]
    } as CmsUpdateValuesArgs;
    updateFileValuesMutation.mutate(args);

    await waitFor(() => {
      expect(queryClient.invalidatedQueries).toEqual([
        ['cms-editor', 'read', { context, uri: 'uriOne' }],
        ['cms-editor', 'read', { context, uri: 'uriThree' }]
      ]);
    });

    expect(client.calls.get('updateFileValues')).toEqual([args]);
  });

  test('updates data query when values of default languages are updated', async () => {
    const context = { app: 'app', pmv: 'pmv', file: 'file' };

    const client = new ClientMock();
    const queryClient = new QueryClientMock();

    const dataQueryKey = ['cms-editor', 'data', { context, languageTags: ['en'] }];
    const dataInitialData = {
      context,
      data: [
        { uri: 'uriOne', type: 'FILE', values: { en: true, de: true } },
        { uri: 'uriTwo', type: 'FILE', values: { en: true, de: true } },
        { uri: 'uriThree', type: 'FILE', values: { en: true, de: true } }
      ],
      helpUrl: 'helpUrl'
    };
    queryClient.queryData.set(dataQueryKey, [dataInitialData]);

    const { updateFileValuesMutation } = renderUseUpdateValuesHook({ context, defaultLanguageTags: ['en'], client, queryClient }).result
      .current;
    const args = {
      context,
      updateRequests: [
        { uri: 'uriOne', values: { en: 'newOne' } },
        { uri: 'uriThree', values: { de: 'neuDrei', fr: 'nouveauTrois' } }
      ]
    } as CmsUpdateValuesArgs;
    updateFileValuesMutation.mutate(args);

    await waitFor(() => {
      expect(queryClient.invalidatedQueries).toEqual([
        ['cms-editor', 'read', { context, uri: 'uriOne' }],
        ['cms-editor', 'read', { context, uri: 'uriThree' }]
      ]);
    });

    expect(queryClient.queryData.get(dataQueryKey)).toEqual([
      dataInitialData,
      {
        context,
        data: [
          { uri: 'uriOne', type: 'FILE', values: { en: true, de: true } },
          { uri: 'uriTwo', type: 'FILE', values: { en: true, de: true } },
          { uri: 'uriThree', type: 'FILE', values: { en: true, de: true, fr: true } }
        ],
        helpUrl: 'helpUrl'
      }
    ]);

    expect(client.calls.get('updateFileValues')).toEqual([args]);
  });
});

test('updateValueOfContentObjectInData', () => {
  const data = {
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ] as Array<CmsDataObject>
  } as CmsData;
  expect(updateValueOfContentObjectInData(data, 'uriOne', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { new: 'values' } },
      { uri: 'uriTwo', type: 'FILE', values: { en: 'englishTwo', de: 'deutschZwei' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValueOfContentObjectInData(data, 'uriTwo', () => ({ new: 'values' }))).toEqual({
    data: [
      { uri: 'uriOne', type: 'STRING', values: { en: 'englishOne', de: 'deutschEins' } },
      { uri: 'uriTwo', type: 'FILE', values: { new: 'values' } },
      { uri: 'uriThree', type: 'FOLDER' }
    ]
  });
  expect(updateValueOfContentObjectInData(data, 'uriThree', () => ({ new: 'values' }))).toEqual(data);
  expect(updateValueOfContentObjectInData(data, 'uriFour', () => ({ new: 'values' }))).toEqual(data);
});

test('updatesValuesOfDefaultLanguages', () => {
  const updateRequests = [
    { uri: 'uriOne', values: { en: 'en', de: 'de' } },
    { uri: 'uriTwo', values: { fr: 'fr' } }
  ] as Array<CmsUpdateValuesRequest>;
  expect(updatesValuesOfDefaultLanguages(updateRequests, [])).toBeFalsy();
  expect(updatesValuesOfDefaultLanguages(updateRequests, ['it'])).toBeFalsy();
  expect(updatesValuesOfDefaultLanguages(updateRequests, ['de'])).toBeTruthy();
  expect(updatesValuesOfDefaultLanguages(updateRequests, ['it', 'fr'])).toBeTruthy();
});

const renderUseUpdateValuesHook = (context: {
  context: CmsEditorDataContext;
  defaultLanguageTags?: Array<string>;
  client?: Partial<Client>;
  queryClient: Partial<QueryClient>;
}) => {
  return customRenderHook(() => useUpdateValues(), {
    wrapperProps: {
      clientContext: { client: context.client },
      query: { client: context.queryClient },
      appContext: { context: context.context, defaultLanguageTags: context.defaultLanguageTags }
    }
  });
};

class QueryClientMock implements Partial<QueryClient> {
  queryData: Map<readonly unknown[], Array<unknown>> = new Map();
  invalidatedQueries: Array<readonly unknown[]> = [];

  setQueryData<
    TQueryFnData = unknown,
    TTaggedQueryKey extends QueryKey = readonly unknown[],
    TInferredQueryFnData = InferDataFromTag<TQueryFnData, TTaggedQueryKey>
  >(
    queryKey: TTaggedQueryKey,
    updater: Updater<NoInfer<TInferredQueryFnData> | undefined, NoInfer<TInferredQueryFnData> | undefined>
  ): NoInfer<TInferredQueryFnData> | undefined {
    const queryDataKey = Array.from(this.queryData.keys()).find(key => deepEqual(key, queryKey));
    const data = queryDataKey ? this.queryData.get(queryDataKey) : undefined;
    const currentData = data ? data[data.length - 1] : undefined;
    if (!currentData) {
      throw new Error(`No data for query key: ${queryKey}`);
    }
    data?.push(
      typeof updater === 'function'
        ? (updater as (input: NoInfer<TInferredQueryFnData> | undefined) => NoInfer<TInferredQueryFnData> | undefined)(
            currentData as TInferredQueryFnData
          )
        : updater
    );
    return;
  }

  invalidateQueries<TTaggedQueryKey extends QueryKey = readonly unknown[]>(
    filters?: InvalidateQueryFilters<TTaggedQueryKey>
  ): Promise<void> {
    this.invalidatedQueries.push(filters?.queryKey as readonly unknown[]);
    return Promise.resolve();
  }

  defaultMutationOptions<T extends MutationOptions<unknown, unknown, unknown, unknown>>(options?: T): T {
    return options ?? ({} as T);
  }

  getMutationCache(): MutationCache {
    return new MutationCache();
  }

  mount(): void {}

  unmount(): void {}
}

class ClientMock implements Partial<Client> {
  calls: Map<string, Array<unknown>> = new Map([
    ['updateStringValues', []],
    ['updateFileValues', []]
  ]);

  updateStringValues(args: CmsUpdateValuesArgs): Promise<Void> {
    this.calls.get('updateStringValues')?.push(args);
    return Promise.resolve({});
  }

  updateFileValues(args: CmsUpdateValuesArgs): Promise<Void> {
    this.calls.get('updateFileValues')?.push(args);
    return Promise.resolve({});
  }
}
