import { type Locator, type Page } from '@playwright/test';
import { Select } from '../abstract/Select';
import { TranslationWizardTargetLanguages } from './TranslationWizardTargetLanguages';

export class TranslationWizard {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly sourceLanguage: Select;
  readonly targetLanguages: TranslationWizardTargetLanguages;
  readonly cancel: Locator;
  readonly translate: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog');
    this.trigger = parent.getByRole('button', { name: 'Translation Wizard' });
    this.sourceLanguage = new Select(page, this.locator, { name: 'Source Language' });
    this.targetLanguages = new TranslationWizardTargetLanguages(this.locator);
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.translate = this.locator.getByRole('button', { name: 'Translate' });
  }
}
