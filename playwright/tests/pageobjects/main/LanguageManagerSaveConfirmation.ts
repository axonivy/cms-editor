import type { Locator, Page } from '@playwright/test';

export class LanguageManagerSaveConfirmation {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly valueAmounts: Locator;
  readonly cancel: Locator;
  readonly save: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog', { name: 'Confirm Save' });
    this.trigger = parent.getByRole('button', { name: 'Save' });
    this.valueAmounts = this.locator.locator('span');
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.save = this.locator.getByRole('button', { name: 'Save' });
  }
}
