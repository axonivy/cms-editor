import { type Locator } from '@playwright/test';

export class TranslationWizardTargetLanguages {
  readonly locator: Locator;
  readonly selectDeselectAll: Locator;
  readonly languages: Locator;

  constructor(parent: Locator) {
    this.locator = parent.locator('.cms-editor-translation-wizard-target-languages');
    this.selectDeselectAll = this.locator.getByRole('button');
    this.languages = this.locator.locator('.ui-field');
  }

  language(label: string) {
    return new Language(this.languages, label);
  }
}

export class Language {
  readonly locator: Locator;
  readonly checkbox: Locator;

  constructor(languages: Locator, label: string) {
    this.locator = languages.filter({ hasText: label });
    this.checkbox = this.locator.getByRole('checkbox');
  }
}
