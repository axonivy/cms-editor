import { expect, type Locator } from '@playwright/test';
import { Message } from './Message';

export class Textbox {
  readonly parent: Locator;
  readonly locator: Locator;

  constructor(parent: Locator, options?: { name?: string; nth?: number }) {
    this.parent = parent;
    if (options?.name) {
      this.locator = parent.getByRole('textbox', { name: options.name, exact: true });
    } else {
      this.locator = parent.getByRole('textbox').nth(options?.nth ?? 0);
    }
  }

  async message() {
    const describedBy = await this.locator.getAttribute('aria-describedby');
    if (!describedBy) {
      throw new Error('aria-describedby attribute is missing');
    }
    return new Message(this.parent, { id: describedBy });
  }

  async expectToHaveNoPlaceholder() {
    await expect(this.locator).not.toHaveAttribute('placeholder');
  }

  async expectToHavePlaceholder(placeholder: string) {
    await expect(this.locator).toHaveAttribute('placeholder', placeholder);
  }
}
