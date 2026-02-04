import test, { expect } from '@playwright/test';

import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test.describe('delete', () => {
  test('single', async () => {
    const deleteButton = editor.main.control.delete;
    await expect(deleteButton).toBeDisabled();

    const firstRow = editor.main.table.row(0);
    await firstRow.locator.click();
    await expect(deleteButton).toBeEnabled();

    await firstRow.expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/AddTask'], ['Add a task to the sequence']);
    await editor.detail.expectToHaveStringValues('/Dialogs/agileBPM/define_WF/AddTask', { English: 'Add a task to the sequence' });
    await deleteButton.click();
    await firstRow.expectToBeSelected();
    await firstRow.expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks'], ['Workflow Tasks']);
    await editor.detail.expectToHaveStringValues('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks', { English: 'Workflow Tasks' });

    await firstRow.locator.click();
    await editor.page.keyboard.press('ArrowUp');
    const lastRow = editor.main.table.row(-1);
    await lastRow.expectToHaveFileColumns('FILE', ['/NoLanguage/File'], ['File.txt']);
    await editor.detail.expectToHaveFileValues('/NoLanguage/File', { 'No Language': true, English: true, German: true });
    await deleteButton.click();
    await lastRow.expectToBeSelected();
    await lastRow.expectToHaveStringColumns(['/NoLanguage/String'], ['value']);
    await editor.detail.expectToHaveStringValues('/NoLanguage/String', { 'No Language': 'noLanguageValue', English: 'value', German: 'Wert' });
  });

  test('multiple', async () => {
    await editor.main.table.row(0).locator.click();
    await editor.page.keyboard.down('Shift');
    await editor.main.table.row(2).locator.click();
    await editor.page.keyboard.up('Shift');
    await editor.main.control.delete.click();
    await editor.main.table.row(0).expectToBeSelected();
    await editor.main.table.row(1).expectNotToBeSelected();
    await editor.main.table.row(0).expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/CommaSeparatedListOfUsers'], ['Comma separated list of users:']);
  });
});

test('keyboard', async () => {
  const row = editor.main.table.row(1);
  await row.expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks'], ['Workflow Tasks']);
  await editor.page.keyboard.press('Delete');
  await row.expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks'], ['Workflow Tasks']);
  await row.locator.click();
  await editor.page.keyboard.press('Delete');
  await row.expectToHaveStringColumns(['/Dialogs/agileBPM/define_WF/Case'], ['Case']);
});
