import { parseSocialsDraft } from '../socialsDraft';

const PHONE = '+963944123456';
const account = { platform: 'instagram', username: 'ahmad', followerTier: 'MICRO' };

describe('parseSocialsDraft', () => {
  it('restores a draft saved for the same phone', () => {
    const raw = JSON.stringify({ phone: PHONE, niches: ['beauty'], platforms: [account] });
    expect(parseSocialsDraft(raw, PHONE)).toEqual({ niches: ['beauty'], platforms: [account] });
  });

  it('ignores a draft from another registration', () => {
    const raw = JSON.stringify({ phone: '+963933000000', niches: ['beauty'], platforms: [] });
    expect(parseSocialsDraft(raw, PHONE)).toBeNull();
  });

  it('drops malformed entries and keeps the valid ones', () => {
    const raw = JSON.stringify({
      phone: PHONE,
      niches: ['beauty', 3],
      platforms: [account, { platform: 'website', username: 'x', followerTier: 'NANO' }, null],
    });
    expect(parseSocialsDraft(raw, PHONE)).toEqual({ niches: ['beauty'], platforms: [account] });
  });

  it('survives corrupt JSON and missing input', () => {
    expect(parseSocialsDraft('{oops', PHONE)).toBeNull();
    expect(parseSocialsDraft(undefined, PHONE)).toBeNull();
    expect(parseSocialsDraft('{}', null)).toBeNull();
  });
});
