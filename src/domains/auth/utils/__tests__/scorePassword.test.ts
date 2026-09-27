import { scorePassword } from '../scorePassword';

describe('scorePassword', () => {
  it.each([
    ['', 0],
    ['abc1', 1],
    ['abcdefgh', 1],
    ['12345678', 1],
    ['abcd1234', 2],
    ['abcd1234!', 3],
    ['abcdefgh1234', 3],
  ] as const)('%p → %d', (password, score) => {
    expect(scorePassword(password)).toBe(score);
  });
});
