import test, { expect } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
  await expect(editor.main.table.locator).toBeVisible();
});

test.describe('default languages', () => {
  test('add and remove', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['en', 'fr'] });
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await expect(languageTools.languageManager.checkboxOfRow(0)).toBeChecked();
    await expect(languageTools.languageManager.checkboxOfRow(1)).not.toBeChecked();

    await languageTools.languageManager.checkboxOfRow(1).check();
    await languageTools.languageManager.save.trigger.click();
    await expect(table.headers).toHaveCount(3);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.header(2).content).toHaveText('German');
    await table.row(0).expectToBeSelected();

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(0).uncheck();
    await languageTools.languageManager.save.trigger.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('German');
    await table.row(0).expectToBeSelected();
  });

  test('local storage', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en', 'fr'] });
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await expect(table.headers).toHaveCount(3);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.header(2).content).toHaveText('German');

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await expect(languageTools.languageManager.checkboxOfRow(0)).toBeChecked();
    await expect(languageTools.languageManager.checkboxOfRow(1)).toBeChecked();

    await languageTools.languageManager.add.trigger.click();
    await languageTools.languageManager.add.languages.row(1).locator.click();
    await languageTools.languageManager.add.add.click();
    await expect(languageTools.languageManager.checkboxOfRow(0)).toBeChecked();
    await expect(languageTools.languageManager.checkboxOfRow(1)).toBeChecked();
    await expect(languageTools.languageManager.checkboxOfRow(2)).toBeChecked();

    await languageTools.languageManager.checkboxOfRow(0).uncheck();
    await languageTools.languageManager.languages.row(2).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('French');
    const defaultLanguageTags = await editor.page.evaluate(() => localStorage.getItem('cms-editor-default-language-tags'));
    expect(defaultLanguageTags).toEqual('["de","fr"]');
  });
});

test('open, edit, and save using keyboard', async () => {
  const languageTools = editor.main.control.languageTools;
  const add = editor.main.control.add;
  const keyboard = editor.page.keyboard;

  await expect(editor.main.table.header(1).content).toHaveText('English');
  await expect(languageTools.languageManager.locator).toBeHidden();

  await keyboard.press('a');
  await expect(add.locator.getByText('Add Content Object')).toBeVisible();
  await add.locator.focus();

  await keyboard.press('l');
  await expect(add.locator.getByText('Add Content Object')).toBeVisible();
  await expect(languageTools.languageManager.locator.getByText('Language Manager')).toBeHidden();
  await keyboard.press('Escape');

  await keyboard.press('l');
  await expect(languageTools.languageManager.locator.getByText('Language Manager')).toBeVisible();

  await keyboard.press('Tab');
  await keyboard.press('ArrowDown');
  await keyboard.press('Space');
  await keyboard.press('ArrowDown');
  await keyboard.press('Space');
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  await keyboard.press('Enter');
  await expect(languageTools.languageManager.locator).toBeHidden();
  await expect(editor.main.table.header(1).content).toHaveText('German');
});

