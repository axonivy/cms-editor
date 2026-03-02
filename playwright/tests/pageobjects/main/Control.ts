import type { Locator, Page } from '@playwright/test';
import { AddContentObject } from './AddContentObject';
import { LanguageTools } from './LanguageTools';

export class Control {
  readonly languageTools: LanguageTools;
  readonly add: AddContentObject;
  readonly delete: Locator;

  constructor(page: Page, parent: Locator) {
    this.languageTools = new LanguageTools(page, parent);
    this.add = new AddContentObject(page, parent);
    this.delete = parent.getByRole('button', { name: 'Delete Content Object' });
  }
}
