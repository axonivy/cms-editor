import { expect, type Locator, type Page } from '@playwright/test';
import { randomUUID } from 'crypto';
import { DetailPanel } from './detail/DetailPanel';
import { MainPanel } from './main/MainPanel';

export const server = process.env.BASE_URL ?? 'http://localhost:8080/';
export const user = 'Developer';
const ws = process.env.TEST_WS ?? '~Developer-cms-test-project';
const app = process.env.TEST_APP ?? 'Developer-cms-test-project';
const pmv = 'cms-test-project';

const tmpDir = '/tmp';

export class CmsEditor {
  readonly page: Page;
  readonly html: Locator;
  readonly main: MainPanel;
  readonly detail: DetailPanel;
  private readonly pmv?: string;

  constructor(page: Page, pmv?: string) {
    this.page = page;
    this.html = this.page.locator('html');
    this.main = new MainPanel(this.page);
    this.detail = new DetailPanel(this.page);
    this.pmv = pmv;
  }

  async expectToBeLight() {
    await expect(this.html).toHaveClass('light');
  }

  async expectToBeDark() {
    await expect(this.html).toHaveClass('dark');
  }

  static async openCms(page: Page, options?: { pmv?: string; readonly?: boolean; theme?: string }) {
    const serverUrl = server.replace(/^https?:\/\//, '');
    let url = `?server=${serverUrl}${ws}&app=${app}`;
    if (!options?.pmv) {
      url += `&pmv=${pmv}`;
    }
    if (options) {
      url += `&${this.params(options)}`;
    }
    return this.openUrl(page, url, options?.pmv);
  }

  static async openNewCms(page: Page) {
    const name = 'project' + randomUUID().replaceAll('-', '');
    const result = await fetch(`${server}${ws}/api/web-ide/project/new`, {
      method: 'POST',
      headers: {
        'X-Requested-By': 'cms-editor-tests',
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(user + ':' + user).toString('base64')
      },
      body: JSON.stringify({
        name,
        groupId: `cms.test.${name}`,
        projectId: `cms-test-${name}`,
        defaultNamespace: name,
        path: `${tmpDir}/${name}`
      })
    });
    if (!result.ok) {
      throw Error(`Failed to create project: ${result.status}`);
    }
    return await this.openCms(page, { pmv: name });
  }

  static async openMock(
    page: Page,
    options?: {
      parameters?: { readonly?: boolean; app?: string; lng?: string; translationServiceEnabled?: boolean };
      defaultLanguages?: Array<string>;
    }
  ) {
    let params = '';
    if (options?.parameters) {
      params = '?';
      params += this.params(options.parameters);
    }
    if (options?.defaultLanguages) {
      await page.evaluate(languages => {
        localStorage.setItem('cms-editor-default-language-tags', JSON.stringify(languages));
      }, options.defaultLanguages);
    }
    return this.openUrl(page, `/mock.html${params}`);
  }

  private static params(options: Record<string, string | boolean>) {
    let params = '';
    params += Object.entries(options)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return params;
  }

  private static async openUrl(page: Page, url: string, pmv?: string) {
    const editor = new CmsEditor(page, pmv);
    await page.goto(url);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    return editor;
  }

  async takeScreenshot(fileName: string) {
    await this.hideQuery();
    const dir = process.env.SCREENSHOT_DIR ?? 'tests/screenshots/target';
    const buffer = await this.page.screenshot({ path: `${dir}/screenshots/${fileName}`, animations: 'disabled' });
    expect(buffer.byteLength).toBeGreaterThan(3000);
  }

  async hideQuery() {
    await this.page.addStyleTag({ content: `.tsqd-parent-container { display: none; }` });
  }

  async consoleLog() {
    return new Promise(result => {
      this.page.on('console', msg => {
        if (msg.type() === 'log') {
          result(msg.text());
        }
      });
    });
  }

  async deletePmv() {
    const result = await fetch(`${server}${ws}/api/web-ide/project?app=${app}&pmv=${this.pmv}`, {
      method: 'DELETE',
      headers: {
        'X-Requested-By': 'cms-editor-tests',
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(user + ':' + user).toString('base64')
      }
    });
    if (!result.ok) {
      throw Error(`Failed to delete project: ${result.status}`);
    }
  }
}
