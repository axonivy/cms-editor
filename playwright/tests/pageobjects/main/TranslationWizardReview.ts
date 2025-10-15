import type { Locator, Page } from '@playwright/test';

export class TranslationWizardReview {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly cancel: Locator;
  readonly apply: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog', { name: 'Translation Review' });
    this.trigger = parent.getByRole('button', { name: 'Translate' });
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.apply = this.locator.getByRole('button', { name: 'Apply' });
  }
}
