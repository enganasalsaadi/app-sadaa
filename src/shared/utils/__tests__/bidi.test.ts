import { isolateLtr, isolateText } from '../bidi';

describe('bidi isolates', () => {
  it('wraps a name in a first-strong isolate', () => {
    expect(isolateText('Test Brand 10')).toBe('⁨Test Brand 10⁩');
  });

  it('wraps a link in a left-to-right isolate', () => {
    expect(isolateLtr('youtube.com/watch?v=1')).toBe('⁦youtube.com/watch?v=1⁩');
  });

  it('leaves empty text alone', () => {
    expect(isolateText('')).toBe('');
    expect(isolateLtr('')).toBe('');
  });
});
