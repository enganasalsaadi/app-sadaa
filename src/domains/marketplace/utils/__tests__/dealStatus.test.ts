import {
  DEAL_ALLOWED_ACTIONS,
  DEAL_PIPELINE,
  DEAL_STATUS_META,
  UNKNOWN_DEAL_STATUS_META,
} from '../../constants/dealStatus';
import { DEAL_STATUS, isDealStatus } from '../../types';
import { buildDealProgress, getDealActions, getDealStatusMeta } from '../dealStatus';

describe('isDealStatus', () => {
  it('accepts backend values and rejects unknown ones', () => {
    DEAL_STATUS.forEach(status => expect(isDealStatus(status)).toBe(true));
    expect(isDealStatus('on_hold')).toBe(false);
    expect(isDealStatus(undefined)).toBe(false);
  });
});

describe('getDealStatusMeta', () => {
  it('uses the rule 08 badge tones', () => {
    expect(DEAL_STATUS_META.pending_approval.tone).toBe('info');
    expect(DEAL_STATUS_META.under_review.tone).toBe('info');
    expect(DEAL_STATUS_META.awaiting_payment.tone).toBe('warning');
    expect(DEAL_STATUS_META.in_progress.tone).toBe('interactive');
    expect(DEAL_STATUS_META.ready_to_publish.tone).toBe('interactive');
    expect(DEAL_STATUS_META.published.tone).toBe('interactive');
    expect(DEAL_STATUS_META.completed.tone).toBe('success');
    expect(DEAL_STATUS_META.disputed.tone).toBe('danger');
    expect(DEAL_STATUS_META.cancelled.tone).toBe('neutral');
    expect(DEAL_STATUS_META.refunded.tone).toBe('neutral');
  });

  it('falls back safely for an unknown status', () => {
    expect(getDealStatusMeta(null)).toBe(UNKNOWN_DEAL_STATUS_META);
    expect(getDealStatusMeta('completed')).toBe(DEAL_STATUS_META.completed);
  });
});

describe('getDealActions', () => {
  it.each([
    ['pending_approval', ['accept', 'decline'], ['cancel']],
    ['awaiting_payment', [], ['pay', 'cancel']],
    ['in_progress', ['submitDraft', 'openDispute'], ['openDispute']],
    ['under_review', [], ['approveDraft', 'requestChanges', 'openDispute']],
    ['ready_to_publish', ['submitProof', 'openDispute'], ['openDispute']],
    ['published', ['openDispute'], ['openDispute']],
    ['completed', [], []],
    ['disputed', [], []],
    ['cancelled', [], []],
    ['refunded', [], []],
  ] as const)('%s → creator %j, brand %j', (status, creator, brand) => {
    expect(getDealActions(status, 'creator')).toEqual(creator);
    expect(getDealActions(status, 'brand')).toEqual(brand);
  });

  it('only brands pay; only creators submit drafts and proof', () => {
    DEAL_STATUS.forEach(status => {
      expect(DEAL_ALLOWED_ACTIONS[status].creator).not.toContain('pay');
      expect(DEAL_ALLOWED_ACTIONS[status].brand).not.toContain('submitDraft');
      expect(DEAL_ALLOWED_ACTIONS[status].brand).not.toContain('submitProof');
    });
  });

  it('offers nothing for an unknown status', () => {
    expect(getDealActions(null, 'brand')).toEqual([]);
  });
});

describe('buildDealProgress', () => {
  it('marks earlier stages done, the current one current, later ones upcoming', () => {
    const steps = buildDealProgress('under_review');
    expect(steps.map(step => step.status)).toEqual([...DEAL_PIPELINE]);
    expect(steps.map(step => step.state)).toEqual([
      'done',
      'done',
      'done',
      'current',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });

  it('starts with the first stage current', () => {
    expect(buildDealProgress('pending_approval')[0]?.state).toBe('current');
  });

  it('marks every stage done once completed', () => {
    expect(buildDealProgress('completed').every(step => step.state === 'done')).toBe(true);
  });

  it('ends an off-path deal with an error step after the stage it stopped at', () => {
    expect(buildDealProgress('disputed', 'in_progress')).toEqual([
      { status: 'pending_approval', state: 'done' },
      { status: 'awaiting_payment', state: 'done' },
      { status: 'in_progress', state: 'done' },
      { status: 'disputed', state: 'error' },
    ]);
    expect(buildDealProgress('cancelled')).toEqual([{ status: 'cancelled', state: 'error' }]);
  });

  it('is empty for an unknown status', () => {
    expect(buildDealProgress(null)).toEqual([]);
  });
});
