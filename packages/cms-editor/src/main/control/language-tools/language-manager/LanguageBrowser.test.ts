import type { Language } from '../../../../utils/language-utils';
import { aggregateLanguageNodes } from './LanguageBrowser';

test('aggregateLanguageNodes', () => {
  const languageDisplayNameMock = {
    of: (languageTag: string) => `displayname of ${languageTag}`
  } as Intl.DisplayNames;
  expect(aggregateLanguageNodes([], languageDisplayNameMock, [])).toEqual([]);
  expect(
    aggregateLanguageNodes(['D', 'C', 'A-A', 'D-A', 'A', 'D-B', 'B', 'A-C', 'A-B'], languageDisplayNameMock, [
      { value: 'A-B' },
      { value: 'C' },
      { value: 'D' },
      { value: 'D-A' }
    ] as Array<Language>)
  ).toEqual([
    {
      data: { value: 'A', label: 'displayname of A' },
      value: 'displayname of A',
      info: 'A',
      notSelectable: false,
      children: [
        {
          data: { value: 'A-A', label: 'displayname of A-A' },
          value: 'displayname of A-A',
          info: 'A-A',
          notSelectable: false,
          children: []
        },
        {
          data: { value: 'A-B', label: 'displayname of A-B' },
          value: 'displayname of A-B',
          info: 'A-B',
          notSelectable: true,
          children: []
        },
        {
          data: { value: 'A-C', label: 'displayname of A-C' },
          value: 'displayname of A-C',
          info: 'A-C',
          notSelectable: false,
          children: []
        }
      ]
    },
    {
      data: { value: 'B', label: 'displayname of B' },
      value: 'displayname of B',
      info: 'B',
      notSelectable: false,
      children: []
    },
    {
      data: { value: 'C', label: 'displayname of C' },
      value: 'displayname of C',
      info: 'C',
      notSelectable: true,
      children: []
    },
    {
      data: { value: 'D', label: 'displayname of D' },
      value: 'displayname of D',
      info: 'D',
      notSelectable: true,
      children: [
        {
          data: { value: 'D-A', label: 'displayname of D-A' },
          value: 'displayname of D-A',
          info: 'D-A',
          notSelectable: true,
          children: []
        },
        {
          data: { value: 'D-B', label: 'displayname of D-B' },
          value: 'displayname of D-B',
          info: 'D-B',
          notSelectable: false,
          children: []
        }
      ]
    }
  ]);
});
