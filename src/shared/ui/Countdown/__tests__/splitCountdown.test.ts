import { splitCountdown } from '../splitCountdown';

describe('splitCountdown', () => {
  it('shows days + hours above a day', () => {
    expect(splitCountdown(2 * 86400 + 4 * 3600 + 59)).toEqual({ kind: 'days', days: 2, hours: 4 });
    expect(splitCountdown(86400)).toEqual({ kind: 'days', days: 1, hours: 0 });
  });

  it('shows hours + minutes within a day', () => {
    expect(splitCountdown(86399)).toEqual({ kind: 'hours', hours: 23, minutes: 59 });
    expect(splitCountdown(3600)).toEqual({ kind: 'hours', hours: 1, minutes: 0 });
  });

  it('shows minutes + seconds within the last hour', () => {
    expect(splitCountdown(3599)).toEqual({ kind: 'minutes', minutes: 59, seconds: 59 });
    expect(splitCountdown(1)).toEqual({ kind: 'minutes', minutes: 0, seconds: 1 });
  });

  it('expires at zero or below', () => {
    expect(splitCountdown(0)).toEqual({ kind: 'expired' });
    expect(splitCountdown(-5)).toEqual({ kind: 'expired' });
  });
});
