import { expect, type Locator, type Page } from '@playwright/test';
import { Textbox } from '../abstract/Textbox';

export class CmsValueField {
  readonly page: Page;
  readonly locator: Locator;
  readonly label: Locator;
  readonly delete: Locator;
  readonly filePicker: Locator;
  readonly textbox: Textbox;

  constructor(page: Page, parent: Locator, options?: { label?: string; nth?: number }) {
    this.page = page;
    if (options?.label) {
      this.locator = parent
        .locator('.cms-editor-value-field')
        .filter({ has: this.page.locator('label').filter({ hasText: options.label }) });
    } else {
      this.locator = parent.locator('.cms-editor-value-field').nth(options?.nth ?? 0);
    }
    this.label = this.locator.locator('label');
    this.delete = this.locator.getByRole('button', { name: 'Delete value' });
    this.filePicker = this.locator.locator('input[type=file]');
    this.textbox = new Textbox(this.locator);
  }

  async expectToHaveState(state: {
    isDeleteButtonEnabled?: boolean;
    deleteButtonTooltip?: string;
    value?: string;
    placeholder?: string;
    filePickerValue?: string;
  }) {
    if (state.isDeleteButtonEnabled !== undefined) {
      if (state.isDeleteButtonEnabled) {
        await expect(this.delete).toBeEnabled();
      } else {
        await expect(this.delete).toBeDisabled();
      }
    }
    if (state.deleteButtonTooltip !== undefined) {
      await this.delete.hover();
      await expect(this.page.getByRole('tooltip')).toHaveText(state.deleteButtonTooltip);
    }
    if (state.value !== undefined) {
      await expect(this.textbox.locator).toHaveValue(state.value);
    }
    if (state.placeholder !== undefined) {
      if (state.placeholder) {
        await this.textbox.expectToHavePlaceholder(state.placeholder);
      } else {
        await this.textbox.expectToHaveNoPlaceholder();
      }
    }
    if (state.filePickerValue !== undefined) {
      if (state.filePickerValue) {
        const fileName = await this.filePicker.evaluate((input: HTMLInputElement) => input.files?.[0]?.name);
        expect(fileName).toBe(state.filePickerValue);
      } else {
        const fileCount = await this.filePicker.evaluate((input: HTMLInputElement) => input.files?.length);
        expect(fileCount).toEqual(0);
      }
    }
  }

  async selectFile(file: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.filePicker.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }
}
