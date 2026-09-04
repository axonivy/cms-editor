import { expect, type Locator, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { DetailPanel } from './detail/DetailPanel';
import { MainPanel } from './main/MainPanel';

export const server = process.env.BASE_URL ?? 'http://localhost:8080/';
export const user = 'Developer';
export const app = process.env.TEST_APP ?? 'Developer-cms-test-project';
const projectPath = path.resolve(import.meta.dirname, '../..', 'cms-test-project');

const tmpDir = '/tmp';

export class CmsEditor {
  readonly page: Page;
  readonly html: Locator;
  readonly main: MainPanel;
  readonly detail: DetailPanel;
  private readonly project?: string;

  constructor(page: Page, project?: string) {
    this.page = page;
    this.html = this.page.locator('html');
    this.main = new MainPanel(this.page);
    this.detail = new DetailPanel(this.page);
    this.project = project;
  }

  async expectToBeLight() {
    await expect(this.html).toHaveClass('light');
  }

  async expectToBeDark() {
    await expect(this.html).toHaveClass('dark');
  }

  static async openCms(page: Page, options?: { app?: string; project?: string; file?: string; readonly?: boolean; theme?: string }) {
    const workspace = await this.createWorkspace();
    const registeredProject = `cms-test-project-${randomUUID().slice(0, 8)}`;
    await this.loadProject(workspace.id, registeredProject);
    const workspaceApp = workspace.basePath.replace(/^~/, '');
    const serverUrl = this.serverUrl();
    let url = `?server=${serverUrl}${workspace.basePath}`;
    if (options) {
      url += `&${this.params({ ...options, app: workspaceApp, project: registeredProject })}`;
    }
    return this.openUrl(page, url, options?.project);
  }

  private static async createWorkspace() {
    const suffix = randomUUID().slice(0, 8);
    const name = `cms-test-workspace-${suffix}`;
    const workspacePath = path.join('/tmp', name);
    await mkdir(workspacePath, { recursive: true });
    const headers = this.apiHeaders();
    const response = await fetch(this.apiUrl('workspace'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, path: workspacePath })
    });
    if (!response.ok) throw Error(`Failed to create workspace: ${response.status} ${await response.text()}`);
    const workspace: unknown = await response.json();
    if (
      typeof workspace !== 'object' ||
      workspace === null ||
      !('id' in workspace) ||
      typeof workspace.id !== 'string' ||
      !('baseUrl' in workspace) ||
      typeof workspace.baseUrl !== 'string'
    ) {
      throw Error('Workspace creation returned an invalid response');
    }
    return { id: workspace.id, basePath: workspace.baseUrl.replace(/^\//, '') };
  }

  private static async loadProject(workspaceId: string, project: string) {
    const headers = this.apiHeaders();
    const projectResponse = await fetch(this.apiUrl('project'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceId, name: project, path: projectPath })
    });
    if (!projectResponse.ok) throw Error(`Failed to create project: ${projectResponse.status} ${await projectResponse.text()}`);
    const deployResponse = await fetch(this.apiUrl('projects/deployProjects'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceId, projectDirs: [projectPath] })
    });
    if (!deployResponse.ok) throw Error(`Failed to deploy project: ${deployResponse.status} ${await deployResponse.text()}`);
  }

  static async openNewCms(page: Page) {
    const workspace = await this.createWorkspace();
    const name = 'project' + randomUUID().replaceAll('-', '');
    const result = await fetch(`${server}designer/api/web-ide/project/new`, {
      method: 'POST',
      headers: {
        'X-Requested-By': 'cms-editor-tests',
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(user + ':' + user).toString('base64')
      },
      body: JSON.stringify({
        workspaceId: workspace.id,
        name,
        groupId: `cms.test.${name}`,
        projectId: `cms-test-${name}`,
        path: `${tmpDir}/${name}`
      })
    });
    if (!result.ok) {
      throw Error(`Failed to create project: ${result.status}`);
    }
    const serverUrl = this.serverUrl();
    const workspaceApp = workspace.basePath.replace(/^~/, '');
    return this.openUrl(page, `?server=${serverUrl}${workspace.basePath}&app=${workspaceApp}&project=${name}`, name);
  }

  private static apiHeaders() {
    return {
      'X-Requested-By': 'cms-editor-tests',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(user + ':' + user).toString('base64')
    };
  }

  private static apiUrl(resource: string) {
    return `${server.replace(/\/?$/, '/')}designer/api/web-ide/${resource}`;
  }

  private static serverUrl() {
    return server.replace(/^https?:\/\//, '');
  }

  static async openMock(
    page: Page,
    options?: {
      parameters?: { readonly?: boolean; app?: string; theme?: string; lng?: string; translationServiceEnabled?: boolean };
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

  private static async openUrl(page: Page, url: string, project?: string) {
    const editor = new CmsEditor(page, project);
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
}
