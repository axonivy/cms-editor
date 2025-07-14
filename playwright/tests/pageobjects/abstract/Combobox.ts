import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { Message } from './Message';

export class Combobox {
  readonly parent: Locator;
  readonly locator: Locator;
  readonly options: Locator;
  readonly toggleMenu: Locator;

  constructor(parent: Locator, options?: { name?: string }) {
    this.parent = parent;
    if (options?.name) {
      this.locator = this.parent.getByRole('combobox', { name: options.name, exact: true });
    } else {
      this.locator = this.parent.getByRole('combobox').first();
    }
    this.options = this.parent.getByRole('option');
    this.toggleMenu = this.parent.getByRole('button', { name: 'toggle menu' });
  }

  async fill(value: string) {
    await this.locator.fill(value);
    await this.locator.blur();
  }

  async expectToHaveOptions(...options: Array<string>) {
    await this.toggleMenu.click();
    await expect(this.options).toHaveCount(options.length);
    for (let i = 0; i < options.length; i++) {
      await expect(this.options.nth(i)).toHaveText(options[i]);
    }
    await this.toggleMenu.click();
  }

  async message() {
    const describedBy = await this.locator.getAttribute('aria-describedby');
    if (!describedBy) {
      throw new Error('aria-describedby attribute is missing');
    }
    return new Message(this.parent, { id: describedBy });
  }
}
