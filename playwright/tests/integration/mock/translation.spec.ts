import test, { expect } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test('keyboard support', async ({ page }) => {
  const languageTools = editor.main.control.languageTools;

  await page.keyboard.press('t');
  await expect(languageTools.translationWizard.locator).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(languageTools.translationWizard.locator).toBeHidden();
});

test.describe('selected content objects', () => {
  test('display amount and uris', async ({ page }) => {
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.trigger).toHaveText('99 Content Objects selected.');
    await languageTools.translationWizard.cancel.click();

    await table.row(0).locator.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.trigger).toHaveText('1 Content Object selected.');
    await languageTools.translationWizard.selectedContentObjects.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.content).toHaveText('/Dialogs/agileBPM/define_WF/AddTask');

    await languageTools.translationWizard.cancel.click();
    await table.row(1).locator.click();
    await page.keyboard.down('Shift');
    await table.row(3).locator.click();
    await page.keyboard.up('Shift');
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.trigger).toHaveText('3 Content Objects selected.');
    await languageTools.translationWizard.selectedContentObjects.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.content.locator('span')).toHaveText([
      '/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks',
      '/Dialogs/agileBPM/define_WF/Case',
      '/Dialogs/agileBPM/define_WF/CommaSeparatedListOfUsers'
    ]);
  });

  test('ignore not translatable content objects', async ({ page }) => {
    const languageTools = editor.main.control.languageTools;
    const table = editor.main.table;

    await table.row(0).locator.click();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.up('Shift');
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.trigger).toHaveText('1 Content Object selected.');
    await languageTools.translationWizard.selectedContentObjects.expectToHaveWarning();
    await languageTools.translationWizard.selectedContentObjects.expectToHaveMessages({
      variant: 'warning',
      message: 'File Content Objects are not translatable and will be ignored.'
    });

    await languageTools.translationWizard.selectedContentObjects.trigger.click();
    const contentObjects = languageTools.translationWizard.selectedContentObjects.content.locator('span');
    await expect(contentObjects).toHaveText(['/Dialogs/trigger/selectParkingLot', '/Files/TextFile', '/Files/ImageFile']);
    await expect(contentObjects.nth(0)).not.toHaveClass('cms-editor-translation-wizard-ignored-content-object');
    await expect(contentObjects.nth(1)).toHaveClass('cms-editor-translation-wizard-ignored-content-object');
    await expect(contentObjects.nth(2)).toHaveClass('cms-editor-translation-wizard-ignored-content-object');

    await languageTools.translationWizard.targetLanguages.language('German').checkbox.check();
    await languageTools.translationWizard.translationWizardReview.trigger.click();
    await languageTools.translationWizard.translationWizardReview.table.expectToHaveRows([
      ['/Dialogs/trigger/selectParkingLot'],
      ['Select parking lot'],
      ["de: Translation of 'Select parking lot' from 'en' to 'de'"]
    ]);

    await languageTools.translationWizard.translationWizardReview.cancel.click();
    await languageTools.translationWizard.cancel.click();
    await table.row(-3).locator.click();
    await editor.detail.value('English').delete.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.selectedContentObjects.trigger).toHaveText('0 Content Objects selected.');
    await languageTools.translationWizard.selectedContentObjects.expectToHaveError();
    await languageTools.translationWizard.selectedContentObjects.expectToHaveMessages(
      {
        variant: 'error',
        message: 'No translatable Content Objects selected.'
      },
      {
        variant: 'warning',
        message: 'Some Content Objects have no value for the selected source language. These will be ignored.'
      }
    );

    await languageTools.translationWizard.targetLanguages.language('German').checkbox.check();
    await expect(languageTools.translationWizard.translationWizardReview.trigger).toBeDisabled();
    await languageTools.translationWizard.translationWizardReview.trigger.hover();
    await expect(page.getByRole('tooltip')).toHaveText('No translatable Content Objects selected.');
  });
});

