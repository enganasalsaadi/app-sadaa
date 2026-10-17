import {
  DEAL_ITEM_ACTIONS,
  DEAL_STATUS_ACTIONS,
  DEAL_STATUS_META,
  UNKNOWN_DEAL_STATUS_META,
} from '../../constants/dealStatus';
import { DEAL_STATUS, isDealItemStatus, isDealStatus } from '../../types';
import type { DealItemStatus, DealStatus } from '../../types';
import { buildDealProgress, getDealActions, getDealItemActions, getDealStatusMeta } from '../dealStatus';
import type { DealActionInput } from '../dealStatus';

const NOW = Date.UTC(2026, 9, 13, 12);

const input = (status: DealStatus | null, extra: Partial<DealActionInput> = {}): DealActionInput => ({
  status: { key: status, label: '' },
  cancellation: null,
  shipping: null,
  dispute: null,
  disputeWindow: { open: false, closedReason: null, disputesLeft: 1 },
  upsells: [],
  upsellWindow: { open: false, closedReason: null, pendingUpsellId: null },
  rating: null,
  retention: [],
  retentionCases: [],
  ...extra,
});

const item = (status: DealItemStatus | null, approveAsIsAvailable = false) => ({
  status: { key: status, label: '' },
  approveAsIsAvailable,
});

describe('status guards', () => {
  it('accepts the 22 backend statuses and rejects unknown ones', () => {
    expect(DEAL_STATUS).toHaveLength(22);
    DEAL_STATUS.forEach(status => expect(isDealStatus(status)).toBe(true));
    expect(isDealStatus('pending_approval')).toBe(false);
    expect(isDealStatus(undefined)).toBe(false);
    expect(isDealItemStatus('verifying_live')).toBe(true);
    expect(isDealItemStatus('published')).toBe(false);
  });
});

describe('getDealStatusMeta', () => {
  it('tones money waits warning, live work teal, finals neutral', () => {
    expect(DEAL_STATUS_META.awaiting_payment.tone).toBe('warning');
    expect(DEAL_STATUS_META.shipping_issue.tone).toBe('warning');
    expect(DEAL_STATUS_META.in_progress.tone).toBe('interactive');
    expect(DEAL_STATUS_META.disputed.tone).toBe('danger');
    expect(DEAL_STATUS_META.completed.tone).toBe('success');
    expect(DEAL_STATUS_META.cancelled_by_brand.tone).toBe('neutral');
  });

  it('classifies every final status as success or stopped', () => {
    const finals = DEAL_STATUS.filter(status => DEAL_STATUS_META[status].outcome !== 'open');
    expect(finals).toEqual([
      'completed',
      'declined',
      'expired',
      'cancelled_pre_escrow',
      'cancelled_payment_timeout',
      'cancelled_by_brand',
      'cancelled_with_kill_fee',
      'cancelled_by_influencer',
      'cancelled_shipping_timeout',
      'creator_defaulted',
      'resolved_refund',
      'resolved_payout',
      'resolved_split',
    ]);
  });

  it('falls back safely for an unknown status', () => {
    expect(getDealStatusMeta(null)).toBe(UNKNOWN_DEAL_STATUS_META);
  });
});

describe('getDealActions', () => {
  it.each([
    ['draft', ['sendOffer', 'editDraft', 'deleteDraft'], []],
    ['pending_influencer', ['withdrawOffer'], ['accept', 'decline', 'requestExtension']],
    ['negotiating_deadline', ['answerExtension'], []],
    ['awaiting_payment', ['fund'], []],
    ['product_shipping', ['ship'], ['receiveShipment', 'reportIssue']],
    ['shipping_issue', ['answerIssue'], []],
    ['in_progress', [], []],
    ['completed', [], []],
    ['expired', [], []],
  ] as const)('%s → brand %j, creator %j', (status, brand, creator) => {
    expect(getDealActions(input(status), 'brand', NOW)).toEqual(brand);
    expect(getDealActions(input(status), 'creator', NOW)).toEqual(creator);
  });

  it('only brands fund, ship and propose; only creators accept and withdraw', () => {
    DEAL_STATUS.forEach(status => {
      const { brand, creator } = DEAL_STATUS_ACTIONS[status];
      (['fund', 'ship', 'proposeUpsell', 'cancel'] as const).forEach(a =>
        expect(creator as readonly string[]).not.toContain(a),
      );
      (['accept', 'withdraw', 'receiveShipment'] as const).forEach(a =>
        expect(brand as readonly string[]).not.toContain(a),
      );
    });
  });

  it('adds cancel / withdraw from the cancellation block', () => {
    const deal = input('in_progress', {
      cancellation: {
        brand: {
          outcome: { key: 'kill_fee', label: '' },
          freeUntil: null,
          refund: null,
          killFee: null,
          platformFee: null,
          creatorNet: null,
        },
        creator: { withdrawAvailable: true, strike: true, refund: null, briefExitAvailable: false, briefExitUntil: null },
      },
    });
    expect(getDealActions(deal, 'brand', NOW)).toEqual(['cancel']);
    expect(getDealActions(deal, 'creator', NOW)).toEqual(['withdraw']);
  });

  it('offers the free shipping cancel only once its time has come', () => {
    const at = (freeCancelFrom: number) =>
      input('product_shipping', { shipping: { shipFrom: null, shipBy: null, reshipsLeft: 1, freeCancelFrom, shipments: [], address: null, addressEditable: false } });
    expect(getDealActions(at(NOW - 1), 'creator', NOW)).toContain('freeCancel');
    expect(getDealActions(at(NOW + 1), 'creator', NOW)).not.toContain('freeCancel');
    expect(getDealActions(at(NOW - 1), 'brand', NOW)).not.toContain('freeCancel');
  });

  it('follows the upsell, dispute, retention and rating windows', () => {
    const deal = input('completed', {
      upsellWindow: { open: true, closedReason: null, pendingUpsellId: null },
      disputeWindow: { open: true, closedReason: null, disputesLeft: 1 },
      retention: [{ itemId: 'i1', endsAt: null, reportAvailable: true, openCaseId: null }],
      rating: {
        open: true,
        dueAt: null,
        revealedAt: null,
        brand: { answered: true, revealed: null },
        creator: { answered: false, revealed: null },
      },
    });
    expect(getDealActions(deal, 'brand', NOW)).toEqual(['proposeUpsell', 'openDispute', 'reportRetention']);
    expect(getDealActions(deal, 'creator', NOW)).toEqual(['openDispute', 'rate']);
  });

  it('lets both sides add evidence only while the dispute evidence window is open', () => {
    const dispute = (evidenceOpen: boolean): DealActionInput['dispute'] => ({
      id: 'd1',
      status: { key: 'open', label: '' },
      openedBy: 'brand',
      reason: { key: 'poor_quality', label: '' },
      statement: '',
      priorStatus: 'in_progress',
      evidenceOpen,
      evidenceDueAt: null,
      evidenceClosedAt: null,
      adminTargetAt: null,
      withdrawnAt: null,
      ruling: null,
      openedAt: null,
      closedAt: null,
    });
    expect(getDealActions(input('disputed', { dispute: dispute(true) }), 'creator', NOW)).toEqual(['addEvidence']);
    expect(getDealActions(input('disputed', { dispute: dispute(false) }), 'brand', NOW)).toEqual([]);
  });

  it('offers nothing for an unknown status', () => {
    expect(getDealActions(input(null), 'brand', NOW)).toEqual([]);
  });
});

