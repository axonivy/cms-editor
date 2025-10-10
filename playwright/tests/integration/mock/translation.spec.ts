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

test.describe('source language', () => {
  test('options', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const languageTool = editor.main.control.languageTool;

    await translationWizard.trigger.click();
    await translationWizard.sourceLanguage.expectToHaveOptions('English', 'German');

    await translationWizard.cancel.click();
    await languageTool.trigger.click();
    await languageTool.addLanguage(1);
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();
    await translationWizard.sourceLanguage.expectToHaveOptions('English', 'French', 'German');
  });

  test('default value', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await languageTool.checkboxOfRow(1).check();
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();
    await expect(translationWizard.sourceLanguage.locator).toHaveText('English');

    await translationWizard.cancel.click();
    await languageTool.trigger.click();
    await languageTool.checkboxOfRow(0).uncheck();
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();
    await expect(translationWizard.sourceLanguage.locator).toHaveText('German');

    await translationWizard.cancel.click();
    await languageTool.trigger.click();
    await languageTool.checkboxOfRow(1).uncheck();
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();
    await expect(translationWizard.sourceLanguage.locator).toHaveText('English');
  });
});
