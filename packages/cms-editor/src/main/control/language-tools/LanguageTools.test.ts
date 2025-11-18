import type { Capabilities } from '@axonivy/cms-editor-protocol';
import { customRenderHook } from '../../../context/test-utils/test-utils';
import { useTranslationWizardDisabledWithReason } from './LanguageTools';

test('useTranslationWizardDisabledWithReason', () => {
  let result = renderTranslationWizardDisabledWithReasonHook([], { translationServiceEnabled: false }).result;
  expect(result.current).toEqual({ disabled: true, reason: 'The Translation Service is not configured on the Axon Ivy Engine.' });

  result = renderTranslationWizardDisabledWithReasonHook([], { translationServiceEnabled: true }).result;
  expect(result.current).toEqual({
    disabled: true,
    reason: 'To use the Translation Wizard, select at least one language to be displayed in the Language Manager.'
  });

  result = renderTranslationWizardDisabledWithReasonHook(['en'], { translationServiceEnabled: true }).result;
  expect(result.current).toEqual({ disabled: false });
});

const renderTranslationWizardDisabledWithReasonHook = (defaultLanguageTags: Array<string>, capabilities: Capabilities) => {
  return customRenderHook(() => useTranslationWizardDisabledWithReason(), {
    wrapperProps: { appContext: { defaultLanguageTags, capabilities } }
  });
};