describe('getDealItemActions', () => {
  it('splits draft, review, publish and verify between the roles', () => {
    expect(getDealItemActions(item('pending'), 'creator')).toEqual(['submitDraft']);
    expect(getDealItemActions(item('draft_submitted'), 'brand')).toEqual(['reviewDraft']);
    expect(getDealItemActions(item('revision_requested'), 'creator')).toEqual(['submitDraft']);
    expect(getDealItemActions(item('approved_to_publish'), 'creator')).toEqual(['publish']);
    expect(getDealItemActions(item('verifying_live'), 'brand')).toEqual(['verifyPost']);
    expect(getDealItemActions(item('verified'), 'brand')).toEqual([]);
    expect(DEAL_ITEM_ACTIONS.verified.creator).toEqual([]);
  });

  it('adds approve-as-is for the brand when the server allows it', () => {
    expect(getDealItemActions(item('revision_requested', true), 'brand')).toEqual(['approveAsIs']);
    expect(getDealItemActions(item('revision_requested', true), 'creator')).toEqual(['submitDraft']);
    expect(getDealItemActions(item(null), 'brand')).toEqual([]);
  });
});

describe('buildDealProgress', () => {
  const states = (steps: ReturnType<typeof buildDealProgress>) => steps.map(s => `${s.phase}:${s.state}`);

  it('skips the shipping phase for digital-only deals', () => {
    expect(states(buildDealProgress({ status: 'pending_influencer', stage: null, hasShipping: false }))).toEqual([
      'offer:current',
      'funding:upcoming',
      'creating:upcoming',
      'publishing:upcoming',
      'done:upcoming',
    ]);
  });

  it('places in-progress deals by their slowest item', () => {
    expect(states(buildDealProgress({ status: 'in_progress', stage: 'draft_submitted', hasShipping: true }))).toEqual([
      'offer:done',
      'funding:done',
      'shipping:done',
      'creating:current',
      'publishing:upcoming',
      'done:upcoming',
    ]);
    expect(
      buildDealProgress({ status: 'in_progress', stage: 'verifying_live', hasShipping: false }).find(
        s => s.state === 'current',
      )?.phase,
    ).toBe('publishing');
  });

  it('marks every phase done once completed or paid out', () => {
    ['completed', 'resolved_payout'].forEach(status =>
      expect(
        buildDealProgress({ status: status as DealStatus, stage: null, hasShipping: true }).every(
          s => s.state === 'done',
        ),
      ).toBe(true),
    );
  });

  it('marks the phase a dispute froze as error', () => {
    expect(
      states(
        buildDealProgress({ status: 'disputed', stage: null, hasShipping: true, frozenFrom: 'product_shipping' }),
      ),
    ).toEqual(['offer:done', 'funding:done', 'shipping:error', 'creating:upcoming', 'publishing:upcoming', 'done:upcoming']);
  });

  it('is empty for drafts, stopped deals, unknown statuses and disputes without a prior status', () => {
    expect(buildDealProgress({ status: 'draft', stage: null, hasShipping: false })).toEqual([]);
    expect(buildDealProgress({ status: 'cancelled_by_brand', stage: null, hasShipping: false })).toEqual([]);
    expect(buildDealProgress({ status: null, stage: null, hasShipping: false })).toEqual([]);
    expect(buildDealProgress({ status: 'disputed', stage: null, hasShipping: false })).toEqual([]);
  });
});
