import { fileValue } from './FileValueField';

test('value', async () => {
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  expect(await fileValue(file)).toEqual('dGVzdA==');
});
