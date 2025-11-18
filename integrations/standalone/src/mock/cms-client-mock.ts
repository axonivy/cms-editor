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
  CmsDataArgs,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsInitializeResult,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsStringDataObject,
  CmsTranslationArgs,
  CmsUpdateValuesArgs,
  MetaRequestTypes,
  Void
} from '@axonivy/cms-editor-protocol';
import { contentObjects } from './data';
import { locales, supportedLocales } from './meta';

export class CmsClientMock implements Client {
  private cmsData: CmsData = contentObjects;
  private localesData: Array<string> = locales;

  initialize(): Promise<CmsInitializeResult> {
    throw new Error('Method not implemented.');
  }

  data(args: CmsDataArgs): Promise<CmsData> {
    return Promise.resolve({
      ...this.cmsData,
      data: this.cmsData.data.map(co => this.filterNotRequestedLanguageValues(co, args))
    });
  }

  private filterNotRequestedLanguageValues(co: CmsDataObject, args: CmsDataArgs) {
    if (isCmsValueDataObject(co)) {
      return {
        ...co,
        values: Object.fromEntries(Object.entries(co.values).filter(([languageTag]) => args.languageTags.includes(languageTag)))
      };
    }
    return co;
  }

  createString(args: CmsCreateStringArgs): Promise<Void> {
    return this.create(args);
  }

  createFile(args: CmsCreateFileArgs): Promise<Void> {
    return this.create(args);
  }

  private async create(args: CmsCreateStringArgs | CmsCreateFileArgs): Promise<Void> {
    const uri = args.contentObject.uri;
    if (uri.endsWith('CreateIsPending')) {
      await new Promise(res => setTimeout(res, 1000));
    } else if (uri.endsWith('CreateIsError')) {
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

  updateStringValues = (args: CmsUpdateValuesArgs): Promise<Void> => {
    this.updateValue(args, isCmsStringDataObject);
    return Promise.resolve({});
  };

  updateFileValues = (args: CmsUpdateValuesArgs): Promise<Void> => {
    this.updateValue(args, isCmsFileDataObject);
    return Promise.resolve({});
  };

  private updateValue<T extends CmsValueDataObject>(args: CmsUpdateValuesArgs, typeCheck: (co?: CmsDataObject) => co is T) {
    args.updateRequests.forEach(updateRequest => {
      const co = this.findContentObject(updateRequest.uri);
      if (typeCheck(co)) {
        co.values = { ...co.values, ...updateRequest.values } as T['values'];
      }
    });
  }

  deleteValue(args: CmsDeleteValueArgs): Promise<Void> {
    const co = this.findContentObject(args.deleteRequest.uri);
    if (isCmsValueDataObject(co)) {
      co.values = removeValue(co.values, args.deleteRequest.languageTag);
    }
    return Promise.resolve({});
  }

  private findContentObject = (uri: string) => this.cmsData.data.find(co => co.uri === uri);

  delete(args: CmsDeleteArgs): Promise<Void> {
    this.cmsData = { ...this.cmsData, data: this.cmsData.data.filter(co => !args.uris.includes(co.uri)) };
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

  async translate(args: CmsTranslationArgs): Promise<Array<CmsStringDataObject>> {
    if (args.translationRequest.uris[0]?.endsWith('TranslateIsPending')) {
      await new Promise(res => setTimeout(res, 1000));
    } else if (args.translationRequest.uris[0]?.endsWith('TranslateIsError')) {
      throw Error('error message');
    }

    return Promise.resolve(
      this.cmsData.data
        .filter(co => args.translationRequest.uris.includes(co.uri))
        .filter(co => isCmsStringDataObject(co))
        .map(co => ({ ...co, values: this.translatedValues(co, args) }))
    );
  }

  private translatedValues = (co: CmsStringDataObject, args: CmsTranslationArgs) => {
    const sourceLanguageTag = args.translationRequest.sourceLanguageTag;
    return Object.fromEntries(
      args.translationRequest.targetLanguageTags.map(tag => [
        tag,
        `Translation of '${co.values[sourceLanguageTag]}' from '${sourceLanguageTag}' to '${tag}'`
      ])
    );
  };

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
      .reduce<Record<string, number>>((localeValuesAmount, co) => {
        locales.forEach(locale => {
          if (co.values[locale] !== undefined) {
            localeValuesAmount[locale] = (localeValuesAmount[locale] ?? 0) + 1;
          }
        });
        return localeValuesAmount;
      }, {});
  };

  action(action: CmsActionArgs): Promise<void> {
    console.log(`Action: ${JSON.stringify(action)}`);
    return Promise.resolve();
  }
}
