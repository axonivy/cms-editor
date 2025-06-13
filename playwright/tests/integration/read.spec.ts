import { expect, test } from '@playwright/test';
import { CmsEditor } from '../pageobjects/CmsEditor';

test('load data', async ({ page }) => {
  const editor = await CmsEditor.openCms(page);
  await expect(editor.main.table.rows).toHaveCount(3);

  await editor.main.table.row(0).locator.click();
  await editor.main.table.row(0).expectToHaveColumns(['/files/File'], ['Content']);
  await editor.detail.expectToHaveValues('/files/File', { English: 'Content\n', German: '' });

  await editor.main.table.row(1).locator.click();
  await editor.main.table.row(1).expectToHaveColumns(['/folder/stringOne'], ['valueOne']);
  await editor.detail.expectToHaveValues('/folder/stringOne', { English: 'valueOne', German: 'wertEins' });

  await editor.main.table.row(2).locator.click();
  await editor.main.table.row(2).expectToHaveColumns(['/folder/stringTwo'], ['valueTwo']);
  await editor.detail.expectToHaveValues('/folder/stringTwo', { English: 'valueTwo', German: '' });
});
