import type {
  DealItem,
  DealRetentionCase,
  DealRetentionWindow,
} from '../../types/deal';
import {
  isRetentionOpen,
  retentionCaseActions,
  retentionLives,
  retentionPhase,
  retentionShots,
  sortRetentionCases,
  toRetentionNoteBody,
  toRetentionReportBody,
  toRetentionRestoreBody,
} from '../dealRetention';

const DAY = 86_400_000;
const NOW = 100 * DAY;

const item = (overrides: Partial<DealItem> = {}): DealItem =>
  ({
    id: 'i1',
    title: 'Instagram reel',
    platform: 'instagram',
    retention: '30d',
    verifiedAt: NOW - 9 * DAY,
    ...overrides,
  } as DealItem);

const window = (
  overrides: Partial<DealRetentionWindow> = {},
): DealRetentionWindow => ({
  itemId: 'i1',
  endsAt: NOW + 21 * DAY,
  reportAvailable: true,
  openCaseId: null,
  ...overrides,
});

const file = (
  id: string,
  overrides: Partial<DealRetentionCase['reportFiles'][number]> = {},
) => ({
  id,
  kind: 'image' as const,
  name: `${id}.jpg`,
  mime: 'image/jpeg',
  size: 10,
  status: 'ready' as const,
  url: `https://files.example/${id}`,
  ...overrides,
});

const retentionCase = (
  overrides: Partial<DealRetentionCase> = {},
): DealRetentionCase => ({
  id: 'c1',
  itemId: 'i1',
  reason: { key: 'deleted', label: 'Deleted' },
  note: null,
  status: { key: 'awaiting_influencer', label: 'Awaiting influencer' },
  reportFiles: [],
  response: null,
  responseNote: null,
  restoredUrl: null,
  handleChecked: null,
  restoreFiles: [],
  respondedAt: null,
  brandDecision: null,
  brandNote: null,
  decidedAt: null,
  escalationReason: null,
  escalatedAt: null,
  closedReason: null,
  adminNote: null,
  clawback: null,
  dueAt: NOW + DAY,
  reportedAt: NOW - DAY,
  closedAt: null,
  ...overrides,
});

describe('retentionLives', () => {
  it('shares the time still to run over the whole period', () => {
    const [life] = retentionLives(
      { items: [item()], retention: [window()] },
      NOW,
    );
    expect(life).toMatchObject({
      itemId: 'i1',
      running: true,
      secondsLeft: 21 * 86_400,
      reported: false,
    });
    expect(life?.share).toBeCloseTo(0.7);
  });

  it('keeps a permanent post full while its report cap runs', () => {
    const [life] = retentionLives(
      { items: [item({ retention: 'permanent' })], retention: [window()] },
      NOW,
    );
    expect(life?.share).toBe(1);
  });

  it('ends once the period is over', () => {
    const [life] = retentionLives(
      {
        items: [item()],
        retention: [window({ endsAt: NOW - 1, reportAvailable: false })],
      },
      NOW,
    );
    expect(life).toMatchObject({ running: false, share: 0, secondsLeft: 0 });
  });

  it('flags an open report and skips windows without an end or an item', () => {
    const lives = retentionLives(
      {
        items: [item(), item({ id: 'i2' })],
        retention: [
          window({ openCaseId: 'c1' }),
          window({ itemId: 'i2', endsAt: null }),
          window({ itemId: 'gone' }),
        ],
      },
      NOW,
    );
    expect(lives).toHaveLength(1);
    expect(lives[0]?.reported).toBe(true);
  });
});

describe('retentionPhase', () => {
  it.each([
    ['awaiting_influencer', null, 'awaitingCreator'],
    ['awaiting_brand', null, 'awaitingBrand'],
    ['escalated', null, 'escalated'],
    ['closed', 'confirmed', 'restored'],
    ['closed', 'auto_confirmed', 'restored'],
    ['closed', 'upheld', 'upheld'],
    ['closed', 'dismissed', 'dismissed'],
    ['closed', 'something_new', 'closed'],
  ] as const)('%s / %s → %s', (key, closedReason, phase) => {
    expect(retentionPhase({ status: { key, label: key }, closedReason })).toBe(
      phase,
    );
  });

  it('falls back to closed for an unknown status', () => {
    expect(
      retentionPhase({
        status: { key: null, label: 'New' },
        closedReason: null,
      }),
    ).toBe('closed');
  });

  it('counts only the waiting phases as open', () => {
    expect(isRetentionOpen('awaitingCreator')).toBe(true);
    expect(isRetentionOpen('escalated')).toBe(true);
    expect(isRetentionOpen('upheld')).toBe(false);
  });
});

describe('retentionCaseActions', () => {
  it('lets only the side the case waits on answer', () => {
    expect(retentionCaseActions('awaitingCreator', 'creator')).toEqual([
      'restore',
      'contest',
    ]);
    expect(retentionCaseActions('awaitingCreator', 'brand')).toEqual([]);
    expect(retentionCaseActions('awaitingBrand', 'brand')).toEqual([
      'confirm',
      'reject',
    ]);
    expect(retentionCaseActions('awaitingBrand', 'creator')).toEqual([]);
    expect(retentionCaseActions('escalated', 'brand')).toEqual([]);
  });
});

describe('sortRetentionCases', () => {
  it('puts open cases first, newest report first in each group', () => {
    const closedNew = retentionCase({
      id: 'closedNew',
      status: { key: 'closed', label: '' },
      reportedAt: 5,
    });
    const openOld = retentionCase({ id: 'openOld', reportedAt: 1 });
    const openNew = retentionCase({
      id: 'openNew',
      status: { key: 'escalated', label: '' },
      reportedAt: 3,
    });
    expect(
      sortRetentionCases([closedNew, openOld, openNew]).map(c => c.id),
    ).toEqual(['openNew', 'openOld', 'closedNew']);
  });
});

describe('retentionShots', () => {
  it('keeps viewable images only', () => {
    expect(
      retentionShots([
        file('a'),
        file('b', { url: null }),
        file('c', { kind: 'document' }),
      ]),
    ).toEqual(['https://files.example/a']);
  });
});

describe('bodies', () => {
  it('sends an empty report note as null', () => {
    expect(
      toRetentionReportBody({ reason: 'deleted', note: '  ' }, ['f1']),
    ).toEqual({
      reason: 'deleted',
      note: null,
      file_ids: ['f1'],
    });
    expect(
      toRetentionReportBody({ reason: 'other', note: ' gone ' }, ['f1']).note,
    ).toBe('gone');
  });

  it('leaves an empty restore link out', () => {
    expect(toRetentionRestoreBody(' ', ['f1'])).toEqual({ file_ids: ['f1'] });
    expect(
      toRetentionRestoreBody(' https://instagram.com/p/x ', ['f1']),
    ).toEqual({
      url: 'https://instagram.com/p/x',
      file_ids: ['f1'],
    });
  });

  it('trims the note', () => {
    expect(toRetentionNoteBody(' still live ')).toEqual({ note: 'still live' });
  });
});
