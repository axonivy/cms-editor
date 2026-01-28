import type { CmsDataObject, CmsDataObjectValues } from '@axonivy/cms-editor-protocol';
import type { MessageData } from '@axonivy/ui-components';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useValidateAddContentObject = (
  name: string,
  namespace: string,
  values: CmsDataObjectValues,
  contentObjects: Array<CmsDataObject>
) => {
  const { t } = useTranslation();

  const nameIsTaken = useCallback(() => {
    const ns = namespace === '' || namespace.startsWith('/') ? namespace : `/${namespace}`;
    const uri = `${ns}/${name}`.toLowerCase();
    return contentObjects.some(co => co.uri.toLowerCase() === uri || co.uri.toLowerCase().includes(uri + '/'));
  }, [contentObjects, name, namespace]);

  const nameMessage = useMemo<MessageData | undefined>(() => {
    let message;
    if (name.trim() === '') {
      message = t('message.emptyName');
    } else if (name.includes('/')) {
      message = t('message.notAllowedChar', { character: '/' });
    } else if (nameIsTaken()) {
      message = t('message.nameIsTaken');
    }
    return toErrorMessage(message);
  }, [name, nameIsTaken, t]);

  const valuesMessage = useMemo<MessageData | undefined>(() => {
    if (Object.keys(values).length === 0) {
      return toErrorMessage(t('message.noValues'));
    }
    return undefined;
  }, [t, values]);

  return { nameMessage, valuesMessage };
};

const toErrorMessage = (message?: string): MessageData | undefined => (message ? { message: message, variant: 'error' } : undefined);
