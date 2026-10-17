import type { Deal, DealItemStatus, DealStatus } from '../../types';
import { dealDropView, dealPublishOpensAt } from '../dealDrop';

const MINUTE = 60_000;
const DROP_AT = Date.UTC(2026, 10, 1, 18);
const OPENS_AT = DROP_AT - 15 * MINUTE;

const deal = (
  status: DealStatus,
  items: DealItemStatus[],
  drop: Deal['drop'] = { dropAt: DROP_AT, publishOpensAt: OPENS_AT, publishOpen: false },
): Pick<Deal, 'drop' | 'status' | 'items'> => ({
  drop,
  status: { key: status, label: status },
  items: items.map(
    key => ({ id: key, status: { key, label: key } }) as unknown as Deal['items'][number],
  ),
});

describe('dealDropView', () => {
  it('has nothing for a direct deal, a campaign without a drop, or a deal that ended', () => {
    expect(dealDropView(deal('in_progress', ['pending'], null), DROP_AT)).toBeNull();
    expect(dealDropView(deal('completed', ['verified']), DROP_AT)).toBeNull();
    expect(dealDropView(deal('cancelled_by_influencer', ['pending']), DROP_AT)).toBeNull();
  });

  it('waits for the live link until its opening moment', () => {
    const view = dealDropView(deal('in_progress', ['pending']), OPENS_AT - MINUTE);
    expect(view).toMatchObject({ phase: 'upcoming', nextAt: OPENS_AT, late: false });
    expect(dealPublishOpensAt(deal('in_progress', ['pending']), OPENS_AT - MINUTE)).toBe(OPENS_AT);
  });

  it('opens the live link by the clock even when the deal copy is stale', () => {
    const view = dealDropView(deal('in_progress', ['approved_to_publish']), OPENS_AT);
    expect(view).toMatchObject({ phase: 'publish_open', nextAt: DROP_AT, late: false });
    expect(dealPublishOpensAt(deal('in_progress', ['approved_to_publish']), OPENS_AT)).toBeNull();
  });

  it('opens the live link when the server says so, ahead of the clock', () => {
    const open = deal('in_progress', ['approved_to_publish'], {
      dropAt: DROP_AT,
      publishOpensAt: OPENS_AT,
      publishOpen: true,
    });
    expect(dealDropView(open, OPENS_AT - 5 * MINUTE)?.phase).toBe('publish_open');
  });

  it('is live after the drop, late only while the creator still owes a deliverable', () => {
    expect(dealDropView(deal('in_progress', ['verified', 'verifying_live']), DROP_AT)).toMatchObject({
      phase: 'live',
      nextAt: null,
      late: false,
    });
    expect(dealDropView(deal('in_progress', ['verified', 'approved_to_publish']), DROP_AT + MINUTE)?.late).toBe(true);
    expect(dealDropView(deal('in_progress', ['pending']), DROP_AT)?.late).toBe(true);
    expect(dealDropView(deal('in_progress', ['revision_requested']), DROP_AT)?.late).toBe(true);
  });

  it('is never late before work started', () => {
    expect(dealDropView(deal('awaiting_payment', ['pending']), DROP_AT + MINUTE)?.late).toBe(false);
  });
});
