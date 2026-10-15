import type { DealBrief, DealDraft, DealItemStatus } from '../../types';
import {
  captionTokens,
  dealDeliverableAction,
  dealRevisionAsk,
  dealRounds,
  formatTimecode,
  insertCaptionToken,
  isTokenInCaption,
  pinFileNumber,
  readExtraRevisionAvailable,
  toRevisionBody,
} from '../dealDrafts';

const item = (key: DealItemStatus | null, approveAsIsAvailable = false) => ({
  status: { key, label: key ?? 'unknown' },
  approveAsIsAvailable,
});

const brief = (patch: Partial<DealBrief> = {}): DealBrief => ({
  hashtags: [],
  mentions: [],
  talkingPoints: [],
  donts: [],
  promoCode: null,
  trackingLink: null,
  ...patch,
});

const draft = (patch: Partial<DealDraft> = {}): DealDraft => ({
  id: 'draft-2',
  itemId: 'item-1',
  round: 2,
  caption: 'caption',
  submittedAt: 0,
  files: [
    { id: 'f1', kind: 'video', name: 'a.mp4', mime: 'video/mp4', size: 10, status: 'ready', url: null },
    { id: 'f2', kind: 'image', name: 'b.jpg', mime: 'image/jpeg', size: 10, status: 'ready', url: null },
  ],
  review: null,
  ...patch,
});

describe('dealDeliverableAction', () => {
  it('asks the creator to hand in while pending or after a revision request', () => {
    expect(dealDeliverableAction(item('pending'), 'creator')).toBe('submit');
    expect(dealDeliverableAction(item('revision_requested'), 'creator')).toBe('submit');
  });

  it('asks the brand to review a handed-in round', () => {
    expect(dealDeliverableAction(item('draft_submitted'), 'brand')).toBe('review');
  });

  it('offers approve-as-is only when the server says so', () => {
    expect(dealDeliverableAction(item('revision_requested'), 'brand')).toBe('view');
    expect(dealDeliverableAction(item('revision_requested', true), 'brand')).toBe('approveAsIs');
  });

  it('has nothing to show before the first hand-in or for an unknown status', () => {
    expect(dealDeliverableAction(item('pending'), 'brand')).toBeNull();
    expect(dealDeliverableAction(item(null), 'creator')).toBeNull();
  });

  it('asks the creator to publish an approved item and the brand to verify the live post', () => {
    expect(dealDeliverableAction(item('approved_to_publish'), 'creator')).toBe('publish');
    expect(dealDeliverableAction(item('verifying_live'), 'brand')).toBe('verify');
    expect(dealDeliverableAction(item('verifying_live'), 'creator')).toBe('view');
    expect(dealDeliverableAction(item('verified'), 'brand')).toBe('view');
  });

  it('lets either side look at a round once one exists', () => {
    expect(dealDeliverableAction(item('draft_submitted'), 'creator')).toBe('view');
    expect(dealDeliverableAction(item('approved_to_publish'), 'brand')).toBe('view');
  });
});

describe('dealRounds', () => {
  it('draws the first hand-in plus each allowed revision', () => {
    expect(dealRounds({ revisionsAllowed: 2, revisionsUsed: 1, revisionsLeft: 1 })).toEqual({
      current: 2,
      bars: [
        { round: 1, state: 'revised' },
        { round: 2, state: 'current' },
        { round: 3, state: 'open' },
      ],
      remaining: 1,
      allowed: 2,
    });
  });

  it('keeps every used round when an extra one was bought', () => {
    expect(
      dealRounds({ revisionsAllowed: 1, revisionsUsed: 2, revisionsLeft: 0 }).bars.map(bar => bar.state),
    ).toEqual(['revised', 'revised', 'current']);
  });

  it('has a single bar with no revisions', () => {
    expect(dealRounds({ revisionsAllowed: 0, revisionsUsed: 0, revisionsLeft: 0 }).bars).toEqual([
      { round: 1, state: 'current' },
    ]);
  });
});

describe('formatTimecode', () => {
  it.each([
    [0, '0:00'],
    [12.9, '0:12'],
    [245, '4:05'],
    [3723, '1:02:03'],
    [-3, '0:00'],
  ])('%p → %p', (seconds, text) => {
    expect(formatTimecode(seconds)).toBe(text);
  });
});

describe('caption tokens', () => {
  it('prefixes mentions and hashtags, adds the promo code and drops duplicates', () => {
    expect(
      captionTokens(
        brief({ mentions: ['sham.coffee'], hashtags: ['#قهوة', 'قهوة', ' '], promoCode: ' LIN15 ' }),
      ),
    ).toEqual([
      { kind: 'mention', text: '@sham.coffee' },
      { kind: 'hashtag', text: '#قهوة' },
      { kind: 'promo', text: 'LIN15' },
    ]);
    expect(captionTokens(null)).toEqual([]);
  });

  it('finds a token whatever its case', () => {
    expect(isTokenInCaption('code lin15 today', 'LIN15')).toBe(true);
    expect(isTokenInCaption('code today', 'LIN15')).toBe(false);
  });

  it('appends a token after one space and refuses to pass the cap', () => {
    expect(insertCaptionToken('', '#a')).toBe('#a ');
    expect(insertCaptionToken('hello  ', '#a')).toBe('hello #a ');
    expect(insertCaptionToken('x'.repeat(2198), '#a')).toBeNull();
  });
});

describe('dealRevisionAsk', () => {
  const asked = draft({
    review: {
      decision: { key: 'revision_requested', label: 'Revision requested' },
      by: 'brand',
      note: 'Louder voice',
      pins: [],
      reviewedAt: 0,
    },
  });

  it('is the latest round when the brand asked for changes on it', () => {
    expect(dealRevisionAsk([asked, draft({ id: 'draft-1', round: 1 })])).toBe(asked);
  });

  it('is null while waiting or after approval', () => {
    expect(dealRevisionAsk([draft()])).toBeNull();
    expect(dealRevisionAsk([])).toBeNull();
  });
});

describe('pins', () => {
  it('numbers the pinned file in its round', () => {
    expect(pinFileNumber(draft(), { fileId: 'f2' })).toBe(2);
    expect(pinFileNumber(draft(), { fileId: 'gone' })).toBe(0);
  });

  it('builds the revision body with trimmed notes', () => {
    expect(
      toRevisionBody(' Fix the sound ', [
        { fileId: 'f1', atSecond: 12, note: ' music too loud ' },
        { fileId: 'f2', atSecond: null, note: 'logo cut' },
      ]),
    ).toEqual({
      note: 'Fix the sound',
      pins: [
        { file_id: 'f1', at_second: 12, note: 'music too loud' },
        { file_id: 'f2', at_second: null, note: 'logo cut' },
      ],
    });
  });
});

describe('readExtraRevisionAvailable', () => {
  it('reads the 409 meta flag', () => {
    expect(readExtraRevisionAvailable({ meta: { extra_revision_available: true } })).toBe(true);
    expect(readExtraRevisionAvailable({ meta: { extra_revision_available: false } })).toBe(false);
    expect(readExtraRevisionAvailable('oops')).toBe(false);
  });
});
