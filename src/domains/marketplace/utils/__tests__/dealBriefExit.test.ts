import type { Deal } from '../../types';
import { briefExitWindow, toBriefExitBody } from '../dealBriefExit';

const NOW = Date.UTC(2026, 9, 17, 12);
const HOUR = 3_600_000;

const withExit = (briefExitAvailable: boolean, briefExitUntil: number | null): Pick<Deal, 'cancellation'> => ({
  cancellation: {
    brand: null,
    creator: {
      withdrawAvailable: true,
      strike: true,
      refund: null,
      briefExitAvailable,
      briefExitUntil,
    },
  },
});

describe('briefExitWindow', () => {
  it('is open while the server says so and its end is ahead', () => {
    expect(briefExitWindow(withExit(true, NOW + HOUR), NOW)).toEqual({ until: NOW + HOUR });
  });

  it('is open without an end when the server gives none', () => {
    expect(briefExitWindow(withExit(true, null), NOW)).toEqual({ until: null });
  });

  it('closes on the clock once the end passes, before a refetch says so', () => {
    expect(briefExitWindow(withExit(true, NOW), NOW)).toBeNull();
    expect(briefExitWindow(withExit(true, NOW - HOUR), NOW)).toBeNull();
  });

  it('is shut when the server says so, or there is no cancellation block', () => {
    expect(briefExitWindow(withExit(false, NOW + HOUR), NOW)).toBeNull();
    expect(briefExitWindow({ cancellation: null }, NOW)).toBeNull();
  });
});

describe('toBriefExitBody', () => {
  it('sends the trimmed note', () => {
    expect(toBriefExitBody('  لا يناسبني  ')).toEqual({ note: 'لا يناسبني' });
  });

  it('leaves a blank note out', () => {
    expect(toBriefExitBody('   ')).toEqual({});
  });
});
