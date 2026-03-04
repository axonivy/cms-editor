import type { Locator, Page } from '@playwright/test';

export class MainToolbar {
  readonly locator: Locator;
  readonly detailToggle: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = parent.locator('.ui-toolbar');
    this.detailToggle = this.locator.getByRole('button', { name: 'Details' });
  }
}
