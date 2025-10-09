import { Button, Flex, Separator } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { useMeta } from '../../protocol/use-meta';
import { useKnownHotkeys } from '../../utils/hotkeys';
import { AddContentObject } from './add-content-object/AddContentObject';
import { DeleteContentObject } from './delete-content-object/DeleteContentObject';
import { LanguageTool } from './language-tool/LanguageTool';

type MainControlProps = {
  selectRow: (rowId: string) => void;
  deleteContentObject: () => void;
  hasSelection: boolean;
};

export const MainControl = ({ selectRow, deleteContentObject, hasSelection }: MainControlProps) => {
  const hotkeys = useKnownHotkeys();
  const { context } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;
  return (
    <Flex gap={2} className='cms-editor-main-control'>
      <LanguageTool>
        <Button icon={IvyIcons.Language} aria-label={hotkeys.languageTool.label} />
      </LanguageTool>
      <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />
      <AddContentObject selectRow={selectRow}>
        <Button icon={IvyIcons.Plus} aria-label={hotkeys.addContentObject.label} disabled={locales.length === 0} />
      </AddContentObject>
      <Separator decorative orientation='vertical' style={{ height: '20px', margin: 0 }} />
      <DeleteContentObject deleteContentObject={deleteContentObject} hasSelection={hasSelection} />
    </Flex>
  );
};

export const EmptyMainControl = ({ selectRow }: Pick<MainControlProps, 'selectRow'>) => {
  const { t } = useTranslation();
  const { context } = useAppContext();
  const locales = useMeta('meta/locales', context, []).data;
  return (
    <Flex gap={2} className='cms-editor-main-control'>
      <LanguageTool>
        <Button size='large' variant='primary' icon={IvyIcons.Language}>
          {t('dialog.languageTool.title')}
        </Button>
      </LanguageTool>
      <AddContentObject selectRow={selectRow}>
        <Button size='large' variant='primary' icon={IvyIcons.Plus} disabled={locales.length === 0}>
          {t('dialog.addContentObject.title')}
        </Button>
      </AddContentObject>
    </Flex>
  );
};
