import test, { expect } from '@playwright/test';
import { describe } from 'node:test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

describe('default languages', () => {
  test('add and remove', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['en', 'fr'] });
    const languageTool = editor.main.control.languageTool;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');

    await languageTool.trigger.click();
    await expect(languageTool.checkboxOfRow(0)).toBeChecked();
    await expect(languageTool.checkboxOfRow(1)).not.toBeChecked();

    await languageTool.checkboxOfRow(1).check();
    await languageTool.save.trigger.click();
    await expect(table.headers).toHaveCount(3);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.header(2).content).toHaveText('German');
    await table.row(0).expectToBeSelected();

    await languageTool.trigger.click();
    await languageTool.checkboxOfRow(0).uncheck();
    await languageTool.save.trigger.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('German');
    await table.row(0).expectToBeSelected();
  });

  test('local storage', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en', 'fr'] });
    const languageTool = editor.main.control.languageTool;
    const table = editor.main.table;

    await expect(table.headers).toHaveCount(3);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.header(2).content).toHaveText('German');

    await languageTool.trigger.click();
    await expect(languageTool.checkboxOfRow(0)).toBeChecked();
    await expect(languageTool.checkboxOfRow(1)).toBeChecked();

    await languageTool.add.trigger.click();
    await languageTool.add.languages.row(1).locator.click();
    await languageTool.add.add.click();
    await expect(languageTool.checkboxOfRow(0)).toBeChecked();
    await expect(languageTool.checkboxOfRow(1)).toBeChecked();
    await expect(languageTool.checkboxOfRow(2)).toBeChecked();

    await languageTool.checkboxOfRow(0).uncheck();
    await languageTool.languages.row(2).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();
    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('French');
    const defaultLanguageTags = await editor.page.evaluate(() => localStorage.getItem('cms-editor-default-language-tags'));
    expect(defaultLanguageTags).toEqual('["de","fr"]');
  });
});

test('open, edit, and save using keyboard', async () => {
  const languageTool = editor.main.control.languageTool;
  const add = editor.main.control.add;
  const keyboard = editor.page.keyboard;

  await expect(editor.main.table.header(1).content).toHaveText('English');
  await expect(languageTool.locator).toBeHidden();

  await keyboard.press('a');
  await expect(add.locator.getByText('Add Content Object')).toBeVisible();
  await add.locator.focus();

  await keyboard.press('l');
  await expect(add.locator.getByText('Add Content Object')).toBeVisible();
  await expect(languageTool.locator.getByText('Language Tool')).toBeHidden();
  await keyboard.press('Escape');

  await keyboard.press('l');
  await expect(languageTool.locator.getByText('Language Tool')).toBeVisible();

  await keyboard.press('Tab');
  await keyboard.press('ArrowDown');
  await keyboard.press('Space');
  await keyboard.press('ArrowDown');
  await keyboard.press('Space');
  await keyboard.press('Tab');
  await keyboard.press('Enter');
  await expect(languageTool.locator).toBeHidden();
  await expect(editor.main.table.header(1).content).toHaveText('German');
});

