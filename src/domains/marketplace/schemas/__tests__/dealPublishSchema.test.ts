import type { TFunction } from 'i18next';
import { createDealFixSchema, createDealPublishSchema } from '../dealPublishSchema';

const t = ((key: string) => key) as unknown as TFunction;

const failure = (fn: () => unknown): { type: string; message: string } | null => {
  try {
    fn();
    return null;
  } catch (err) {
    const { type, message } = err as { type: string; message: string };
    return { type, message };
  }
};

describe('createDealPublishSchema', () => {
  const schema = createDealPublishSchema(t, 'instagram');

  it('needs the link when the item has a platform', () => {
    expect(failure(() => schema.validateSync({ url: '  ' }))?.message).toBe('marketplace.deals.publish.link.required');
  });

  it('names the problem with the server reason codes', () => {
    expect(failure(() => schema.validateSync({ url: 'instagram' }))?.type).toBe('invalid');
    expect(failure(() => schema.validateSync({ url: 'https://tiktok.com/@a/video/1' }))?.type).toBe('platform_mismatch');
  });

  it('accepts a link on the item platform', () => {
    expect(failure(() => schema.validateSync({ url: 'https://www.instagram.com/reel/abc' }))).toBeNull();
  });

  it('makes the link optional for an item with no platform, but still checks one if given', () => {
    const visit = createDealPublishSchema(t, null);
    expect(failure(() => visit.validateSync({ url: '' }))).toBeNull();
    expect(failure(() => visit.validateSync({ url: 'nope' }))?.type).toBe('invalid');
    expect(failure(() => visit.validateSync({ url: 'https://example.com/event' }))).toBeNull();
  });
});

describe('createDealFixSchema', () => {
  const schema = createDealFixSchema(t);

  it('needs a note', () => {
    expect(failure(() => schema.validateSync({ note: '   ' }))?.message).toBe('marketplace.deals.publish.fix.required');
  });

  it('caps the note at 2000 characters', () => {
    expect(failure(() => schema.validateSync({ note: 'x'.repeat(2000) }))).toBeNull();
    expect(failure(() => schema.validateSync({ note: 'x'.repeat(2001) }))?.message).toBe('validation.maxLength');
  });
});
