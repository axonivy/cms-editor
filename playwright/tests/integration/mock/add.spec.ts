import test, { expect } from '@playwright/test';
import path from 'path';
import { CmsEditor } from '../../pageobjects/CmsEditor';

let editor: CmsEditor;

test.beforeEach(async ({ page }) => {
  editor = await CmsEditor.openMock(page);
});

test.describe('add', () => {
  test('string', async () => {
    await editor.main.control.add.addString('TestContentObject', '/A/TestNamespace', { English: 'TestValue' });
    await editor.main.table.row(0).expectToBeSelected();
    await editor.main.table.row(0).expectToHaveStringColumns(['/A/TestNamespace/TestContentObject'], ['TestValue']);
    await editor.detail.expectToHaveStringValues('/A/TestNamespace/TestContentObject', { English: 'TestValue', German: '' });

    await editor.main.control.add.addString('TestContentObject', '/Z/TestNamespace', { English: 'TestValue' });
    await editor.main.table.locator.locator('../..').evaluate((el: HTMLElement) => (el.scrollTop = el.scrollHeight));
    await editor.main.table.row(-1).expectToBeSelected();
    await editor.main.table.row(-1).expectToHaveStringColumns(['/Z/TestNamespace/TestContentObject'], ['TestValue']);
    await editor.detail.expectToHaveStringValues('/Z/TestNamespace/TestContentObject', { English: 'TestValue', German: '' });
  });

  test('file', async () => {
    await editor.main.control.add.addFile('TestContentObject', '/A/TestNamespace', { English: path.join('test-files', 'TestFile.txt') });
    await editor.main.table.row(0).expectToBeSelected();
    await editor.main.table.row(0).expectToHaveFileColumns('FILE', ['/A/TestNamespace/TestContentObject'], ['TestContentObject.txt']);
    await editor.detail.expectToHaveFileValues('/A/TestNamespace/TestContentObject', { English: true, German: false });
  });
});

test('disable if no languages are present in the CMS', async () => {
  const add = editor.main.control.add;
  const languageTool = editor.main.control.languageTool;

  await expect(add.trigger).toBeEnabled();

  await languageTool.trigger.click();
  await languageTool.languages.row(0).locator.click();
  await languageTool.delete.click();
  await languageTool.delete.click();
  await languageTool.save.trigger.click();
  await languageTool.save.save.click();
  await expect(add.trigger).toBeDisabled();

  await languageTool.trigger.click();
  await languageTool.add.trigger.click();
  await languageTool.add.languages.row(0).locator.click();
  await languageTool.add.add.click();
  await languageTool.save.trigger.click();
  await expect(add.trigger).toBeEnabled();
});

test('default values', async () => {
  const add = editor.main.control.add;

  await editor.main.table.row(0).locator.click();
  await add.trigger.click();
  await expect(add.name.locator).toHaveValue('NewContentObject');
  await expect(add.namespace.locator).toHaveValue('/Dialogs/agileBPM/define_WF');
  await add.namespace.expectToHaveOptions(
    '/Dialogs/agileBPM/define_WF',
    '/Dialogs/agileBPM/task_Form',
    '/Dialogs/general',
    '/Dialogs/procurementRequest',
    '/Dialogs/signal',
    '/Dialogs/trigger',
    '/Files'
  );
  await expect(add.type.locator).toHaveText('String');
  await expect(add.value('English').textbox.locator).toHaveValue('');
  await add.value('English').textbox.expectToHaveNoPlaceholder();
});

test('type', async () => {
  const add = editor.main.control.add;
  const englishValue = add.value('English');

  await add.trigger.click();
  await expect(add.fileFormatInfo.locator).toBeHidden();
  await expect(englishValue.textbox.locator).toBeVisible();
  await expect(englishValue.filePicker).toBeHidden();

  await add.type.select('File');
  await expect(add.fileFormatInfo.locator).toBeVisible();
  await expect(englishValue.textbox.locator).toBeHidden();
  await expect(englishValue.filePicker).toBeVisible();

  await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));
  await expect(englishValue.fileButton).toBeHidden();

  await add.type.select('String');
  await expect(add.fileFormatInfo.locator).toBeHidden();
  await expect(englishValue.textbox.locator).toBeVisible();
  await expect(englishValue.textbox.locator).toHaveValue('');
  await expect(englishValue.filePicker).toBeHidden();
});

