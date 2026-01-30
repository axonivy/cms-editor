import { type Locator, type Page } from '@playwright/test';
import { Combobox } from '../abstract/Combobox';
import { Message } from '../abstract/Message';
import { Select } from '../abstract/Select';
import { Textbox } from '../abstract/Textbox';
import { CmsValueField } from '../components/CmsValueField';

export class AddContentObject {
  readonly page: Page;
  readonly locator: Locator;
  readonly trigger: Locator;
  readonly name: Textbox;
  readonly namespace: Combobox;
  readonly type: Select;
  readonly fileFormatInfo: Message;
  readonly values: Locator;
  readonly message: Message;
  readonly cancel: Locator;
  readonly create: Locator;

  constructor(page: Page, parent: Locator) {
    this.page = page;
    this.locator = this.page.getByRole('dialog');
    this.trigger = parent.getByRole('button', { name: 'Add Content Object' });
    this.name = new Textbox(this.locator, { name: 'Name' });
    this.namespace = new Combobox(this.locator, { name: 'Namespace' });
    this.type = new Select(this.page, this.locator, { name: 'Type' });
    this.fileFormatInfo = new Message(this.locator, { className: 'cms-editor-add-dialog-file-format-info' });
    this.values = this.locator.locator('.cms-editor-value-field');
    this.message = new Message(this.locator, { className: 'cms-editor-add-dialog-message' });
    this.cancel = this.locator.getByRole('button', { name: 'Cancel' });
    this.create = this.locator.getByRole('button', { name: 'Create Content Object' });
  }

  async addString(name: string, namespace: string, values: Record<string, string>) {
    await this.trigger.click();
    await this.name.locator.fill(name);
    await this.namespace.fill(namespace);
    for (const [language, value] of Object.entries(values)) {
      await this.value(language).textbox.locator.fill(value);
    }
    await this.create.click();
  }

  async addFile(name: string, namespace: string, files: Record<string, string>) {
    await this.trigger.click();
    await this.name.locator.fill(name);
    await this.namespace.fill(namespace);
    await this.type.select('File');
    for (const [language, file] of Object.entries(files)) {
      await this.value(language).selectFile(file);
    }
    await this.create.click();
  }

  value(label: string) {
    return new CmsValueField(this.page, this.locator, { label });
  }
}