test.describe('source language', () => {
  test('options', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await languageTools.translationWizard.sourceLanguage.expectToHaveOptions('English');

    await languageTools.translationWizard.cancel.click();
    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(1).check();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await languageTools.translationWizard.sourceLanguage.expectToHaveOptions('English', 'German');
  });

  test('default value', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(1).check();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.sourceLanguage.locator).toHaveText('English');

    await languageTools.translationWizard.cancel.click();
    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(0).uncheck();
    await languageTools.languageManager.save.trigger.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.sourceLanguage.locator).toHaveText('German');
  });
});

test.describe('target languages', () => {
  test('options', async () => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.addLanguage(1);
    await languageTools.languageManager.save.trigger.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.targetLanguages.languages).toHaveCount(2);
    await expect(languageTools.translationWizard.targetLanguages.language('German').locator).toBeVisible();
    await expect(languageTools.translationWizard.targetLanguages.language('French').locator).toBeVisible();
  });

  test('selected source language is hidden and deselected on selection', async () => {
    const languageTools = editor.main.control.languageTools;
    const englishCheckbox = languageTools.translationWizard.targetLanguages.language('English').checkbox;
    const germanCheckbox = languageTools.translationWizard.targetLanguages.language('German').checkbox;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.checkboxOfRow(1).check();
    await languageTools.languageManager.save.trigger.click();

    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await germanCheckbox.check();
    await languageTools.translationWizard.sourceLanguage.select('German');
    await expect(englishCheckbox).toBeVisible();
    await expect(germanCheckbox).toBeHidden();

    await languageTools.translationWizard.sourceLanguage.select('English');
    await expect(germanCheckbox).toBeVisible();
    await expect(germanCheckbox).not.toBeChecked();
    await expect(englishCheckbox).toBeHidden();
  });

  test('select all / deselect all', async () => {
    const languageTools = editor.main.control.languageTools;
    const frenchCheckbox = languageTools.translationWizard.targetLanguages.language('French').checkbox;
    const germanCheckbox = languageTools.translationWizard.targetLanguages.language('German').checkbox;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.addLanguage(1);
    await languageTools.languageManager.save.trigger.click();
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();

    await expect(frenchCheckbox).not.toBeChecked();
    await expect(germanCheckbox).not.toBeChecked();
    await expect(languageTools.translationWizard.targetLanguages.selectDeselectAll).toHaveText('Select All');

    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await expect(frenchCheckbox).toBeChecked();
    await expect(germanCheckbox).toBeChecked();
    await expect(languageTools.translationWizard.targetLanguages.selectDeselectAll).toHaveText('Deselect All');

    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await expect(frenchCheckbox).not.toBeChecked();
    await expect(germanCheckbox).not.toBeChecked();
    await expect(languageTools.translationWizard.targetLanguages.selectDeselectAll).toHaveText('Select All');

    await frenchCheckbox.check();
    await expect(languageTools.translationWizard.targetLanguages.selectDeselectAll).toHaveText('Select All');

    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await expect(frenchCheckbox).toBeChecked();
    await expect(germanCheckbox).toBeChecked();
    await expect(languageTools.translationWizard.targetLanguages.selectDeselectAll).toHaveText('Deselect All');
  });

  test('translate is disabled when no target language is selected', async ({ page }) => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await expect(languageTools.translationWizard.translationWizardReview.trigger).toBeDisabled();
    await languageTools.translationWizard.translationWizardReview.trigger.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Select at least one target language.');

    await languageTools.translationWizard.targetLanguages.language('German').checkbox.check();
    await expect(languageTools.translationWizard.translationWizardReview.trigger).toBeEnabled();
  });
});

