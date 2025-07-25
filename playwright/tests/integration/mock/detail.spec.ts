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

    await expect(englishValue.delete).toBeEnabled();
    await englishValue.delete.hover();
    await expect(editor.page.getByRole('tooltip')).toHaveText('Delete value');
    await expect(englishValue.textbox.locator).toHaveValue('Case');
    await englishValue.textbox.expectToHaveNoPlaceholder();
    await expect(row.column(1).value(0)).toHaveText('Case');

    await expect(germanValue.delete).toBeEnabled();
    await germanValue.delete.hover();
    await expect(editor.page.getByRole('tooltip')).toHaveText('Delete value');
    await expect(germanValue.textbox.locator).toHaveValue('Fall');
    await germanValue.textbox.expectToHaveNoPlaceholder();

    await englishValue.delete.click();

    await expect(englishValue.delete).toBeHidden();
    await expect(englishValue.textbox.locator).toHaveValue('');
    await englishValue.textbox.expectToHavePlaceholder('[no value]');
    await expect(row.column(1).value(0)).toHaveText('');

    await expect(germanValue.delete).toBeDisabled();
    await germanValue.delete.hover();
    await expect(editor.page.getByRole('tooltip')).toHaveText('The last value cannot be deleted');
    await expect(germanValue.textbox.locator).toHaveValue('Fall');
    await germanValue.textbox.expectToHaveNoPlaceholder();
  });

  test('file', async () => {
    await editor.main.table.locator.focus();
    await editor.page.keyboard.press('ArrowUp');
    await editor.page.keyboard.press('ArrowUp');

    const row = editor.main.table.row(-2);

    const englishValue = editor.detail.value('English');
    const germanValue = editor.detail.value('German');

    await expect(englishValue.fileInput).toHaveAttribute('accept', '.txt');
    await expect(germanValue.fileInput).toHaveAttribute('accept', '.txt');

    await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));

    await expect(englishValue.fileButton).toBeVisible();
    await expect(englishValue.filePicker).toContainText('TestFile.txt');
    await expect(row.column(1).value(0)).toHaveText('TextFile.txt');

    await englishValue.delete.click();

    await expect(englishValue.fileButton).toBeHidden();
    await expect(englishValue.filePicker).toContainText('Choose File');
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

  test.describe('file', () => {
    test('file picker', async () => {
      await editor.main.table.locator.focus();
      await editor.page.keyboard.press('ArrowUp');
      await editor.page.keyboard.press('ArrowUp');

      const englishValue = editor.detail.value('English');

      await expect(englishValue.filePicker).toContainText('TextFile.txt');

      await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));
      await expect(englishValue.filePicker).toContainText('TestFile.txt');
    });

    test('drag and drop', async () => {
      await editor.main.table.locator.focus();
      await editor.page.keyboard.press('ArrowUp');
      await editor.page.keyboard.press('ArrowUp');

      const englishValue = editor.detail.value('English');

      await expect(englishValue.filePicker).toContainText('TextFile.txt');

      const dataTransfer = await editor.page.evaluateHandle(() => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['content'], 'TestFile.txt'));
        return dataTransfer;
      });
      await englishValue.filePicker.dispatchEvent('drop', { dataTransfer });
      await expect(englishValue.filePicker).toContainText('TestFile.txt');
    });
  });
});

test('openFile', async () => {
  await editor.main.table.locator.focus();
  await editor.page.keyboard.press('ArrowUp');
  await editor.page.keyboard.press('ArrowUp');

  const msg0 = editor.consoleLog();
  await editor.detail.value('English').fileButton.click();
  expect(await msg0).toContain('openUrl');
  expect(await msg0).toContain('/test/cm/test$1/Files/TextFile?l=en');

  const msg1 = editor.consoleLog();
  await editor.detail.value('German').fileButton.click();
  expect(await msg1).toContain('openUrl');
  expect(await msg1).toContain('/test/cm/test$1/Files/TextFile?l=de');
});

test('deleteValueButtonState', async () => {
  await editor.main.table.row(0).locator.click();
  const englishValue = editor.detail.value('English');
  const germanValue = editor.detail.value('German');

  await expect(englishValue.delete).toBeVisible();
  await expect(englishValue.delete).toBeEnabled();
  await englishValue.delete.hover();
  await expect(editor.page.getByRole('tooltip')).toHaveText('Delete value');

  await expect(germanValue.delete).toBeVisible();
  await expect(germanValue.delete).toBeEnabled();
  await germanValue.delete.hover();
  await expect(editor.page.getByRole('tooltip')).toHaveText('Delete value');

  await englishValue.delete.click();
  await expect(englishValue.delete).toBeHidden();

  await expect(germanValue.delete).toBeVisible();
  await expect(germanValue.delete).toBeDisabled();
  await germanValue.delete.hover();
  await expect(editor.page.getByRole('tooltip')).toHaveText('The last value cannot be deleted');
});
