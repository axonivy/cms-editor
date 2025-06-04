import { expect, type Locator, type Page } from '@playwright/test';
import { AddLanguage } from './AddLanguage';
import { LanguageToolSaveConfirmation } from './LanguageToolSaveConfirmation';
import { Table } from './Table';

export class LanguageTool {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly add: AddLanguage;
  readonly delete: Locator;
  readonly languages: Table;
  readonly save: LanguageToolSaveConfirmation;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog');
    this.trigger = parent.getByRole('button', { name: 'Language Tool' });
    this.add = new AddLanguage(page, this.locator);
    this.delete = this.locator.getByRole('button', { name: 'Delete Language' });
    this.languages = new Table(this.locator);
    this.save = new LanguageToolSaveConfirmation(page, this.locator);
  }

  async expectToHaveLanguages(...languages: Array<string>) {
    await expect(this.languages.rows).toHaveCount(languages.length);
    for (let i = 0; i < languages.length; i++) {
      await expect(this.languages.row(i).locator).toHaveText(languages[i]);
    }
  }

  checkboxOfRow(index: number) {
    return this.languages.row(index).locator.getByRole('checkbox');
  }

  async addLanguage(index: number) {
    await this.add.trigger.click();
    await this.add.languages.row(index).locator.click();
    await this.add.add.click();
  }
}
