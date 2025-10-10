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

test.describe('target languages', () => {
  test('options', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await languageTool.addLanguage(1);
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();
    await expect(translationWizard.targetLanguages.languages).toHaveCount(3);
    await expect(translationWizard.targetLanguages.language('English').locator).toBeVisible();
    await expect(translationWizard.targetLanguages.language('German').locator).toBeVisible();
    await expect(translationWizard.targetLanguages.language('French').locator).toBeVisible();
  });

  test('selected source language is disabled and deselected on selection', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const englishCheckbox = translationWizard.targetLanguages.language('English').checkbox;
    const germanCheckbox = translationWizard.targetLanguages.language('German').checkbox;

    await translationWizard.trigger.click();

    await expect(englishCheckbox).toBeDisabled();
    await expect(germanCheckbox).toBeEnabled();

    await germanCheckbox.check();
    await translationWizard.sourceLanguage.select('German');
    await expect(englishCheckbox).toBeEnabled();
    await expect(germanCheckbox).toBeDisabled();
    await expect(germanCheckbox).not.toBeChecked();

    await translationWizard.sourceLanguage.select('English');
    await expect(englishCheckbox).toBeDisabled();
    await expect(germanCheckbox).toBeEnabled();
    await expect(germanCheckbox).not.toBeChecked();
  });

  test('select all / deselect all', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const englishCheckbox = translationWizard.targetLanguages.language('English').checkbox;
    const frenchCheckbox = translationWizard.targetLanguages.language('French').checkbox;
    const germanCheckbox = translationWizard.targetLanguages.language('German').checkbox;
    const languageTool = editor.main.control.languageTool;

    await languageTool.trigger.click();
    await languageTool.addLanguage(1);
    await languageTool.save.trigger.click();
    await translationWizard.trigger.click();

    await expect(englishCheckbox).not.toBeChecked();
    await expect(frenchCheckbox).not.toBeChecked();
    await expect(germanCheckbox).not.toBeChecked();

    await translationWizard.targetLanguages.selectAll.click();
    await expect(englishCheckbox).not.toBeChecked();
    await expect(frenchCheckbox).toBeChecked();
    await expect(germanCheckbox).toBeChecked();

    await translationWizard.targetLanguages.deselectAll.click();
    await expect(englishCheckbox).not.toBeChecked();
    await expect(frenchCheckbox).not.toBeChecked();
    await expect(germanCheckbox).not.toBeChecked();
  });
});
