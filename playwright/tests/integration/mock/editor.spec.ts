import { expect, test } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('title', async ({ page }) => {
  await expect(page).toHaveTitle('CMS Editor Mock');
});

test('toggle detail', async () => {
  await expect(editor.detail.locator).toBeVisible();
  await editor.main.toolbar.detailToggle.click();
  await expect(editor.detail.locator).toBeHidden();
  await editor.main.toolbar.detailToggle.click();
  await expect(editor.detail.locator).toBeVisible();
});

test.describe('theme', () => {
  test('settings', async () => {
    await editor.main.toolbar.settings.button.click();
    await editor.expectToBeLight();
    await editor.main.toolbar.settings.theme.click();
    await editor.expectToBeDark();
    await editor.main.toolbar.settings.theme.click();
    await editor.expectToBeLight();
  });

  test('url-param', async () => {
    await editor.expectToBeLight();
    editor = await CmsEditor.openCms(editor.page, { theme: 'dark' });
    await editor.expectToBeDark();
  });
});

test('readonly', async () => {
  await expect(editor.main.control.locator).toBeVisible();
  editor = await CmsEditor.openCms(editor.page, { readonly: true });
  await expect(editor.main.control.locator).toBeHidden();
  await editor.main.table.row(0).locator.click();
  await expect(editor.detail.value('English').filePicker).toHaveAttribute('aria-disabled', 'true');
});

test('toolbar titles', async () => {
  await expect(editor.main.toolbar.title).toHaveText('CMS - pmv-name');
  await expect(editor.detail.toolbar.locator).toHaveText('CMS - pmv-name');
  await editor.main.table.row(0).locator.click();
  await expect(editor.main.toolbar.title).toHaveText('CMS - pmv-name');
  await expect(editor.detail.toolbar.locator).toHaveText('CMS - pmv-name - AddTask');
});

test('focus jumps', async () => {
  await expect(editor.main.toolbar.locator).not.toBeFocused();
  await editor.page.keyboard.press('1');
  await expect(editor.main.toolbar.locator).toBeFocused();
  await editor.page.keyboard.press('2');
  await expect(editor.main.locator.locator('.cms-editor-main-table-field')).toBeFocused();
  await editor.page.keyboard.press('3');
  await expect(editor.detail.toolbar.locator).toBeFocused();
});

test('help', async () => {
  const msg0 = editor.consoleLog();
  await editor.detail.toolbar.help.click();
  expect(await msg0).toContain('openUrl');
  expect(await msg0).toContain('https://dev.axonivy.com');

  const msg1 = editor.consoleLog();
  await editor.page.keyboard.press('F1');
  expect(await msg1).toContain('openUrl');
  expect(await msg1).toContain('https://dev.axonivy.com');
});
