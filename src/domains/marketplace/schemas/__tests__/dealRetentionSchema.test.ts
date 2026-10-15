import type { TFunction } from 'i18next';
import {
  createDealRetentionNoteSchema,
  createDealRetentionReportSchema,
  createDealRetentionRestoreSchema,
} from '../dealRetentionSchema';

jest.mock(
  'lucide-react-native',
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === '__esModule' ? undefined : name) },
    ),
);

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealRetentionReportSchema', () => {
  const schema = createDealRetentionReportSchema(t);

  it('needs one of the server’s reasons', () => {
    expect(
      messageOf(() => schema.validateSync({ reason: null, note: '' })),
    ).toBe('marketplace.deals.changes.reasonError');
    expect(
      messageOf(() => schema.validateSync({ reason: 'stolen', note: '' })),
    ).toBe('marketplace.deals.changes.reasonError');
  });

  it('takes no note unless the reason is other', () => {
    expect(
      messageOf(() => schema.validateSync({ reason: 'deleted', note: '' })),
    ).toBeNull();
    expect(
      messageOf(() => schema.validateSync({ reason: 'other', note: '  ' })),
    ).toBe('marketplace.deals.retention.report.noteRequired');
    expect(
      messageOf(() =>
        schema.validateSync({ reason: 'other', note: 'Link is dead' }),
      ),
    ).toBeNull();
  });

  it('caps the note at 1000 characters', () => {
    expect(
      messageOf(() =>
        schema.validateSync({ reason: 'edited', note: 'x'.repeat(1001) }),
      ),
    ).toBe('validation.maxLength');
  });
});

describe('createDealRetentionRestoreSchema', () => {
  const schema = createDealRetentionRestoreSchema(t);

  it('lets the link stay empty', () => {
    expect(messageOf(() => schema.validateSync({ url: '' }))).toBeNull();
  });

  it('refuses a malformed link with the server reason', () => {
    expect(
      messageOf(() => schema.validateSync({ url: 'instagram post' })),
    ).toBe('marketplace.deals.publish.reason.invalid.title');
    expect(
      messageOf(() =>
        schema.validateSync({ url: 'https://www.instagram.com/p/C9x' }),
      ),
    ).toBeNull();
  });
});

describe('createDealRetentionNoteSchema', () => {
  const schema = createDealRetentionNoteSchema(
    t,
    'marketplace.deals.retention.contest.required',
  );

  it('needs a note, trimmed, at most 1000 characters', () => {
    expect(messageOf(() => schema.validateSync({ note: '   ' }))).toBe(
      'marketplace.deals.retention.contest.required',
    );
    expect(
      messageOf(() => schema.validateSync({ note: 'x'.repeat(1001) })),
    ).toBe('validation.maxLength');
    expect(
      messageOf(() =>
        schema.validateSync({ note: 'Still live on my account' }),
      ),
    ).toBeNull();
  });
});