test.describe('translation review', () => {
  test('translate', async ({ page }) => {
    const languageTools = editor.main.control.languageTools;

    await languageTools.trigger.click();
    await languageTools.languageManager.trigger.click();
    await languageTools.languageManager.addLanguage(1);
    await languageTools.languageManager.checkboxOfRow(2).check();
    await languageTools.languageManager.save.trigger.click();
    await editor.main.table.row(0).locator.click();
    page.keyboard.down('Shift');
    await editor.main.table.row(1).locator.click();
    page.keyboard.up('Shift');
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await languageTools.translationWizard.targetLanguages.language('German').checkbox.check();
    await languageTools.translationWizard.translationWizardReview.trigger.click();
    await languageTools.translationWizard.translationWizardReview.table.expectToHaveRows([
      ['/Dialogs/agileBPM/define_WF/AddTask'],
      ['Add a task to the sequence'],
      ["de: Translation of 'Add a task to the sequence' from 'en' to 'de'"]
    ]);

    await languageTools.translationWizard.translationWizardReview.cancel.click();
    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await languageTools.translationWizard.translationWizardReview.trigger.click();
    await languageTools.translationWizard.translationWizardReview.table.expectToHaveRows(
      [
        ['/Dialogs/agileBPM/define_WF/AddTask'],
        [' Add a task to the sequence'],
        ["fr: Translation of 'Add a task to the sequence' from 'en' to 'fr'"],
        ["de: Translation of 'Add a task to the sequence' from 'en' to 'de'"]
      ],
      [
        ['/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks'],
        [' Workflow Tasks'],
        ["fr: Translation of 'Workflow Tasks' from 'en' to 'fr'"],
        ["de: Translation of 'Workflow Tasks' from 'en' to 'de'"]
      ]
    );

    await languageTools.translationWizard.translationWizardReview.apply.click();
    await editor.main.table.expectToHaveRows(
      [['/Dialogs/agileBPM/define_WF/AddTask'], ['Add a task to the sequence'], ["Translation of 'Add a task to the sequence' from 'en' to 'de'"]],
      [['/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks'], ['Workflow Tasks'], ["Translation of 'Workflow Tasks' from 'en' to 'de'"]]
    );
    await editor.main.table.row(0).locator.click();
    await editor.detail.expectToHaveStringValues('/Dialogs/agileBPM/define_WF/AddTask', {
      English: 'Add a task to the sequence',
      French: "Translation of 'Add a task to the sequence' from 'en' to 'fr'",
      German: "Translation of 'Add a task to the sequence' from 'en' to 'de'"
    });
    await editor.main.table.row(1).locator.click();
    await editor.detail.expectToHaveStringValues('/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks', {
      English: 'Workflow Tasks',
      French: "Translation of 'Workflow Tasks' from 'en' to 'fr'",
      German: "Translation of 'Workflow Tasks' from 'en' to 'de'"
    });
  });

  test('show spinner and disable apply button while translation is pending', async () => {
    const languageTools = editor.main.control.languageTools;

    await editor.main.control.add.addString('TranslateIsPending', '', {});
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await languageTools.translationWizard.translationWizardReview.trigger.click();

    await expect(languageTools.translationWizard.translationWizardReview.spinner).toBeVisible();
    await expect(languageTools.translationWizard.translationWizardReview.apply).toBeDisabled();
    // wait for translation to complete
    await expect(languageTools.translationWizard.translationWizardReview.spinner).toBeHidden();
    await expect(languageTools.translationWizard.translationWizardReview.apply).toBeEnabled();
  });

  test('show error and disable apply button while translation is error', async () => {
    const languageTools = editor.main.control.languageTools;

    await editor.main.control.add.addString('TranslateIsError', '', {});
    await languageTools.trigger.click();
    await languageTools.translationWizard.trigger.click();
    await languageTools.translationWizard.targetLanguages.selectDeselectAll.click();
    await languageTools.translationWizard.translationWizardReview.trigger.click();

    await expect(languageTools.translationWizard.translationWizardReview.error).toHaveText('An error has occurred: Error: error message');
    await expect(languageTools.translationWizard.translationWizardReview.apply).toBeDisabled();
  });
});

test('translation service enabled', async ({ page }) => {
  editor = await CmsEditor.openMock(page, { parameters: { translationServiceEnabled: false } });

  const languageTools = editor.main.control.languageTools;

  await page.keyboard.press('t');
  await expect(languageTools.translationWizard.locator).toBeHidden();

  await languageTools.trigger.click();
  await expect(languageTools.translationWizard.trigger).toBeDisabled();
  await languageTools.translationWizard.trigger.locator('..').hover();
  await expect(page.getByRole('tooltip')).toHaveText('The Translation Service is not configured on the Axon Ivy Engine.');
});
