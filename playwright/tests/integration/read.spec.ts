import { expect, test } from '@playwright/test';
import { CmsEditor } from '../pageobjects/CmsEditor';

test('load data', async ({ page }) => {
  const editor = await CmsEditor.openCms(page);
  await expect(editor.main.table.rows).toHaveCount(3);

  await editor.main.table.row(0).locator.click();
  await editor.main.table.row(0).expectToHaveFileColumns('FILE', ['/files/File'], ['File.txt']);
  await editor.detail.expectToHaveFileValues('/files/File', { English: true, German: false });

  await editor.main.table.row(1).locator.click();
  await editor.main.table.row(1).expectToHaveStringColumns(['/folder/stringOne'], ['valueOne']);
  await editor.detail.expectToHaveStringValues('/folder/stringOne', { English: 'valueOne', German: 'wertEins' });

  await editor.main.table.row(2).locator.click();
  await editor.main.table.row(2).expectToHaveStringColumns(['/folder/stringTwo'], ['valueTwo']);
  await editor.detail.expectToHaveStringValues('/folder/stringTwo', { English: 'valueTwo', German: '' });
});
