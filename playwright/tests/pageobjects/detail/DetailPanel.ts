import { expect, type Locator, type Page } from '@playwright/test';
import { Textbox } from '../abstract/Textbox';
import { CmsValueField } from '../components/CmsValueField';
import { DetailToolbar } from './DetailToolbar';

export class DetailPanel {
  readonly page: Page;
  readonly locator: Locator;
  readonly toolbar: DetailToolbar;
  readonly uri: Textbox;
  readonly values: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator = this.page.locator('.cms-editor-detail-panel');
    this.toolbar = new DetailToolbar(this.locator);
    this.uri = new Textbox(this.locator, { name: 'Path' });
    this.values = this.locator.locator('.cms-editor-value-field');
    this.message = this.locator.locator('p');
  }

  value(label: string) {
    return new CmsValueField(this.page, this.locator, { label });
  }

  async expectToHaveStringValues(uri: string, values: Record<string, string>) {
    await expect(this.uri.locator).toHaveValue(uri);
    for (const [language, value] of Object.entries(values)) {
      await expect(this.value(language).textbox.locator).toHaveValue(value);
    }
  }

  async expectToHaveFileValues(uri: string, values: Record<string, boolean>) {
    await expect(this.uri.locator).toHaveValue(uri);
    for (const [language, value] of Object.entries(values)) {
      await expect(this.value(language).filePicker).toBeVisible();
      const button = this.value(language).fileButton;
      if (value) {
        await expect(button).toBeVisible();
      } else {
        await expect(button).toBeHidden();
      }
    }
  }
}
