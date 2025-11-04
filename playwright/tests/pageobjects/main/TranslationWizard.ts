import { type Locator, type Page } from '@playwright/test';
import { Collapsible } from '../abstract/Collapsible';
import { Select } from '../abstract/Select';
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

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog');
    this.trigger = parent.getByRole('menuitem', { name: 'Translation Wizard' });
    this.selectedContentObjects = new Collapsible(this.locator);
    this.sourceLanguage = new Select(page, this.locator, { name: 'Source Language' });
    this.targetLanguages = new TranslationWizardTargetLanguages(this.locator);
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.translationWizardReview = new TranslationWizardReview(page, this.locator);
  }
}
