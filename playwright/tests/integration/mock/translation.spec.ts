import test, { expect } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('keyboard support', async ({ page }) => {
  const translationWizard = editor.main.control.translationWizard;

  await expect(translationWizard.locator).toBeHidden();
  await page.keyboard.press('t');
  await expect(translationWizard.locator).toBeHidden();

  await editor.main.table.row(0).locator.click();
  await page.keyboard.press('t');
  await expect(translationWizard.locator).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(translationWizard.locator).toBeHidden();
});

test('selected content objects', async ({ page }) => {
  const translationWizard = editor.main.control.translationWizard;
  const table = editor.main.table;

  await expect(translationWizard.trigger).toBeDisabled();
  await table.row(0).locator.click();
  await expect(translationWizard.trigger).toBeEnabled();
  await translationWizard.trigger.click();
  await expect(translationWizard.selectedContentObjects.trigger).toHaveText('1 Content Object selected.');
  await translationWizard.selectedContentObjects.trigger.click();
  await expect(translationWizard.selectedContentObjects.content).toHaveText('/Dialogs/agileBPM/define_WF/AddTask');

  await translationWizard.cancel.click();
  await table.row(1).locator.click();
  await page.keyboard.down('Shift');
  await table.row(3).locator.click();
  await page.keyboard.up('Shift');
  await translationWizard.trigger.click();
  await expect(translationWizard.selectedContentObjects.trigger).toHaveText('3 Content Objects selected.');
  await translationWizard.selectedContentObjects.trigger.click();
  await expect(translationWizard.selectedContentObjects.content.locator('span')).toHaveText([
    '/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks',
    '/Dialogs/agileBPM/define_WF/Case',
    '/Dialogs/agileBPM/define_WF/CommaSeparatedListOfUsers'
  ]);
});

test.describe('source language', () => {
  test('options', async () => {
    const translationWizard = editor.main.control.translationWizard;
    const languageTool = editor.main.control.languageTool;

    await editor.main.table.row(0).locator.click();
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
    await editor.main.table.row(0).locator.click();
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
    await editor.main.table.row(0).locator.click();
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

    await editor.main.table.row(0).locator.click();
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
    await editor.main.table.row(0).locator.click();
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
