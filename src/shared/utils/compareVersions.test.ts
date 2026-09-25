import { compareVersions } from './compareVersions';

describe('compareVersions', () => {
  it.each([
    ['1.0.0', '1.0.0', 0],
    ['1.2', '1.2.0', 0],
    ['v1.2.3', '1.2.3', 0],
    ['1.2.3-beta', '1.2.3', 0],
    ['1.2.3+45', '1.2.3', 0],
    ['1.2.3', '1.2.4', -1],
    ['1.9.0', '1.10.0', -1],
    ['2.0.0', '1.99.99', 1],
    ['1.0.1', '1.0', 1],
    ['', '0.0.0', 0],
    ['abc', '0.0.1', -1],
  ] as const)('%s vs %s → %d', (a, b, expected) => {
    expect(compareVersions(a, b)).toBe(expected);
  });
});
