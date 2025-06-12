import { type Locator, type Page } from '@playwright/test';
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

  async selectFile(file: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.filePicker.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }
}