test('file extension', async ({ page }) => {
  editor = await CmsEditor.openMock(page, { defaultLanguages: ['de', 'en'] });
  const add = editor.main.control.add;

  await add.trigger.click();
  await add.type.select('File');
  await expect(add.value('English').fileInput).not.toHaveAttribute('accept');
  await expect(add.value('German').fileInput).not.toHaveAttribute('accept');

  await add.value('English').selectFile(path.join('test-files', 'TestFile.txt'));
  await expect(add.value('English').fileInput).toHaveAttribute('accept', '.txt');
  await expect(add.value('German').fileInput).toHaveAttribute('accept', '.txt');

  await add.value('German').selectFile(path.join('test-files', 'TestFile.txt'));
  await add.value('English').delete.click();
  await expect(add.value('English').fileInput).toHaveAttribute('accept', '.txt');
  await expect(add.value('German').fileInput).toHaveAttribute('accept', '.txt');

  await add.value('German').delete.click();
  await expect(add.value('English').fileInput).not.toHaveAttribute('accept');
  await expect(add.value('German').fileInput).not.toHaveAttribute('accept');
});

test('show fields for values of default languages', async ({ page }) => {
  editor = await CmsEditor.openMock(page, { parameters: { lng: 'en' }, defaultLanguages: [] });
  await editor.page.keyboard.press('a');
  await expect(editor.main.control.add.value('English').locator).toBeVisible();
  await (
    await editor.main.control.add.value('English').textbox.message()
  ).expectToBeInfo('No languages are checked to be displayed in the Language Tool. This is the first language found.');

  editor = await CmsEditor.openMock(page, { parameters: { lng: 'en' }, defaultLanguages: ['de'] });
  await editor.page.keyboard.press('a');
  await expect(editor.main.control.add.value('German').locator).toBeVisible();
  await expect((await editor.main.control.add.value('German').textbox.message()).locator).toBeHidden();

  editor = await CmsEditor.openMock(page, { parameters: { lng: 'de' }, defaultLanguages: ['en', 'de'] });
  await editor.page.keyboard.press('a');
  await expect(editor.main.control.add.value('Englisch').locator).toBeVisible();
  await expect(editor.main.control.add.value('Deutsch').locator).toBeVisible();
});

test('keyboard support', async () => {
  const add = editor.main.control.add;
  const keyboard = editor.page.keyboard;

  await expect(add.locator).toBeHidden();
  await keyboard.press('a');
  await expect(add.locator).toBeVisible();
  await keyboard.press('Escape');
  await expect(add.locator).toBeHidden();

  await add.trigger.click();
  await expect(add.locator).toBeVisible();
  await expect(add.name.locator).toHaveValue('NewContentObject');
  await add.namespace.locator.fill('/A');
  await keyboard.press('ControlOrMeta+Enter');
  await expect(add.name.locator).toHaveValue('');
  await add.name.locator.fill('TestContentObject');
  await keyboard.press('Enter');
  await expect(add.locator).toBeHidden();
  await expect(editor.main.table.row(0).column(0).value(0)).toHaveText('/A/NewContentObject');
  await expect(editor.main.table.row(1).column(0).value(0)).toHaveText('/A/TestContentObject');
});

