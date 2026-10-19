import { needsFirst } from '../hubList';

describe('needsFirst', () => {
  it('moves what waits to the front and keeps the order inside each half', () => {
    expect(needsFirst([1, 2, 3, 4, 5], n => n % 2 === 0)).toEqual([2, 4, 1, 3, 5]);
  });
});
