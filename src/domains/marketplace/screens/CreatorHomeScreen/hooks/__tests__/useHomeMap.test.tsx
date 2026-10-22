import React from 'react';
import { act, create } from 'react-test-renderer';
import { useHomeMap, type HomeMapInput, type HomeMapTile, type HomeMapTileKey } from '../useHomeMap';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

const KEYS: HomeMapTileKey[] = [
  'offers',
  'deals',
  'campaigns',
  'notifications',
  'wallet',
  'rates',
  'platforms',
  'kit',
  'insights',
];

const input = (overrides: Partial<HomeMapInput> = {}): HomeMapInput => ({
  newOffers: 2,
  activeDeals: 5,
  campaignsEnabled: true,
  campaigns: { feedCount: 12, newInvites: 1 },
  unreadNotifications: 4,
  available: { amount: 32000, currency: 'USD' },
  rates: { count: 3, isLoading: false },
  platforms: { count: 2, isLoading: false, reviewStatus: null },
  isKitPublic: true,
  open: Object.fromEntries(KEYS.map(key => [key, jest.fn()])) as unknown as HomeMapInput['open'],
  ...overrides,
});

const tilesOf = (value: HomeMapInput): HomeMapTile[] => {
  const result: { current: HomeMapTile[] } = { current: [] };
  const Harness = () => {
    result.current = useHomeMap(value);
    return null;
  };
  act(() => {
    create(<Harness />);
  });
  return result.current;
};

const byKey = (tiles: HomeMapTile[], key: HomeMapTileKey) => tiles.find(tile => tile.key === key);

describe('useHomeMap', () => {
  it('lays out eight tiles in the 3 · 3 · 2 order', () => {
    expect(tilesOf(input()).map(tile => tile.key)).toEqual([
      'offers',
      'deals',
      'campaigns',
      'wallet',
      'rates',
      'platforms',
      'kit',
      'insights',
    ]);
  });

  it('badges new offers and new invites, and shows the balance as money', () => {
    const tiles = tilesOf(input());
    expect(byKey(tiles, 'offers')?.badge).toBe(2);
    expect(byKey(tiles, 'campaigns')?.badge).toBe(1);
    expect(byKey(tiles, 'wallet')?.sub).toEqual({ kind: 'money', value: { amount: 32000, currency: 'USD' } });
  });

  it('swaps campaigns for notifications only once the flag is known to be off', () => {
    const off = tilesOf(input({ campaignsEnabled: false, campaigns: null }));
    expect(byKey(off, 'campaigns')).toBeUndefined();
    expect(byKey(off, 'notifications')?.badge).toBe(4);
    const unknown = tilesOf(input({ campaignsEnabled: null, campaigns: null }));
    expect(byKey(unknown, 'campaigns')?.sub).toEqual({ kind: 'loading' });
  });

  it('waits with «…» instead of a guessed 0', () => {
    const tiles = tilesOf(
      input({
        newOffers: null,
        activeDeals: null,
        available: null,
        isKitPublic: null,
        rates: { count: 0, isLoading: true },
        platforms: { count: 0, isLoading: true, reviewStatus: null },
      }),
    );
    (['offers', 'deals', 'wallet', 'rates', 'platforms', 'kit'] as const).forEach(key =>
      expect(byKey(tiles, key)?.sub).toEqual({ kind: 'loading' }),
    );
  });

  it('warns on what blocks offers: no price, no platform, a platform needing action', () => {
    const empty = tilesOf(input({ rates: { count: 0, isLoading: false }, platforms: { count: 0, isLoading: false, reviewStatus: null } }));
    expect(byKey(empty, 'rates')?.sub).toMatchObject({ tone: 'warning' });
    expect(byKey(empty, 'platforms')?.sub).toMatchObject({ tone: 'warning' });
    const action = tilesOf(input({ platforms: { count: 2, isLoading: false, reviewStatus: 'action_required' } }));
    expect(byKey(action, 'platforms')?.sub).toEqual({
      kind: 'text',
      text: 'marketplace.creatorHome.map.sub.platformsAction',
      tone: 'warning',
    });
  });
});
