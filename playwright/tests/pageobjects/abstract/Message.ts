import { expect, type Locator } from '@playwright/test';

export class Message {
  readonly locator: Locator;

  constructor(parent: Locator, options?: { id?: string; severity?: 'info' | 'error'; hasText?: string }) {
    if (options?.id) {
      this.locator = parent.locator(`[id="${options.id}"]`);
    } else if (options?.severity) {
      this.locator = parent.locator(`.ui-message[data-state="${options.severity}"]`);
    } else if (options?.hasText) {
      this.locator = parent.locator(`.ui-message:has-text("${options.hasText}")`);
    } else {
      this.locator = parent.locator('.ui-message').first();
    }
  }

  async expectToBeInfo(message: string) {
    await expect(this.locator).toHaveText(message);
    await expect(this.locator).toHaveAttribute('data-state', 'info');
  }

  async expectToBeError(message: string) {
    await expect(this.locator).toHaveText(message);
    await expect(this.locator).toHaveAttribute('data-state', 'error');
  }
}
