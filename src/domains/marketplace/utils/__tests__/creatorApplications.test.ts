import { APPLICATION_TAB_ARGS } from '../../constants/opportunities';
import {
  APPLICATION_WINDOW_MS,
  applicationTarget,
  applicationTone,
  applicationWindow,
  isPendingApplication,
} from '../creatorApplications';

const HOUR = 3_600_000;
const NOW = 1_000_000_000;

const status = (key: string) => ({ key, label: key }) as never;
const state = (key: string, source: 'deal' | 'application') => ({ key, label: key, source });

describe('applicationWindow', () => {
  it('starts full and drains toward the brand’s deadline', () => {
    expect(applicationWindow(NOW + APPLICATION_WINDOW_MS, NOW).progress).toBe(1);
    expect(applicationWindow(NOW + 36 * HOUR, NOW).progress).toBe(0.5);
  });

  it('counts whole hours, rounding up', () => {
    expect(applicationWindow(NOW + 51 * HOUR - 1000, NOW).hoursLeft).toBe(51);
    expect(applicationWindow(NOW + 1000, NOW).hoursLeft).toBe(1);
  });

  it('turns urgent inside the last six hours only', () => {
    expect(applicationWindow(NOW + 7 * HOUR, NOW).urgent).toBe(false);
    expect(applicationWindow(NOW + 5 * HOUR, NOW).urgent).toBe(true);
  });

  it('is expired, empty and not urgent once the time is up', () => {
    expect(applicationWindow(NOW, NOW)).toEqual({ progress: 0, hoursLeft: 0, urgent: false, expired: true });
    expect(applicationWindow(NOW - HOUR, NOW).expired).toBe(true);
  });

  it('never draws more than a full ring', () => {
    expect(applicationWindow(NOW + 100 * HOUR, NOW).progress).toBe(1);
  });
});

describe('isPendingApplication', () => {
  it.each([
    ['submitted', true],
    ['shortlisted', true],
    ['selected', false],
    ['withdrawn', false],
    ['expired', false],
    ['not_selected', false],
  ])('%s → %s', (key, pending) => {
    expect(isPendingApplication({ status: status(key) })).toBe(pending);
  });
});

describe('applicationTone', () => {
  it('follows the application while it waits', () => {
    expect(applicationTone({ status: status('submitted'), state: state('submitted', 'application') })).toBe('info');
    expect(applicationTone({ status: status('shortlisted'), state: state('shortlisted', 'application') })).toBe(
      'interactive',
    );
  });

  it('keeps every closed outcome neutral, «not selected» included', () => {
    ['not_selected', 'rejected', 'expired', 'withdrawn', 'cancelled'].forEach(key => {
      expect(applicationTone({ status: status(key), state: state(key, 'application') })).toBe('neutral');
    });
  });

  it('follows the deal’s stage once selected', () => {
    expect(applicationTone({ status: status('selected'), state: state('awaiting_payment', 'deal') })).toBe('warning');
    expect(applicationTone({ status: status('selected'), state: state('escrow_locked', 'deal') })).toBe('money');
  });

  it('treats a stage the app has no meta for as work in progress', () => {
    expect(applicationTone({ status: status('selected'), state: state('draft_submitted', 'deal') })).toBe('interactive');
  });
});

describe('applicationTarget', () => {
  const campaign = { id: 'c1' } as never;

  it('opens the deal when there is one', () => {
    expect(applicationTarget({ campaign, deal: { id: 'd1', status: status('in_progress') } })).toEqual({
      kind: 'deal',
      id: 'd1',
    });
  });

  it('opens the campaign page otherwise', () => {
    expect(applicationTarget({ campaign, deal: null })).toEqual({ kind: 'campaign', id: 'c1' });
  });
});

describe('APPLICATION_TAB_ARGS', () => {
  it('asks for the statuses of each tab', () => {
    expect(APPLICATION_TAB_ARGS.open.statuses).toEqual(['submitted', 'shortlisted']);
    expect(APPLICATION_TAB_ARGS.selected.statuses).toEqual(['selected']);
    expect(APPLICATION_TAB_ARGS.closed.statuses).toEqual(['expired', 'rejected', 'not_selected', 'withdrawn', 'cancelled']);
  });
});
