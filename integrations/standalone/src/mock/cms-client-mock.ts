import {
  isCmsDataFileDataObject,
  isCmsFileDataObject,
  isCmsStringDataObject,
  isCmsValueDataObject,
  removeValue,
  type CmsValueDataObject
} from '@axonivy/cms-editor';
import type {
  Client,
  CmsActionArgs,
  CmsAddLocalesArgs,
  CmsCountLocaleValuesArgs,
  CmsCreateFileArgs,
  CmsCreateStringArgs,
  CmsData,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsUpdateValueArgs,
  MetaRequestTypes,
  Void
} from '@axonivy/cms-editor-protocol';
import { contentObjects } from './data';
import { locales, supportedLocales } from './meta';

export class CmsClientMock implements Client {
  private cmsData: CmsData = contentObjects;
  private localesData: Array<string> = locales;

  data(): Promise<CmsData> {
    return Promise.resolve(this.cmsData);
  }

  createString(args: CmsCreateStringArgs): Promise<Void> {
    return this.create(args);
  }

  createFile(args: CmsCreateFileArgs): Promise<Void> {
    return this.create(args);
  }

  private async create(args: CmsCreateStringArgs | CmsCreateFileArgs): Promise<Void> {
    const uri = args.contentObject.uri;
    if (uri.endsWith('IsPending')) {
      await new Promise(res => setTimeout(res, 1000));
    } else if (uri.endsWith('IsError')) {
      throw Error('error message');
    }

    if (isCmsFileDataObject(args.contentObject)) {
      this.cmsData.data.push({
        ...args.contentObject,
        values: Object.fromEntries(Object.keys(args.contentObject.values).map(key => [key, true])),
        mimeType: ''
      });
    } else {
      this.cmsData.data.push(args.contentObject);
    }
    this.cmsData.data.sort((co1, co2) => co1.uri.localeCompare(co2.uri));
    return Promise.resolve({});
  }

  read(args: CmsReadArgs): Promise<CmsDataObject> {
    let co = this.findContentObject(args.uri);
    if (isCmsDataFileDataObject(co)) {
      co = {
        ...co,
        values: Object.fromEntries(Object.keys(co.values).map(key => [key, `/test/cm/test$1${co?.uri}?l=${key}`]))
      };
    }
    return Promise.resolve(co ?? ({} as CmsDataObject));
  }

  updateStringValue = (args: CmsUpdateValueArgs): Promise<Void> => {
    this.updateValue(args, isCmsStringDataObject);
    return Promise.resolve({});
  };

  updateFileValue = (args: CmsUpdateValueArgs): Promise<Void> => {
    this.updateValue(args, isCmsFileDataObject);
    return Promise.resolve({});
  };

  private updateValue<T extends CmsValueDataObject>(args: CmsUpdateValueArgs, typeCheck: (co?: CmsDataObject) => co is T) {
    const co = this.findContentObject(args.updateObject.uri);
    if (typeCheck(co)) {
      co.values = { ...co.values, [args.updateObject.languageTag]: args.updateObject.value } as T['values'];
    }
  }

  deleteValue(args: CmsDeleteValueArgs): Promise<Void> {
    const co = this.findContentObject(args.deleteObject.uri);
    if (isCmsValueDataObject(co)) {
      co.values = removeValue(co.values, args.deleteObject.languageTag);
    }
    return Promise.resolve({});
  }

  private findContentObject = (uri: string) => this.cmsData.data.find(co => co.uri === uri);

  delete(args: CmsDeleteArgs): Promise<Void> {
    this.cmsData = { ...this.cmsData, data: this.cmsData.data.filter(co => co.uri !== args.uri) };
    return Promise.resolve({});
  }

  addLocales(args: CmsAddLocalesArgs): Promise<Void> {
    this.localesData = [...this.localesData, ...(args as CmsAddLocalesArgs).locales];
    return Promise.resolve({});
  }

  removeLocales(args: CmsRemoveLocalesArgs): Promise<Void> {
    this.localesData = this.localesData.filter(locale => !(args as CmsRemoveLocalesArgs).locales.includes(locale));
    this.cmsData = {
      ...this.cmsData,
      data: this.cmsData.data
        .filter(co => isCmsValueDataObject(co))
        .map(co => this.removeLocaleValues(co, args.locales))
        .filter(co => Object.entries(co.values).length !== 0)
    };
    return Promise.resolve({});
  }

  private removeLocaleValues = (co: CmsValueDataObject, locales: Array<string>) => ({
    ...co,
    values: Object.fromEntries(Object.entries(co.values).filter(entry => !locales.includes(entry[0])))
  });

  meta<TMeta extends keyof MetaRequestTypes>(path: TMeta, args: MetaRequestTypes[TMeta][0]): Promise<MetaRequestTypes[TMeta][1]> {
    switch (path) {
      case 'meta/supportedLocales':
        return Promise.resolve(supportedLocales);
      case 'meta/locales':
        return Promise.resolve(this.localesData);
      case 'meta/countLocaleValues':
        return Promise.resolve(this.countLocaleValues((args as CmsCountLocaleValuesArgs).locales));
      default:
        throw Error('meta path not implemented');
    }
  }

  private countLocaleValues = (locales: Array<string>) => {
    return this.cmsData.data
      .filter(co => isCmsValueDataObject(co))
      .reduce(
        (localeValuesAmount, co) => {
          locales.forEach(locale => {
            if (co.values[locale] !== undefined) {
              localeValuesAmount[locale] = ++localeValuesAmount[locale];
            }
          });
          return localeValuesAmount;
        },
        Object.fromEntries(locales.map(locale => [locale, 0]))
      );
  };

  action(action: CmsActionArgs): Promise<void> {
    console.log(`Action: ${JSON.stringify(action)}`);
    return Promise.resolve();
  }
}
