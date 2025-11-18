import type { Locator, Page } from '@playwright/test';
import { Table } from './Table';

export class TranslationWizardReview {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly spinner: Locator;
  readonly error: Locator;
  readonly cancel: Locator;
  readonly apply: Locator;
  readonly table: Table;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog', { name: 'Translation Review' });
    this.trigger = parent.getByRole('button', { name: 'Translate' });
    this.spinner = this.locator.locator('.cms-editor-translation-wizard-review-spinner');
    this.error = this.locator.locator('.cms-editor-translation-wizard-review-error');
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.apply = this.locator.getByRole('button', { name: 'Apply' });
    this.table = new Table(this.locator);
  }
}
