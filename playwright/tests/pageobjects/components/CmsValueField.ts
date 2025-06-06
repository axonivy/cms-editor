import { expect, type Locator, type Page } from '@playwright/test';
import { Textbox } from '../abstract/Textbox';

export class CmsValueField {
  readonly page: Page;
  readonly locator: Locator;
  readonly label: Locator;
  readonly delete: Locator;
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
    this.delete = this.locator.getByRole('button');
    this.textbox = new Textbox(this.locator);
  }

  async expectToHaveState(state: { isDeleteButtonEnabled: boolean; deleteButtonTooltip: string; value: string; placeholder: string }) {
    if (state.isDeleteButtonEnabled) {
      await expect(this.delete).toBeEnabled();
    } else {
      await expect(this.delete).toBeDisabled();
    }
    await this.delete.hover();
    await expect(this.page.getByRole('tooltip')).toHaveText(state.deleteButtonTooltip);
    await expect(this.textbox.locator).toHaveValue(state.value);
    if (state.placeholder) {
      await this.textbox.expectToHavePlaceholder(state.placeholder);
    } else {
      await this.textbox.expectToHaveNoPlaceholder();
    }
  }
}
