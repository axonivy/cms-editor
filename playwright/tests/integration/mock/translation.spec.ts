import test, { expect } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('keyboard support', async () => {
  const translationWizard = editor.main.control.translationWizard;
  const keyboard = editor.page.keyboard;

  await expect(translationWizard.locator).toBeHidden();
  await keyboard.press('t');
  await expect(translationWizard.locator).toBeVisible();
  await keyboard.press('Escape');
  await expect(translationWizard.locator).toBeHidden();

  await translationWizard.trigger.click();
  await expect(translationWizard.locator).toBeVisible();
  await keyboard.press('Enter');
  await expect(translationWizard.locator).toBeHidden();
});
