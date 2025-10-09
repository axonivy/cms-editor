import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class Select {
  readonly page: Page;
  readonly locator: Locator;
  readonly options: Locator;

  constructor(page: Page, parent: Locator, options?: { name?: string }) {
    this.page = page;
    if (options?.name) {
      this.locator = parent.getByRole('combobox', { name: options.name, exact: true });
    } else {
      this.locator = parent.getByRole('combobox').first();
    }
    this.options = this.page.getByRole('option');
  }

  async select(option: string) {
    await this.locator.click();
    await this.options.getByText(option, { exact: true }).click();
  }

  async expectToHaveOptions(...options: Array<string>) {
    await this.locator.click();
    await expect(this.options).toHaveCount(options.length);
    for (let i = 0; i < options.length; i++) {
      await expect(this.options.nth(i)).toHaveText(options[i]!);
    }
    await this.page.keyboard.press('Escape');
  }
}
