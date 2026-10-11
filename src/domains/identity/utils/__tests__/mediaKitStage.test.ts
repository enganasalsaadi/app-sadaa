import type { MediaKitPlatform } from '../../types/mediaKit';
import { buildStageReach, stageGridColumns, stageHandle } from '../mediaKitStage';

const platform = (overrides: Partial<MediaKitPlatform>): MediaKitPlatform => ({
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'creator_ig',
  profile_url: null,
  display_name: null,
  follower_count: 1000,
  follower_count_verified: false,
  follower_tier: null,
  follower_tier_label: null,
  is_primary: false,
  ...overrides,
});

describe('buildStageReach', () => {
  it('sums followers and puts the primary first, then the biggest audiences', () => {
    const reach = buildStageReach([
      platform({ platform: 'facebook', follower_count: 41000 }),
      platform({ platform: 'tiktok', follower_count: 288100 }),
      platform({ platform: 'youtube', follower_count: 96400, is_primary: true }),
    ]);
    expect(reach.total).toBe(425500);
    expect(reach.platforms.map(item => item.platform)).toEqual(['youtube', 'tiktok', 'facebook']);
  });

  it('gives each platform its whole-percent share', () => {
    const reach = buildStageReach([
      platform({ follower_count: 96408, is_primary: true, follower_count_verified: true }),
      platform({ platform: 'facebook', follower_count: 10507 }),
    ]);
    expect(reach.platforms.map(item => item.sharePct)).toEqual([90, 10]);
    expect(reach.platforms[0]?.verified).toBe(true);
  });

  it('shows 0% everywhere instead of dividing by zero', () => {
    const reach = buildStageReach([platform({ follower_count: 0 })]);
    expect(reach.total).toBe(0);
    expect(reach.platforms[0]?.sharePct).toBe(0);
  });

  it('handles a kit without platforms', () => {
    expect(buildStageReach([])).toEqual({ total: 0, platforms: [] });
  });
});

describe('stageHandle', () => {
  it('prefers the primary platform handle', () => {
    expect(
      stageHandle([platform({ username: 'fb_page' }), platform({ username: 'main', is_primary: true })]),
    ).toBe('main');
  });

  it('falls back to the first platform, then to none', () => {
    expect(stageHandle([platform({ username: 'first' })])).toBe('first');
    expect(stageHandle([])).toBeNull();
  });
});

describe('stageGridColumns', () => {
  it('centres one tile and pairs the rest', () => {
    expect(stageGridColumns(1)).toBe(1);
    expect(stageGridColumns(2)).toBe(2);
    expect(stageGridColumns(4)).toBe(2);
  });
});
