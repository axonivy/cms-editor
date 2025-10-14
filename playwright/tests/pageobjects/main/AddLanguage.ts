import type { Locator, Page } from '@playwright/test';
import { Textbox } from '../abstract/Textbox';
import { Collapsible } from '../abstract/Collapsible';
import { Table } from './Table';

export class AddLanguage {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly search: Textbox;
  readonly languages: Table;
  readonly info: Collapsible;
  readonly add: Locator;

  constructor(page: Page, parent: Locator) {
    this.locator = page.getByRole('dialog', { name: 'Language Browser' });
    this.trigger = parent.getByRole('button', { name: 'Add Language' });
    this.search = new Textbox(this.locator);
    this.languages = new Table(this.locator);
    this.info = new Collapsible(this.locator);
    this.add = this.locator.getByRole('button', { name: 'Add Language' });
  }
}
