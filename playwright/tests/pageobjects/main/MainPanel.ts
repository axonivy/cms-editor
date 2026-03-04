import type { Locator, Page } from '@playwright/test';
import { Textbox } from '../abstract/Textbox';
import { Control } from './Control';
import { MainToolbar } from './MainToolbar';
import { Table } from './Table';

export class MainPanel {
  readonly locator: Locator;
  readonly toolbar: MainToolbar;
  readonly label: Locator;
  readonly control: Control;
  readonly search: Textbox;
  readonly table: Table;

  constructor(page: Page) {
    this.locator = page.locator('#cms-editor-main');
    this.toolbar = new MainToolbar(page, this.locator);
    this.label = this.locator.locator('.ui-fieldset').first().locator('label');
    this.control = new Control(page, this.locator);
    this.search = new Textbox(this.locator);
    this.table = new Table(this.locator);
  }
}
