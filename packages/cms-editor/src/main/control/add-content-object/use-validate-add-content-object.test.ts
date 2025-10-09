import type { CmsDataObject, MapStringString } from '@axonivy/cms-editor-protocol';
import { customRenderHook } from '../../../context/test-utils/test-utils';
import { useValidateAddContentObject } from './use-validate-add-content-object';

test('nameMessage', () => {
  expect(renderUseValidateAddContentObject().result.current.nameMessage).toEqual({
    message: 'Name cannot be empty.',
    variant: 'error'
  });

  expect(renderUseValidateAddContentObject({ name: 'test/name' }).result.current.nameMessage).toEqual({
    message: "Character '/' is not allowed.",
    variant: 'error'
  });

  const nameIsTakenMessage = {
    message: 'Name is already present in this Namespace.',
    variant: 'error'
  };
  expect(
    renderUseValidateAddContentObject({
      name: 'testName',
      contentObjects: [{ uri: '/testName' } as CmsDataObject]
    }).result.current.nameMessage
  ).toEqual(nameIsTakenMessage);
  expect(
    renderUseValidateAddContentObject({
      name: 'testName',
      namespace: 'testNamespace',
      contentObjects: [{ uri: '/testNamespace/testName' } as CmsDataObject]
    }).result.current.nameMessage
  ).toEqual(nameIsTakenMessage);
  expect(
    renderUseValidateAddContentObject({
      name: 'tEstNamE',
      namespace: '/tEstNamEspacE',
      contentObjects: [{ uri: '/testNamespace/testName' } as CmsDataObject]
    }).result.current.nameMessage
  ).toEqual(nameIsTakenMessage);

  expect(renderUseValidateAddContentObject({ name: 'testName' }).result.current.nameMessage).toBeUndefined();
});

test('valuesMessage', () => {
  expect(renderUseValidateAddContentObject().result.current.valuesMessage).toEqual({
    message: 'At least one value must be present.',
    variant: 'error'
  });
  expect(renderUseValidateAddContentObject({ values: { en: 'value' } }).result.current.valuesMessage).toBeUndefined();
});

type renderUseValidateAddContentObjectProps = {
  name?: string;
  namespace?: string;
  values?: MapStringString;
  contentObjects?: Array<CmsDataObject>;
};

const renderUseValidateAddContentObject = (props?: renderUseValidateAddContentObjectProps) => {
  return customRenderHook(() =>
    useValidateAddContentObject(props?.name ?? '', props?.namespace ?? '', props?.values ?? {}, props?.contentObjects ?? [])
  );
};
