import { expect, type Locator } from '@playwright/test';

export class Table {
  readonly locator: Locator;
  readonly headers: Locator;
  readonly rows: Locator;

  constructor(parent: Locator) {
    this.locator = parent.locator('table');
    this.headers = this.locator.locator('th');
    this.rows = this.locator.locator('tbody').getByRole('row');
  }

  header(index: number) {
    return new Header(this.headers, index);
  }

  row(index: number) {
    return new Row(this.rows, index);
  }

  async expectRowsToBeSelectable(...rows: Array<boolean>) {
    for (let i = 0; i < rows.length; i++) {
      const row = this.row(i);
      if (rows[i]) {
        await row.expectToBeSelectable();
      } else {
        await row.expectNotToBeSelectable();
      }
    }
  }

  async expectToHaveNoSelection() {
    for (let i = 0; i < (await this.rows.count()); i++) {
      const row = this.row(i);
      if (await row.isSelectable()) {
        await row.expectNotToBeSelected();
      }
    }
  }

  async expectToHaveNoExpansion() {
    for (let i = 0; i < (await this.rows.count()); i++) {
      const row = this.row(i);
      if (await row.isExpandableOrCollapsible()) {
        await row.expectToBeCollapsed();
      }
    }
  }

  async expectToHaveRows(...rows: Array<Array<Array<string>>>) {
    for (let i = 0; i < rows.length; i++) {
      await this.row(i).expectToHaveColumns(...rows[i]!);
    }
  }
}

export class Header {
  readonly locator: Locator;
  readonly content: Locator;

  constructor(headers: Locator, index: number) {
    this.locator = headers.nth(index);
    this.content = this.locator.locator('span');
  }
}

export class Row {
  readonly locator: Locator;
  readonly expandCollapseButton: Locator;

  constructor(rows: Locator, index: number) {
    this.locator = rows.nth(index);
    this.expandCollapseButton = this.locator.getByRole('button');
  }

  column(index: number) {
    return new Cell(this.locator, index);
  }

  async isSelectable() {
    const cssClass = await this.locator.getAttribute('class');
    return cssClass?.includes('ui-select-row');
  }

  async expectToBeSelectable() {
    await expect(this.locator).toContainClass('ui-select-row');
  }

  async expectNotToBeSelectable() {
    await expect(this.locator).not.toContainClass('ui-select-row');
  }

  async expectToBeSelected() {
    await expect(this.locator).toHaveAttribute('data-state', 'selected');
  }

  async expectNotToBeSelected() {
    await expect(this.locator).toHaveAttribute('data-state', 'unselected');
  }

  async isExpandableOrCollapsible() {
    return await this.expandCollapseButton.isVisible();
  }

  async expectToBeCollapsed() {
    await expect(this.expandCollapseButton).toHaveAttribute('data-state', 'collapsed');
  }

  async expectToHaveStringColumns(...values: Array<Array<string>>) {
    await this.column(0).expectToHaveIcon('ivy-quote');
    await this.expectToHaveColumns(...values);
  }

  async expectToHaveFileColumns(type: 'FILE' | 'IMAGE', ...values: Array<Array<string>>) {
    await this.column(0).expectToHaveIcon(type === 'FILE' ? 'ivy-file' : 'ivy-custom-image');
    await this.expectToHaveColumns(...values);
  }

  async expectToHaveColumns(...values: Array<Array<string>>) {
    for (let i = 0; i < values.length; i++) {
      await this.column(i).expectToHaveValues(...values[i]!);
    }
  }
}

export class Cell {
  readonly locator: Locator;
  readonly icon: Locator;
  readonly values: Locator;

  constructor(row: Locator, index: number) {
    this.locator = row.getByRole('cell').nth(index);
    this.icon = this.locator.locator('i');
    this.values = this.locator.locator('span');
  }

  value(index: number) {
    return this.values.nth(index);
  }

  async expectToHaveIcon(icon: string) {
    await expect(this.icon).toContainClass(icon);
  }

  async expectToHaveValues(...values: Array<string>) {
    for (let i = 0; i < values.length; i++) {
      await expect(this.values.nth(i)).toHaveText(values[i]!);
    }
  }
}