test.describe('disable dialog while create request is pending', () => {
  test('string', async () => {
    const add = editor.main.control.add;

    await add.trigger.click();
    await add.name.locator.fill('IsPending');
    await add.create.click();
    await expect(add.name.locator).toBeDisabled();
    await expect(add.namespace.locator).toBeDisabled();
    await expect(add.type.locator).toBeDisabled();
    await expect(add.value('English').delete).toBeDisabled();
    await expect(add.value('English').textbox.locator).toBeDisabled();
    await expect(add.create).toBeDisabled();

    // Not escapable until finished mutation (no longer pending)
    await editor.page.keyboard.press('Escape');
    await expect(add.locator).toBeVisible();
    await expect(add.locator).toBeHidden();
  });

  test('file', async () => {
    const add = editor.main.control.add;

    await add.trigger.click();
    await add.name.locator.fill('IsPending');
    await add.type.select('File');
    await add.value('English').selectFile(path.join('test-files', 'TestFile.txt'));
    await add.create.click();
    await expect(add.value('English').filePicker).toHaveAttribute('aria-disabled', 'true');
    await expect(add.value('English').fileInput).toBeDisabled();
  });
});

test('show error if create request is error', async () => {
  const add = editor.main.control.add;
  await expect(add.error.locator).toBeHidden();
  await add.trigger.click();
  await add.name.locator.fill('IsError');
  await add.create.click();
  await expect(add.locator).toBeVisible();
  await add.error.expectToBeError('An error has occurred: Error: error message');
});

test.describe('validation', () => {
  test('string', async ({ page }) => {
    editor = await CmsEditor.openMock(page, { defaultLanguages: ['en', 'de'] });
    const add = editor.main.control.add;
    await add.trigger.click();
    const nameMessage = await add.name.message();
    const namespaceMessage = await add.namespace.message();

    await namespaceMessage.expectToBeInfo("Folder structure of Content Object (e.g. '/Dialog/Label').");
    await expect(add.create).toBeEnabled();

    await add.name.locator.clear();
    await nameMessage.expectToBeError('Name cannot be empty.');
    await expect(add.create).toBeDisabled();
    await editor.page.keyboard.press('Enter');
    await expect(add.locator).toBeVisible();

    await add.name.locator.fill('name');
    const englishValue = add.value('English');
    const englishValueMessage = await englishValue.textbox.message();
    const germanValue = add.value('German');
    const germanValueMessage = await germanValue.textbox.message();
    await expect(englishValueMessage.locator).toBeHidden();
    await expect(germanValueMessage.locator).toBeHidden();

    await englishValue.delete.click();
    await expect(englishValueMessage.locator).toBeHidden();
    await expect(germanValueMessage.locator).toBeHidden();

    await germanValue.delete.click();
    await englishValueMessage.expectToBeError('At least one value must be present.');
    await germanValueMessage.expectToBeError('At least one value must be present.');

    await expect(add.create).toBeDisabled();
    await editor.page.keyboard.press('Enter');
    await expect(add.locator).toBeVisible();

    await germanValue.textbox.locator.fill('value');
    await expect(englishValueMessage.locator).toBeHidden();
    await expect(germanValueMessage.locator).toBeHidden();
    await expect(add.create).toBeEnabled();
  });

  test('file picker border', async () => {
    const borderWithHexToRgb = (border: string) =>
      border.replace(/#([0-9a-f]{6})/gi, (_, hex) => {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgb(${r}, ${g}, ${b})`;
      });
    const border = async (name: string) => borderWithHexToRgb(await editor.page.evaluate(([name]) => getComputedStyle(document.body).getPropertyValue(name!), [name]));

    const add = editor.main.control.add;
    const englishValue = add.value('English');

    await add.trigger.click();
    await add.type.select('File');
    await expect(englishValue.filePicker).toHaveCSS('border', await border('--error-border'));

    await englishValue.selectFile(path.join('test-files', 'TestFile.txt'));
    await expect(englishValue.filePicker).toHaveCSS('border', await border('--dashed-border'));
  });
});

test('namespace not starting with /', async () => {
  await editor.main.control.add.addString('TestContentObject', 'A/TestNamespace', { English: 'TestValue' });
  await editor.main.table.row(0).expectToHaveStringColumns(['/A/TestNamespace/TestContentObject'], ['TestValue']);
  await editor.detail.expectToHaveStringValues('/A/TestNamespace/TestContentObject', { English: 'TestValue', German: '' });
});
