import { removeValue } from '@axonivy/cms-editor';
import type {
  Client,
  CmsActionArgs,
  CmsAddLocalesArgs,
  CmsCountLocaleValuesArgs,
  CmsCreateArgs,
  CmsData,
  CmsDataObject,
  CmsDeleteArgs,
  CmsDeleteValueArgs,
  CmsReadArgs,
  CmsRemoveLocalesArgs,
  CmsUpdateValueArgs,
  ContentObject,
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

  async create(args: CmsCreateArgs): Promise<Void> {
    const uri = args.contentObject.uri;
    if (uri.endsWith('IsPending')) {
      await new Promise(res => setTimeout(res, 1000));
    } else if (uri.endsWith('IsError')) {
      throw Error('error message');
    }
    this.cmsData.data.push(args.contentObject);
    this.cmsData.data.sort((co1, co2) => co1.uri.localeCompare(co2.uri));
    return Promise.resolve({});
  }

  read(args: CmsReadArgs): Promise<CmsDataObject> {
    return Promise.resolve(this.cmsData.data.find(data => data.uri === args.uri) ?? ({} as CmsDataObject));
  }

  updateValue(args: CmsUpdateValueArgs): void {
    const co = this.cmsData.data.find(co => co.uri === args.updateObject.uri);
    if (co) {
      co.values = { ...co.values, [args.updateObject.languageTag]: args.updateObject.value };
    }
  }

  deleteValue(args: CmsDeleteValueArgs): void {
    const co = this.cmsData.data.find(co => co.uri === args.deleteObject.uri);
    if (co) {
      co.values = removeValue(co.values, args.deleteObject.languageTag);
    }
  }

  delete(args: CmsDeleteArgs): void {
    this.cmsData = { ...this.cmsData, data: this.cmsData.data.filter(co => co.uri !== args.uri) };
  }

  addLocales(args: CmsAddLocalesArgs): void {
    this.localesData = [...this.localesData, ...(args as CmsAddLocalesArgs).locales];
  }

  removeLocales(args: CmsRemoveLocalesArgs): void {
    this.localesData = this.localesData.filter(locale => !(args as CmsRemoveLocalesArgs).locales.includes(locale));
    this.cmsData = {
      ...this.cmsData,
      data: this.cmsData.data.map(co => this.removeLocaleValues(co, args.locales)).filter(co => Object.entries(co.values).length !== 0)
    };
  }

  private removeLocaleValues = (co: ContentObject, locales: Array<string>) => ({
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
    return this.cmsData.data.reduce(
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

  action(action: CmsActionArgs): void {
    console.log(`Action: ${JSON.stringify(action)}`);
  }
}
