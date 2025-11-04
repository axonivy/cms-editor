import { hotkeyText } from '@axonivy/ui-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type KnownHotkey = { hotkey: string; label: string };

export const useKnownHotkeys = () => {
  const { t } = useTranslation();
  const openHelp = useMemo<KnownHotkey>(() => {
    const hotkey = 'F1';
    return { hotkey, label: t('common.hotkey.help', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const languageManager = useMemo<KnownHotkey>(() => {
    const hotkey = 'L';
    return { hotkey, label: t('hotkey.languageManager', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const translationWizard = useMemo<KnownHotkey>(() => {
    const hotkey = 'T';
    return { hotkey, label: t('hotkey.translationWizard', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const addLanguage = useMemo<KnownHotkey>(() => {
    const hotkey = 'A';
    return { hotkey, label: t('hotkey.addLanguage', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const deleteLanguage = useMemo<KnownHotkey>(() => {
    const hotkey = 'Delete';
    return { hotkey, label: t('hotkey.deleteLanguage', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const addContentObject = useMemo<KnownHotkey>(() => {
    const hotkey = 'A';
    return { hotkey, label: t('hotkey.addContentObject', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const deleteContentObject = useMemo<KnownHotkey>(() => {
    const hotkey = 'Delete';
    return { hotkey, label: t('hotkey.deleteContentObject', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const focusToolbar = useMemo<KnownHotkey>(() => {
    const hotkey = '1';
    return { hotkey, label: t('common.hotkey.focusToolbar', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const focusMain = useMemo<KnownHotkey>(() => {
    const hotkey = '2';
    return { hotkey, label: t('common.hotkey.focusMain', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  const focusInscription = useMemo<KnownHotkey>(() => {
    const hotkey = '3';
    return { hotkey, label: t('common.hotkey.focusInscription', { hotkey: hotkeyText(hotkey) }) };
  }, [t]);

  return {
    openHelp,
    languageManager,
    translationWizard,
    addLanguage,
    deleteLanguage,
    addContentObject,
    deleteContentObject,
    focusToolbar,
    focusMain,
    focusInscription
  };
};
