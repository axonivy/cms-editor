import type { CmsValueDataObject } from '@axonivy/cms-editor-protocol';
import { customRenderHook } from '../../../../context/test-utils/test-utils';
import { useTranslatableSelectedContentObjects } from './TranslationWizard';

test('useTranslatableSelectedContentObjects', () => {
  let contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  let result = renderTranslatableSelectedContentObjectsHook(contentObjects, []).result;
  expect(result.current.allSelectedContentObjects).toEqual(contentObjects);
  expect(result.current.translatableSelectedContentObjectUris).toEqual(['contentObjectUri0', 'contentObjectUri2']);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([{ variant: 'warning', message: 'notFileMessage' }]);

  contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' },
    { uri: 'notTranslatable', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  result = renderTranslatableSelectedContentObjectsHook(contentObjects, [1, 2, 3]).result;
  expect(result.current.allSelectedContentObjects).toEqual([contentObjects[1], contentObjects[2], contentObjects[3]]);
  expect(result.current.translatableSelectedContentObjectUris).toEqual(['contentObjectUri2']);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([
    { variant: 'error', message: 'notTranslatableMessage' },
    { variant: 'warning', message: 'notFileMessage' }
  ]);

  contentObjects = [
    { uri: 'contentObjectUri0', type: 'STRING' },
    { uri: 'contentObjectUri1', type: 'FILE' },
    { uri: 'contentObjectUri2', type: 'STRING' },
    { uri: 'notTranslatable', type: 'STRING' }
  ] as Array<CmsValueDataObject>;
  result = renderTranslatableSelectedContentObjectsHook(contentObjects, [1, 3]).result;
  expect(result.current.allSelectedContentObjects).toEqual([contentObjects[1], contentObjects[3]]);
  expect(result.current.translatableSelectedContentObjectUris).toEqual([]);
  expect(result.current.selectedContentObjectsCollapsibleMessages).toEqual([
    { variant: 'error', message: 'No translatable Content Objects selected.' },
    { variant: 'error', message: 'notTranslatableMessage' },
    { variant: 'warning', message: 'notFileMessage' }
  ]);
});

const renderTranslatableSelectedContentObjectsHook = (contentObjects: Array<CmsValueDataObject>, selectedContentObjects: Array<number>) => {
  return customRenderHook(
    () =>
      useTranslatableSelectedContentObjects([
        { condition: co => co.uri !== 'notTranslatable', message: { variant: 'error', message: 'notTranslatableMessage' } },
        { condition: co => co.type !== 'FILE', message: { variant: 'warning', message: 'notFileMessage' } }
      ]),
    {
      wrapperProps: { appContext: { contentObjects, selectedContentObjects } }
    }
  );
};
