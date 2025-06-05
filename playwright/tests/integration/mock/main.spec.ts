import test, { expect } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('search', async () => {
  await editor.main.search.locator.fill('hello');
  await expect(editor.main.table.rows).toHaveCount(0);
  await editor.main.search.locator.fill('sEqUeNcE');
  await expect(editor.main.table.rows).toHaveCount(3);
});

test.describe('table keyboard support', () => {
  test('move selection via arrowKey', async () => {
    await editor.main.table.expectToHaveNoSelection();
    await editor.main.table.locator.focus();
    await editor.page.keyboard.press('ArrowDown');
    await editor.page.keyboard.press('ArrowDown');
    await editor.main.table.row(1).expectToBeSelected();
  });

  test('toggle detail via enter', async () => {
    await editor.main.table.row(0).locator.click();
    await expect(editor.detail.locator).toBeVisible();
    await editor.page.keyboard.press('Enter');
    await expect(editor.detail.locator).toBeHidden();
    await editor.page.keyboard.press('Enter');
    await expect(editor.detail.locator).toBeVisible();
  });
});

test('show columns for default languages', async ({ page }) => {
  editor = await CmsEditor.openMock(page, { parameters: { lng: 'ja' } });
  await expect(editor.main.table.headers).toHaveCount(2);
  await expect(editor.main.table.header(0).content).toHaveText('URI');
  await expect(editor.main.table.header(1).content).toHaveText('英語');
  await expect(editor.main.table.row(2).column(1).value(0)).toHaveText('Case');

  editor = await CmsEditor.openMock(page, { parameters: { lng: 'en' }, defaultLanguages: ['de'] });
  await expect(editor.main.table.headers).toHaveCount(2);
  await expect(editor.main.table.header(0).content).toHaveText('URI');
  await expect(editor.main.table.header(1).content).toHaveText('German');
  await expect(editor.main.table.row(2).column(1).value(0)).toHaveText('Fall');

  editor = await CmsEditor.openMock(page, { parameters: { lng: 'de' }, defaultLanguages: ['en', 'de'] });
  await expect(editor.main.table.headers).toHaveCount(3);
  await expect(editor.main.table.header(0).content).toHaveText('URI');
  await expect(editor.main.table.header(1).content).toHaveText('Deutsch');
  await expect(editor.main.table.header(2).content).toHaveText('Englisch');
  await expect(editor.main.table.row(2).column(1).value(0)).toHaveText('Fall');
  await expect(editor.main.table.row(2).column(2).value(0)).toHaveText('Case');
});
