import { expect, test } from '@playwright/test';
import path from 'path';
import { CmsEditor } from '../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openNewCms(page);
});

test.afterEach(() => {
  editor.deletePmv();
});

test('save data', async () => {
  await editor.main.control.languageManager.trigger.click();
  await editor.main.control.languageManager.addLanguage(0);
  await editor.main.control.languageManager.addLanguage(2);
  await editor.main.control.languageManager.addLanguage(3);
  await editor.main.control.languageManager.save.trigger.click();

  await editor.main.control.add.addString('TestContentObject', '/TestNamespace', { Afrikaans: 'AfrikaansValue' });

  await editor.main.table.row(0).locator.click();
  await editor.detail.expectToHaveStringValues('/TestNamespace/TestContentObject', { Afrikaans: 'AfrikaansValue', Akan: '', Albanian: '' });
  await editor.detail.value('Akan').textbox.expectToHavePlaceholder('[no value]');
  await editor.detail.value('Albanian').textbox.expectToHavePlaceholder('[no value]');

  await editor.detail.value('Albanian').textbox.locator.fill('AlbanianValue');
  await editor.detail.value('Akan').textbox.locator.fill('AkanValue');
  await editor.detail.value('Afrikaans').delete.click();

  await editor.main.table.row(0).locator.click();
  await editor.detail.expectToHaveStringValues('/TestNamespace/TestContentObject', { Afrikaans: '', Akan: 'AkanValue', Albanian: 'AlbanianValue' });
  await editor.detail.value('Afrikaans').textbox.expectToHavePlaceholder('[no value]');

  await editor.main.control.add.addString('TestEmptyNamespaceContentObject', '', { Afrikaans: 'AfrikaansValueWithEmptyNamespace' });
  await editor.detail.expectToHaveStringValues('/TestEmptyNamespaceContentObject', { Afrikaans: 'AfrikaansValueWithEmptyNamespace', Akan: '', Albanian: '' });
  await editor.main.control.delete.click();

  await editor.main.control.languageManager.trigger.click();
  await editor.main.control.languageManager.languages.row(0).locator.click();
  await editor.main.control.languageManager.delete.click();
  await editor.main.control.languageManager.delete.click();
  await editor.main.control.languageManager.save.trigger.click();
  await expect(editor.main.control.languageManager.save.valueAmounts).toHaveText('Akan: 1 value');
  await editor.main.control.languageManager.save.save.click();

  await editor.main.control.languageManager.trigger.click();
  await expect(editor.main.control.languageManager.languages.rows).toHaveCount(1);
  await expect(editor.main.control.languageManager.languages.row(0).locator).toHaveText('Albanian');
  await editor.main.control.languageManager.save.trigger.click();

  await editor.main.table.row(0).locator.click();
  await editor.main.control.delete.click();

  await expect(editor.main.table.rows).toHaveCount(0);
});

test('add file', async () => {
  await editor.main.control.languageManager.trigger.click();
  await editor.main.control.languageManager.addLanguage(0);
  await editor.main.control.languageManager.save.trigger.click();

  await editor.main.control.add.addFile('TestFile', '/TestNamespace', { Afrikaans: path.join('test-files', 'TestFile.txt') });
  await editor.page.reload();

  await editor.main.table.row(0).locator.click();
  await editor.detail.expectToHaveFileValues('/TestNamespace/TestFile', { Afrikaans: true });
  await expect(editor.detail.value('Afrikaans').filePicker).toBeVisible();
  await expect(editor.detail.value('Afrikaans').fileInput).toHaveAttribute('accept', '.txt');
});
