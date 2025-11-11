import { test } from '@playwright/test';
import { CmsEditor } from '../pageobjects/CmsEditor';

test.describe('CmsEditor', () => {
  let editor: CmsEditor;

  test.beforeEach(async ({ page }) => {
    editor = await CmsEditor.openMock(page);
  });

  test('screenshots', async ({ page }) => {
    await editor.main.table.row(0).locator.click();
    await editor.takeScreenshot('cms-editor.png');
    await editor.main.table.header(0).locator.click();

    await editor.main.control.languageTools.trigger.click();
    await editor.main.control.languageTools.languageManager.trigger.click();
    await editor.main.control.languageTools.languageManager.locator.locator('h2').click();
    await editor.takeScreenshot('cms-editor-language-manager.png');
    await editor.main.control.languageTools.languageManager.cancel.click();

    await editor.main.table.row(0).locator.click();
    await page.keyboard.down('Shift');
    await editor.main.table.row(2).locator.click();
    await page.keyboard.up('Shift');
    await editor.main.control.languageTools.trigger.click();
    await editor.main.control.languageTools.translationWizard.trigger.click();
    await editor.takeScreenshot('cms-editor-translation-wizard.png');
  });
});
