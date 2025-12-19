import { normalizeUri } from './normalize-uri';

test('normalizeNamespace', () => {
  expect(normalizeUri('')).toEqual('');
  expect(normalizeUri('   ')).toEqual('');
  expect(normalizeUri('testNamespace')).toEqual('/testNamespace');
  expect(normalizeUri('  testNamespace  ')).toEqual('/testNamespace');
  expect(normalizeUri('part1/part2/part3')).toEqual('/part1/part2/part3');
  expect(normalizeUri('  part1 / part2 /  part3  ')).toEqual('/part1 / part2 /  part3');
  expect(normalizeUri(' //part1//part2/part3///  ')).toEqual('/part1/part2/part3');
});