describe('languages', () => {
  test('add language', async () => {
    const languageTool = editor.main.control.languageTool;

    await editor.main.table.row(0).locator.click();
    await languageTool.trigger.click();
    await languageTool.expectToHaveLanguages('English', 'German');

    await languageTool.add.trigger.click();
    await languageTool.add.languages.row(1).locator.click();
    await languageTool.add.add.click();

    await languageTool.expectToHaveLanguages('English', 'French', 'German');
    await languageTool.save.trigger.click();

    await expect(editor.detail.value('French').locator).toBeVisible();
  });

  test('remove language', async () => {
    const languageTool = editor.main.control.languageTool;

    await editor.main.table.row(0).locator.click();
    await languageTool.trigger.click();
    await languageTool.expectToHaveLanguages('English', 'German');

    await languageTool.languages.row(0).locator.click();
    await languageTool.delete.click();
    await languageTool.expectToHaveLanguages('German');
    await languageTool.languages.row(0).expectToBeSelected();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();

    await expect(editor.main.table.headers).toHaveCount(1);
  });

  test('remove deleted content objects after removing language', async () => {
    const languageTool = editor.main.control.languageTool;

    await editor.main.table.row(0).locator.click();
    await expect(editor.main.table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AddTask');
    await expect(editor.detail.uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AddTask');

    await editor.detail.value('English').delete.click();
    await languageTool.trigger.click();
    await languageTool.languages.row(1).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();
    await editor.main.table.row(0).expectToBeSelected();
    await expect(editor.main.table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await expect(editor.detail.uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
  });

  test('keyboard support', async () => {
    const languageTool = editor.main.control.languageTool;
    const keyboard = editor.page.keyboard;

    await languageTool.trigger.click();
    await keyboard.press('a');
    await expect(languageTool.add.locator.getByText('Language Browser')).toBeVisible();
    await keyboard.press('Escape');

    await languageTool.expectToHaveLanguages('English', 'German');

    await keyboard.press('Tab');
    await keyboard.press('ArrowDown');
    await expect(languageTool.checkboxOfRow(0)).toBeChecked();
    await keyboard.press('Space');
    await expect(languageTool.checkboxOfRow(0)).not.toBeChecked();

    await keyboard.press('ArrowUp');
    await languageTool.languages.row(1).expectToBeSelected();

    await keyboard.press('Delete');
    await languageTool.expectToHaveLanguages('English');
    await languageTool.languages.row(0).expectToBeSelected();
  });

  describe('language browser', () => {
    const subRows = (languageTags: Array<string>, displayName: Intl.DisplayNames) =>
      languageTags
        .map(languageTag => [[displayName.of(languageTag) as string, languageTag]])
        .sort((row1: Array<Array<string>>, row2: Array<Array<string>>) => row1[0][0].localeCompare(row2[0][0]));

    test('options', async () => {
      const languageTool = editor.main.control.languageTool;
      await languageTool.trigger.click();

      const languageBrowser = languageTool.add;
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
      const languageTool = editor.main.control.languageTool;
      await languageTool.trigger.click();

      const languageBrowser = languageTool.add;
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
      const languageTool = editor.main.control.languageTool;
      await languageTool.trigger.click();

      const languageBrowser = languageTool.add;
      await languageBrowser.trigger.click();
      await languageBrowser.languages.row(1).locator.click();
      await languageBrowser.info.trigger.click();
      await expect(languageBrowser.info.content).toHaveText('French (fr)');
    });
  });
});

test('initialize dialog', async () => {
  const languageTool = editor.main.control.languageTool;

  await languageTool.trigger.click();
  await languageTool.checkboxOfRow(0).uncheck();
  await languageTool.checkboxOfRow(1).check();
  await languageTool.add.trigger.click();
  await languageTool.add.languages.row(1).locator.click();
  await languageTool.add.add.click();
  await languageTool.languages.row(0).locator.click();
  await languageTool.delete.click();
  await languageTool.expectToHaveLanguages('French', 'German');
  await editor.page.keyboard.press('Escape');

  await languageTool.trigger.click();
  await expect(languageTool.checkboxOfRow(0)).toBeChecked();
  await expect(languageTool.checkboxOfRow(1)).not.toBeChecked();
  await languageTool.expectToHaveLanguages('English', 'German');
  await languageTool.languages.expectToHaveNoSelection();
});

describe('save confirmation', () => {
  test('show amount of values to delete', async () => {
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await languageTool.add.trigger.click();
    await languageTool.add.languages.row(1).locator.click();
    await languageTool.add.add.click();
    await languageTool.save.trigger.click();

    await editor.main.table.row(0).locator.click();
    await editor.detail.value('French').textbox.locator.fill('valeur');

    await languageTool.trigger.click();
    await languageTool.languages.row(0).locator.click();
    await languageTool.delete.click();
    await languageTool.delete.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await expect(languageTool.save.valueAmounts.nth(0)).toHaveText('English: 101 values');
    await expect(languageTool.save.valueAmounts.nth(1)).toHaveText('German: 100 values');
    await expect(languageTool.save.valueAmounts.nth(2)).toHaveText('French: 1 value');
  });

  test('do not require confirmation when no values are deleted', async () => {
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await languageTool.add.trigger.click();
    await languageTool.add.languages.row(1).locator.click();
    await languageTool.add.add.click();
    await languageTool.save.trigger.click();

    await languageTool.trigger.click();
    await languageTool.languages.row(1).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await expect(languageTool.locator).toBeHidden();
  });

  test('cancel', async () => {
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await expect(languageTool.languages.rows).toHaveCount(2);

    await languageTool.languages.row(1).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await expect(languageTool.save.locator).toBeVisible();

    await languageTool.save.cancel.click();
    await expect(languageTool.save.locator).toBeHidden();
    await expect(languageTool.languages.rows).toHaveCount(1);

    await languageTool.add.trigger.click();
    await languageTool.add.languages.row(2).locator.click();
    await languageTool.add.add.click();
    await languageTool.save.trigger.click();
    await expect(languageTool.locator).toBeHidden();
  });

  test('works with keyboard', async () => {
    const languageTool = editor.main.control.languageTool;
    const keyboard = editor.page.keyboard;

    await keyboard.press('l');
    await expect(languageTool.languages.rows).toHaveCount(2);

    await languageTool.languages.row(1).locator.click();
    await keyboard.press('Delete');
    await keyboard.press('Tab');
    await keyboard.press('Enter');
    await expect(languageTool.save.locator).toBeVisible();
    await expect(languageTool.save.cancel).toBeFocused();

    await keyboard.press('Escape');
    await expect(languageTool.save.locator).toBeHidden();
    await expect(languageTool.languages.rows).toHaveCount(1);

    await keyboard.press('Enter');
    await expect(languageTool.save.locator).toBeVisible();

    await keyboard.press('Shift+Tab');
    await keyboard.press('Enter');
    await expect(languageTool.locator).toBeHidden();
  });
});

// In these cases the main table did not update properly at some point
describe('table updates after save', () => {
  test('removing default language and deleting language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en'] });
    const languageTool = editor.main.control.languageTool;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.detail.value('English').delete.click();

    await languageTool.trigger.click();
    await languageTool.checkboxOfRow(1).uncheck();
    await languageTool.languages.row(1).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();

    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await table.row(0).expectToBeSelected();
  });

  test('deleting language with non-visible default language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['en', 'fr'] });
    const languageTool = editor.main.control.languageTool;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.detail.value('English').delete.click();

    await languageTool.trigger.click();
    await languageTool.languages.row(1).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();

    await expect(table.headers).toHaveCount(2);
    await expect(table.header(1).content).toHaveText('English');
    await expect(table.row(0).column(0).value(0)).toHaveText('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
    await table.row(0).expectToBeSelected();
  });

  test('selection being out of bounds after deleting language', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en'] });
    const languageTool = editor.main.control.languageTool;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await editor.page.keyboard.press('ArrowUp');

    await languageTool.trigger.click();
    await languageTool.languages.row(0).locator.click();
    await languageTool.delete.click();
    await languageTool.save.trigger.click();
    await languageTool.save.save.click();

    await table.expectToHaveNoSelection();
    await expect(editor.detail.message).toBeVisible();
  });
});
