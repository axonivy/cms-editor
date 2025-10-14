import type { Locator } from '@playwright/test';

export class Collapsible {
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly content: Locator;

  constructor(parent: Locator) {
    this.locator = parent.locator('.ui-collapsible');
    this.trigger = this.locator.locator('.ui-collapsible-trigger');
    this.content = this.locator.locator('.ui-collapsible-content');
  }
}
