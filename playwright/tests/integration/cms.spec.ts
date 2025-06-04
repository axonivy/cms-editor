import { expect, test } from '@playwright/test';
import { CmsEditor } from '../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openNewCms(page);
});

test.afterEach(() => {
  editor.deletePmv();
});

test('load data', async ({ page }) => {
  const editor = await CmsEditor.openCms(page);
  await expect(editor.main.table.rows).toHaveCount(2);

  await editor.main.table.row(0).locator.click();
  await editor.main.table.row(0).expectToHaveColumns(['/folder/stringOne'], ['valueOne']);
  await editor.detail.expectToHaveValues('/folder/stringOne', { English: 'valueOne', German: 'wertEins' });

  await editor.main.table.row(1).locator.click();
  await editor.main.table.row(1).expectToHaveColumns(['/folder/stringTwo'], ['valueTwo']);
  await editor.detail.expectToHaveValues('/folder/stringTwo', { English: 'valueTwo', German: '' });
});

test('save data', async () => {
  await editor.main.control.languageTool.trigger.click();
  await editor.main.control.languageTool.addLanguage(0);
  await editor.main.control.languageTool.addLanguage(2);
  await editor.main.control.languageTool.addLanguage(3);
  await editor.main.control.languageTool.save.trigger.click();

  await editor.main.control.add.add('TestContentObject', '/TestNamespace', { Afrikaans: 'AfrikaansValue' });
  await editor.page.reload();

  await editor.main.table.row(0).locator.click();
  await editor.detail.expectToHaveValues('/TestNamespace/TestContentObject', { Afrikaans: 'AfrikaansValue', Akan: '', Albanian: '' });
  await editor.detail.value('Akan').textbox.expectToHavePlaceholder('[no value]');
  await editor.detail.value('Albanian').textbox.expectToHavePlaceholder('[no value]');

  await editor.detail.value('Albanian').textbox.locator.fill('AlbanianValue');
  await editor.detail.value('Akan').textbox.locator.fill('AkanValue');
  await editor.detail.value('Afrikaans').delete.click();
  await editor.page.reload();

  await editor.main.table.row(0).locator.click();
  await editor.detail.expectToHaveValues('/TestNamespace/TestContentObject', { Afrikaans: '', Akan: 'AkanValue', Albanian: 'AlbanianValue' });
  await editor.detail.value('Afrikaans').textbox.expectToHavePlaceholder('[no value]');

  await editor.main.control.languageTool.trigger.click();
  await editor.main.control.languageTool.languages.row(0).locator.click();
  await editor.main.control.languageTool.delete.click();
  await editor.main.control.languageTool.delete.click();
  await editor.main.control.languageTool.save.trigger.click();
  await expect(editor.main.control.languageTool.save.valueAmounts).toHaveText('Akan: 1 value');
  await editor.main.control.languageTool.save.save.click();
  await editor.page.reload();

  await editor.main.control.languageTool.trigger.click();
  await expect(editor.main.control.languageTool.languages.rows).toHaveCount(1);
  await expect(editor.main.control.languageTool.languages.row(0).locator).toHaveText('Albanian');
  await editor.main.control.languageTool.save.trigger.click();

  await editor.main.table.row(0).locator.click();
  await editor.main.control.delete.click();
  await editor.page.reload();

  await expect(editor.main.table.rows).toHaveCount(0);
});
