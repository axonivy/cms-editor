import type { CmsDataObject } from '@axonivy/cms-editor-protocol';
import { toolbarTitles } from './CmsEditor';

test('toolbarTitles', () => {
  expect(toolbarTitles('project-name')).toEqual({ mainTitle: 'CMS - project-name', detailTitle: 'CMS - project-name' });
  expect(toolbarTitles('project-name', { uri: 'content-object-uri' } as CmsDataObject)).toEqual({
    mainTitle: 'CMS - project-name',
    detailTitle: 'CMS - project-name - content-object-uri'
  });
  expect(toolbarTitles('project-name', { uri: 'folder/content-object-uri' } as CmsDataObject)).toEqual({
    mainTitle: 'CMS - project-name',
    detailTitle: 'CMS - project-name - content-object-uri'
  });
});
