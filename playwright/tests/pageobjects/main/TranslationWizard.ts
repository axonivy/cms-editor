import { type Locator, type Page } from '@playwright/test';
import { Collapsible } from '../abstract/Collapsible';
import { Select } from '../abstract/Select';
import { Table } from './Table';
import { TranslationWizardReview } from './TranslationWizardReview';
import { TranslationWizardTargetLanguages } from './TranslationWizardTargetLanguages';

export class TranslationWizard {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly selectedContentObjects: Collapsible;
  readonly sourceLanguage: Select;
  readonly targetLanguages: TranslationWizardTargetLanguages;
  readonly cancel: Locator;
  readonly translationWizardReview: TranslationWizardReview;
  readonly table: Table;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog');
    this.trigger = parent.getByRole('menuitem', { name: 'Translation Wizard' });
    this.selectedContentObjects = new Collapsible(page, this.locator);
    this.sourceLanguage = new Select(page, this.locator, { name: 'Source Language' });
    this.targetLanguages = new TranslationWizardTargetLanguages(this.locator);
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.translationWizardReview = new TranslationWizardReview(page, this.locator);
    this.table = new Table(this.locator);
  }
}
