import type { Locator, Page } from '@playwright/test';
import { LanguageManager } from './LanguageManager';
import { TranslationWizard } from './TranslationWizard';

export class LanguageTools {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly languageManager: LanguageManager;
  readonly translationWizard: TranslationWizard;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('menu');
    this.trigger = parent.getByRole('button', { name: 'Language Tools' });
    this.languageManager = new LanguageManager(page, this.locator);
    this.translationWizard = new TranslationWizard(page, this.locator);
  }
}
