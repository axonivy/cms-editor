import test, { expect } from '@playwright/test';
import path from 'path';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('empty while no selecton', async () => {
  await expect(editor.detail.values).toHaveCount(0);
  await expect(editor.detail.message).toHaveText('Select a Content Object to edit its values.');
});

test('uri', async () => {
  const uri = editor.detail.uri;
  await editor.main.table.row(0).locator.click();
  await expect(uri.locator).toBeDisabled();
  await expect(uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AddTask');
  await editor.main.table.row(1).locator.click();
  await expect(uri.locator).toBeDisabled();
  await expect(uri.locator).toHaveValue('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks');
});

test('a field for each locale', async () => {
  await editor.main.table.row(2).locator.click();
  await expect(editor.detail.values).toHaveCount(2);
  await expect(editor.detail.value('English').textbox.locator).toHaveValue('Case');
  await expect(editor.detail.value('German').textbox.locator).toHaveValue('Fall');
});

test.describe('delete value', () => {
  test('string', async () => {
    const row = editor.main.table.row(2);
    await row.locator.click();

    const englishValue = editor.detail.value('English');
    const germanValue = editor.detail.value('German');

    await englishValue.expectToHaveState({
      isDeleteButtonEnabled: true,
      deleteButtonTooltip: 'Delete value',
      value: 'Case',
      placeholder: ''
    });
    await germanValue.expectToHaveState({
      isDeleteButtonEnabled: true,
      deleteButtonTooltip: 'Delete value',
      value: 'Fall',
      placeholder: ''
    });
    await expect(row.column(1).value(0)).toHaveText('Case');

    await englishValue.delete.click();
    await englishValue.expectToHaveState({
      isDeleteButtonEnabled: false,
      deleteButtonTooltip: 'Delete value',
      value: '',
      placeholder: '[no value]'
    });
    await germanValue.expectToHaveState({
      isDeleteButtonEnabled: false,
      deleteButtonTooltip: 'The last value cannot be deleted',
      value: 'Fall',
      placeholder: ''
    });
    await expect(row.column(1).value(0)).toHaveText('');
  });

  test('file', async () => {
    await editor.main.table.locator.focus();
    await editor.page.keyboard.press('ArrowUp');

    const row = editor.main.table.row(-1);

    const englishValue = editor.detail.value('English');
    const germanValue = editor.detail.value('German');

    await expect(englishValue.filePicker).toHaveAttribute('accept', '.txt');
    await expect(germanValue.filePicker).toHaveAttribute('accept', '.txt');

    await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));

    await englishValue.expectToHaveState({
      value: 'TestContent\n',
      placeholder: '',
      filePickerValue: 'TestFile.txt'
    });
    await expect(row.column(1).value(0)).toHaveText('TestContent');

    await englishValue.delete.click();
    await englishValue.expectToHaveState({
      value: '',
      placeholder: '[no value]',
      filePickerValue: ''
    });
    await expect(row.column(1).value(0)).toHaveText('');
  });
});

test.describe('update value', () => {
  test('string', async () => {
    const row = editor.main.table.row(2);
    await row.locator.click();

    const englishValue = editor.detail.value('English');

    await expect(englishValue.textbox.locator).toHaveValue('Case');
    await expect(row.column(1).value(0)).toHaveText('Case');

    await englishValue.textbox.locator.fill('New Value');
    await expect(englishValue.textbox.locator).toHaveValue('New Value');
    await expect(row.column(1).value(0)).toHaveText('New Value');
  });

  test('file', async () => {
    await editor.main.table.locator.focus();
    await editor.page.keyboard.press('ArrowUp');

    const row = editor.main.table.row(-1);

    const englishValue = editor.detail.value('English');

    await expect(englishValue.textbox.locator).toHaveValue('Content');
    await expect(row.column(1).value(0)).toHaveText('Content');

    await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));
    await expect(englishValue.textbox.locator).toHaveValue('TestContent\n');
    await expect(row.column(1).value(0)).toHaveText('TestContent');
  });
});
