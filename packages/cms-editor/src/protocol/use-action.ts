import type { CmsActionArgs } from '@axonivy/cms-editor-protocol';
import { useAppContext } from '../context/AppContext';
import { useClient } from '../protocol/ClientContextProvider';

export function useAction<TAction extends CmsActionArgs['actionId']>(actionId: TAction) {
  const { context } = useAppContext();
  const client = useClient();

  return (args: Omit<Extract<CmsActionArgs, { actionId: TAction }>, 'actionId' | 'context'>) => {
    client.action({ ...args, actionId, context } as CmsActionArgs);
  };
}