test.describe('languages', () => {
  test('add language', async () => {
    const languageTools = editor.main.control.languageTools;

    await editor.main.table.row(0).locator.click();
    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.expectToHaveLanguages('English', 'German');

    await languageTools.languageManager.add.trigger.click();
    await languageTools.languageManager.add.languages.row(1).locator.click();
    await languageTools.languageManager.add.add.click();

    await languageTools.languageManager.expectToHaveLanguages('English', 'French', 'German');
    await languageTools.languageManager.save.trigger.click();

    await expect(editor.detail.value('French').locator).toBeVisible();
  });

  test('remove language', async () => {
    const languageTools = editor.main.control.languageTools;

    await editor.main.table.row(0).locator.click();
    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.expectToHaveLanguages('English', 'German');

    await languageTools.languageManager.languages.row(0).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.expectToHaveLanguages('German');
    await languageTools.languageManager.languages.row(0).expectToBeSelected();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();

    await expect(editor.main.table.headers).toHaveCount(1);
  });

  test('remove deleted content objects after removing language', async () => {
    const languageTools = editor.main.control.languageTools;

    await editor.main.table.row(0).locator.click();
    await expect(editor.main.table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AddTask');
    await expect(editor.detail.uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AddTask');

    await editor.detail.value('English').delete.click();
    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.languages.row(1).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();
    await editor.main.table.row(0).expectToBeSelected();
    await expect(editor.main.table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await expect(editor.detail.uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
  });

  test('keyboard support', async () => {
    const languageTools = editor.main.control.languageTools;
    const keyboard = editor.page.keyboard;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await keyboard.press('a');
    await expect(languageTools.languageManager.add.locator.getByText('Language Browser')).toBeVisible();
    await keyboard.press('Escape');

    await languageTools.languageManager.expectToHaveLanguages('English', 'German');

    await keyboard.press('Tab');
    await keyboard.press('ArrowDown');
    await expect(languageTools.languageManager.checkboxOfRow(0)).toBeChecked();
    await keyboard.press('Space');
    await expect(languageTools.languageManager.checkboxOfRow(0)).not.toBeChecked();

    await keyboard.press('ArrowUp');
    await languageTools.languageManager.languages.row(1).expectToBeSelected();

    await keyboard.press('Delete');
    await languageTools.languageManager.expectToHaveLanguages('English');
    await languageTools.languageManager.languages.row(0).expectToBeSelected();
  });

  test.describe('language browser', () => {
    const subRows = (languageTags: Array<string>, displayName: Intl.DisplayNames) =>
      languageTags
        .map(languageTag => [[displayName.of(languageTag) as string, languageTag]])
        .sort((row1: Array<Array<string>>, row2: Array<Array<string>>) => row1[0]![0]!.localeCompare(row2[0]![0]!));

    test('options', async () => {
      const languageTools = editor.main.control.languageTools;
      await languageTools.trigger.click();
      await languageTools.languageManager.trigger.click();

      const languageBrowser = languageTools.languageManager.add;
      await languageBrowser.trigger.click();
      await languageBrowser.languages.row(2).expandCollapseButton.click();
      await languageBrowser.languages.row(0).expandCollapseButton.click();

      const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
      await languageBrowser.languages.expectToHaveRows(
        [[displayName.of('en') as string, 'en']],
        ...subRows(['en-US', 'en-GB'], displayName),
        [[displayName.of('fr') as string, 'fr']],
        [[displayName.of('de') as string, 'de']],
        ...subRows(['de-AT', 'de-DE', 'de-CH'], displayName)
      );

      await languageBrowser.languages.expectRowsToBeSelectable(false, true, true, true, false, true, true, true);
    });

    test('initialize browser', async () => {
      const languageTools = editor.main.control.languageTools;
      await languageTools.trigger.click();
      await languageTools.languageManager.trigger.click();

      const languageBrowser = languageTools.languageManager.add;
      await languageBrowser.trigger.click();
      await expect(languageBrowser.search.locator).toBeEmpty();
      await languageBrowser.languages.expectToHaveNoSelection();
      await languageBrowser.languages.expectToHaveNoExpansion();

      await languageBrowser.search.locator.fill('e');
      await languageBrowser.languages.row(1).locator.click();
      await languageBrowser.languages.row(0).expandCollapseButton.click();
      await editor.page.keyboard.press('Escape');
      await languageBrowser.trigger.click();
      await expect(languageBrowser.search.locator).toBeEmpty();
      await languageBrowser.languages.expectToHaveNoSelection();
      await languageBrowser.languages.expectToHaveNoExpansion();
    });

    test('info', async () => {
      const languageTools = editor.main.control.languageTools;
      await languageTools.trigger.click();
      await languageTools.languageManager.trigger.click();

      const languageBrowser = languageTools.languageManager.add;
      await languageBrowser.trigger.click();
      await languageBrowser.languages.row(1).locator.click();
      await languageBrowser.info.trigger.click();
      await expect(languageBrowser.info.content).toHaveText('French (fr)');
    });
  });
});

test('initialize dialog', async () => {
  const languageTools = editor.main.control.languageTools;

  await languageTools.trigger.click();
  await languageTools.languageManager.trigger.click();
  await languageTools.languageManager.checkboxOfRow(0).uncheck();
  await languageTools.languageManager.checkboxOfRow(1).check();
  await languageTools.languageManager.add.trigger.click();
  await languageTools.languageManager.add.languages.row(1).locator.click();
  await languageTools.languageManager.add.add.click();
  await languageTools.languageManager.languages.row(0).locator.click();
  await languageTools.languageManager.delete.click();
  await languageTools.languageManager.expectToHaveLanguages('French', 'German');
  await editor.page.keyboard.press('Escape');

  await languageTools.trigger.click();
  await languageTools.languageManager.trigger.click();
  await expect(languageTools.languageManager.checkboxOfRow(0)).toBeChecked();
  await expect(languageTools.languageManager.checkboxOfRow(1)).not.toBeChecked();
  await languageTools.languageManager.expectToHaveLanguages('English', 'German');
  await languageTools.languageManager.languages.expectToHaveNoSelection();
});

test.describe('save confirmation', () => {
  test('show amount of values to delete', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.add.trigger.click();
    await languageTools.languageManager.add.languages.row(1).locator.click();
    await languageTools.languageManager.add.add.click();
    await languageTools.languageManager.save.trigger.click();

    await editor.main.table.row(0).locator.click();
    await editor.detail.value('French').textbox.locator.fill('valeur');

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.languages.row(0).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await expect(languageTools.languageManager.save.valueAmounts.nth(0)).toHaveText('English: 101 values');
    await expect(languageTools.languageManager.save.valueAmounts.nth(1)).toHaveText('German: 100 values');
    await expect(languageTools.languageManager.save.valueAmounts.nth(2)).toHaveText('French: 1 value');
  });

  test('do require confirmation even when no values are deleted', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.add.trigger.click();
    await languageTools.languageManager.add.languages.row(1).locator.click();
    await languageTools.languageManager.add.add.click();
    await languageTools.languageManager.save.trigger.click();

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.languages.row(1).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await expect(languageTools.languageManager.save.locator).toBeVisible();
  });

  test('cancel', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await expect(languageTools.languageManager.languages.rows).toHaveCount(2);

    await languageTools.languageManager.languages.row(1).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await expect(languageTools.languageManager.save.locator).toBeVisible();

    await languageTools.languageManager.save.cancel.click();
    await expect(languageTools.languageManager.save.locator).toBeHidden();
    await expect(languageTools.languageManager.languages.rows).toHaveCount(1);

    await languageTools.languageManager.add.trigger.click();
    await languageTools.languageManager.add.languages.row(2).locator.click();
    await languageTools.languageManager.add.add.click();
    await languageTools.languageManager.save.trigger.click();
    await expect(languageTools.languageManager.locator).toBeHidden();
  });

  test('works with keyboard', async () => {
    const languageTools = editor.main.control.languageTools;
    const keyboard = editor.page.keyboard;

    await keyboard.press('l');
    await expect(languageTools.languageManager.languages.rows).toHaveCount(2);

    await languageTools.languageManager.languages.row(1).locator.click();
    await keyboard.press('Delete');
    await keyboard.press('Tab');
    await keyboard.press('Tab');
    await keyboard.press('Enter');
    await expect(languageTools.languageManager.save.locator).toBeVisible();
    await expect(languageTools.languageManager.save.cancel).toBeFocused();

    await keyboard.press('Escape');
    await expect(languageTools.languageManager.save.locator).toBeHidden();
    await expect(languageTools.languageManager.languages.rows).toHaveCount(1);

    await keyboard.press('Enter');
    await expect(languageTools.languageManager.save.locator).toBeVisible();

    await keyboard.press('Tab');
    await keyboard.press('Enter');
    await expect(languageTools.languageManager.locator).toBeHidden();
  });
});

// In these cases the main table did not update properly at some point
test.describe('table updates after save', () => {
  test('removing default language and deleting language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en'] });
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.detail.value('English').delete.click();

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(1).uncheck();
    await languageTools.languageManager.languages.row(1).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();

    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await table.row(0).expectToBeSelected();
  });

  test('deleting language with non-visible default language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['en', 'fr'] });
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.detail.value('English').delete.click();

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.languages.row(1).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();

    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await table.row(0).expectToBeSelected();
  });

  test('selection being out of bounds after deleting language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en'] });
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.page.keyboard.press('ArrowUp');

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.languages.row(0).locator.click();
    await languageTools.languageManager.delete.click();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.languageManager.save.save.click();

    await table.expectToHaveNoSelection();
    await expect(editor.detail.message).toBeVisible();
  });
});
