import { expect, test } from '@playwright/test';
import { CmsEditor } from '../../pageobjects/CmsEditor';

test('translation', async ({ page }) => {
  let editor = await CmsEditor.openMock(page);
  await expect(editor.main.label).toHaveText('Content Objects');
  await expect(editor.main.table.header(1).content).toHaveText('English');
  await expect(editor.detail.message).toHaveText('Select a Content Object to edit its values.');
  await editor.main.table.row(0).locator.click();
  await expect(editor.detail.value('German').locator).toBeVisible();

  editor = await CmsEditor.openMock(page, { parameters: { lng: 'de' } });
  await expect(editor.main.label).toHaveText('Inhaltsobjekte');
  await expect(editor.main.table.header(1).content).toHaveText('Englisch');
  await expect(editor.detail.message).toHaveText('Wähle ein Inhaltsobjekt aus um es zu bearbeiten.');
  await editor.main.table.row(0).locator.click();
  await expect(editor.detail.value('Deutsch').locator).toBeVisible();
});
