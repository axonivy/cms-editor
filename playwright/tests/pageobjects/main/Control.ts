import type { Locator, Page } from '@playwright/test';
import { AddContentObject } from './AddContentObject';
import { LanguageTool } from './LanguageTool';
import { TranslationWizard } from './TranslationWizard';

export class Control {
  readonly locator: Locator;
  readonly languageTool: LanguageTool;
  readonly translationWizard: TranslationWizard;
  readonly add: AddContentObject;
  readonly delete: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = parent.locator('.cms-editor-main-control');
    this.languageTool = new LanguageTool(page, this.locator);
    this.translationWizard = new TranslationWizard(page, this.locator);
    this.add = new AddContentObject(page, this.locator);
    this.delete = this.locator.getByRole('button', { name: 'Delete Content Object' });
  }
}
