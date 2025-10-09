import { type Locator, type Page } from '@playwright/test';

export class TranslationWizard {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly translate: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog');
    this.trigger = parent.getByRole('button', { name: 'Translation Wizard' });
    this.translate = this.locator.getByRole('button', { name: 'Translate' });
  }
}
