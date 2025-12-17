import type { Locator, Page } from '@playwright/test';

export class MainToolbar {
  readonly locator: Locator;
  readonly title: Locator;
  readonly detailToggle: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = parent.locator('.cms-editor-main-toolbar');
    this.title = this.locator.locator('.cms-editor-main-toolbar-title');
    this.detailToggle = this.locator.getByRole('button', { name: 'Details' });
  }
}
