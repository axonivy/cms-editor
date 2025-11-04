import { expect, type Locator, type Page } from '@playwright/test';

export class Collapsible {
  readonly page: Page;
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly state: Locator;
  readonly content: Locator;

  constructor(page: Page, parent: Locator) {
    this.page = page;
    this.locator = parent.locator('.ui-collapsible');
    this.trigger = this.locator.locator('.ui-collapsible-trigger');
    this.state = this.locator.locator('.ui-state-dot');
    this.content = this.locator.locator('.ui-collapsible-content');
  }

  async expectToHaveWarning() {
    await expect(this.state).toHaveAttribute('data-state', 'warning');
  }

  async expectToHaveError() {
    await expect(this.state).toHaveAttribute('data-state', 'error');
  }

  async expectToHaveMessages(...messages: Array<{ variant: string; message: string }>) {
    await this.state.hover();
    const tooltip = this.page.getByRole('tooltip');
    for (let i = 0; i < messages.length; i++) {
      const paragraph = tooltip.locator('p').nth(i);
      await expect(paragraph).toHaveAttribute('data-state', messages[i]!.variant);
      await expect(paragraph).toHaveText(messages[i]!.message);
    }
  }
}
