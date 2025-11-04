import { Button, Flex, Separator } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { useMeta } from '../../protocol/use-meta';
import { useKnownHotkeys } from '../../utils/hotkeys';
import { AddContentObject } from './add-content-object/AddContentObject';
import { DeleteContentObject } from './delete-content-object/DeleteContentObject';
import { LanguageTools } from './language-tools/LanguageTools';
import { LanguageManager } from './language-tools/language-manager/LanguageManager';

type MainControlProps = {
  selectRow: (rowId: string) => void;
  deleteContentObjects: () => void;
  hasSelection: boolean;
};

export const MainControl = ({ selectRow, deleteContentObjects, hasSelection }: MainControlProps) => {
  const hotkeys = useKnownHotkeys();
  const { context } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;
  return (
    <Flex gap={2} className='cms-editor-main-control'>
      <LanguageTools />
      <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />
      <AddContentObject selectRow={selectRow}>
        <Button icon={IvyIcons.Plus} aria-label={hotkeys.addContentObject.label} disabled={locales.length === 0} />
      </AddContentObject>
      <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />
      <DeleteContentObject deleteContentObjects={deleteContentObjects} hasSelection={hasSelection} />
    </Flex>
  );
};

export const EmptyMainControl = ({ selectRow }: Pick<MainControlProps, 'selectRow'>) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;
  return (
    <Flex gap={2} className='cms-editor-main-control'>
      <LanguageManager>
        <Button size='large' variant='primary' icon={IvyIcons.Language}>
          {t('dialog.languageManager.title')}
        </Button>
      </LanguageManager>
      <AddContentObject selectRow={selectRow}>
        <Button size='large' variant='primary' icon={IvyIcons.Plus} disabled={locales.length === 0}>
          {t('dialog.addContentObject.title')}
        </Button>
      </AddContentObject>
    </Flex>
  );
};
