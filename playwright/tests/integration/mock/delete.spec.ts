import test, { expect } from '@playwright/test';

import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('delete', async () => {
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
  await lastRow.expectToHaveFileColumns('IMAGE', ['/Files/ImageFile'], ['ImageFile.png']);
  await editor.detail.expectToHaveFileValues('/Files/ImageFile', { English: true, German: false });
  await deleteButton.click();
  await lastRow.expectToBeSelected();
  await lastRow.expectToHaveFileColumns('FILE', ['/Files/TextFile'], ['TextFile.txt']);
  await editor.detail.expectToHaveFileValues('/Files/TextFile', { English: true, German: true });
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
