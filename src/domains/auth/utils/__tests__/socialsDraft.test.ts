import { parseSocialsDraft } from '../socialsDraft';

const PHONE = '+963944123456';
const account = {
  platform: 'instagram',
  handle: 'ahmad',
  followerTier: 'MICRO',
  tierSource: 'auto',
  isPrimary: true,
};

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
      platforms: [account, { platform: 'website', handle: 'x', followerTier: 'NANO' }, null],
    });
    expect(parseSocialsDraft(raw, PHONE)).toEqual({ niches: ['beauty'], platforms: [account] });
  });

  it('migrates drafts saved before the handle rename as manual tiers', () => {
    const legacy = { platform: 'tiktok', username: 'ahmad', followerTier: 'NANO' };
    const raw = JSON.stringify({ phone: PHONE, niches: [], platforms: [legacy] });
    expect(parseSocialsDraft(raw, PHONE)?.platforms).toEqual([
      { platform: 'tiktok', handle: 'ahmad', followerTier: 'NANO', tierSource: 'manual', isPrimary: false },
    ]);
  });

  it('keeps a tierless account only when a lookup found it', () => {
    const found = { platform: 'youtube', handle: 'ahmad', followerTier: null, tierSource: 'auto', isPrimary: false };
    const manual = { ...found, platform: 'tiktok', tierSource: 'manual' };
    const raw = JSON.stringify({ phone: PHONE, niches: [], platforms: [found, manual] });
    expect(parseSocialsDraft(raw, PHONE)?.platforms).toEqual([found]);
  });

  it('survives corrupt JSON and missing input', () => {
    expect(parseSocialsDraft('{oops', PHONE)).toBeNull();
    expect(parseSocialsDraft(undefined, PHONE)).toBeNull();
    expect(parseSocialsDraft('{}', null)).toBeNull();
  });
});
