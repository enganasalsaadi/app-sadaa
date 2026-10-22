import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { PlatformResource } from '@/domains/auth';
import type { CreatorActiveDeal, CreatorCampaign } from '../../../types';
import type { HomeMapTile } from '../hooks/useHomeMap';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { CreatorHomeScreen } from '../CreatorHomeScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number) => String(value),
  formatMoney: (money: { amount: number }) => `$${money.amount}`,
}));

jest.mock('@/core/theme', () => {
  // Any token path resolves; arithmetic on a token (sizes, borders) reads as 0.
  const tokens: object = new Proxy(
    {},
    { get: (_target, key) => (key === Symbol.toPrimitive ? () => 0 : tokens) },
  );
  return {
    useTheme: () => ({
      colors: tokens,
      sizes: tokens,
      spacing: tokens,
      typography: tokens,
      borderWidths: tokens,
      radii: tokens,
      shadows: tokens,
      isRTL: false,
    }),
    useStyles: () => tokens,
    moderateScale: (n: number) => n,
    iconStroke: { regular: 2, bold: 2.5 },
    motion: { spring: {}, stagger: 1, duration: { swing: 3 } },
    opacity: { deckNear: 1, deckFar: 1 },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('react-native-reanimated', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const ease = () => ease;
  return {
    __esModule: true,
    default: {
      View: ({ children, ...props }: { children?: React.ReactNode }) =>
        createElement('AnimatedView', props, children),
    },
    Easing: { inOut: ease, sin: ease },
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: () => ({}),
    withDelay: () => 0,
    withSequence: () => 0,
    withTiming: () => 0,
  };
});

jest.mock('react-native-svg', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const host = (name: string) => (props: object) => createElement(name, props);
  return { __esModule: true, default: host('Svg'), Path: host('Path'), Circle: host('Circle') };
});

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        typeof name === 'string' && name !== '__esModule'
          ? (props: object) => createElement('Icon', { name, ...props })
          : undefined,
    },
  );
});

jest.mock('@/shared/utils', () => ({
  isSocialPlatform: (value: string) => ['instagram', 'tiktok'].includes(value),
}));

jest.mock('@/shared/ui', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  // Renders the hero and the body so their sections are reachable in the tree.
  const Layout = ({ hero, children, ...props }: { hero?: React.ReactNode; children?: React.ReactNode }) =>
    createElement('Layout', props, createElement(Fragment, null, hero, children));
  // Rolling numbers render their final value, so text assertions still read it.
  const AnimatedNumber = ({ value }: { value: string }) => createElement('Text', null, value);
  const StaggerIn = ({ children }: { children?: React.ReactNode }) => createElement(Fragment, null, children);
  return {
    AnimatedNumber,
    Badge: stub('Badge'),
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    Divider: stub('Divider'),
    GradientSurface: stub('GradientSurface'),
    IconButton: stub('IconButton'),
    Image: stub('Image'),
    Layout,
    LiveDot: stub('LiveDot'),
    MoneyFlow: stub('MoneyFlow'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    Rail: stub('Rail'),
    SectionHeader: stub('SectionHeader'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    Sparkline: stub('Sparkline'),
    StaggerIn,
    StatusPill: stub('StatusPill'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
    useHeroCompact: () => false,
    useLayoutScrollY: () => null,
  };
});

jest.mock('@/domains/identity', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    MediaKitShareNotice: (props: object) => createElement('MediaKitShareNotice', props),
    PLATFORM_STATUS_PILL: jest.requireActual<{ PLATFORM_STATUS_PILL: object }>(
      '@/domains/identity/constants/platformStatus',
    ).PLATFORM_STATUS_PILL,
  };
});

// Gesture handler, Skia-free rings and the breathing welcome are covered where they live.
const host = (name: string) => () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return { [name]: (props: object) => createElement(name, props) };
};
jest.mock('../components/ActionDeck', () => host('ActionDeck')());
jest.mock('../components/DealsWelcome', () => host('DealsWelcome')());
jest.mock('../../../components/DealFace', () => host('DealFace')());
jest.mock('../../../components/CampaignRing', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    CampaignRing: ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement('CampaignRing', props, children),
  };
});
jest.mock('../../../hooks/useClock', () => ({ useClock: () => 0 }));

const mockModel: { current: CreatorHomeScreenModel | null } = { current: null };
jest.mock('../hooks/useCreatorHomeScreen', () => ({
  useCreatorHomeScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const platform = (overrides: Partial<PlatformResource> = {}): PlatformResource => ({
  id: 'p1',
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'leila',
  profile_url: null,
  display_name: null,
  follower_count: 12400,
  follower_tier: 'MICRO',
  follower_tier_label: 'Micro',
  tier_source: 'auto',
  verification_status: 'auto_verified',
  rejection_reason: null,
  is_primary: true,
  is_available: true,
  supports_lookup: true,
  last_synced_at: null,
  ...overrides,
});

const deal = (overrides: Partial<CreatorActiveDeal> = {}): CreatorActiveDeal => ({
  id: 'd1',
  status: { key: 'awaiting_payment', label: 'Waiting for payment' },
  stage: null,
  brand: { name: 'Nova', avatarUrl: null },
  title: 'Summer reel',
  total: { amount: 9000, currency: 'USD' },
  dueAt: null,
  needsAction: false,
  action: null,
  ...overrides,
});

const campaign = (overrides: Partial<CreatorCampaign> = {}): CreatorCampaign =>
  ({
    id: 'c1',
    title: 'Winter launch',
    brand: { name: 'Nasam', avatarUrl: null, verified: false },
    cover: null,
    pricing: {
      fixed: { gross: { amount: 25000, currency: 'USD' }, net: { amount: 20000, currency: 'USD' } },
      bid: null,
    },
    seats: { total: 10, free: 6 },
    invited: true,
    activityType: null,
    ...overrides,
  }) as CreatorCampaign;

const share = (overrides: Partial<CreatorHomeScreenModel['mediaKit']['share']> = {}) => ({
  isReady: true,
  isSharing: false,
  error: null,
  canRetry: false,
  isMakingPublic: false,
  onShare: jest.fn(),
  onCopy: jest.fn(),
  onRetry: jest.fn(),
  onDismissError: jest.fn(),
  onMakePublic: jest.fn(),
  ...overrides,
});

const tile = (key: HomeMapTile['key'], overrides: Partial<HomeMapTile> = {}): HomeMapTile => ({
  key,
  sub: { kind: 'text', text: `${key} sub`, tone: 'muted' },
  badge: 0,
  onPress: jest.fn(),
  ...overrides,
});

const TILE_KEYS = ['offers', 'deals', 'campaigns', 'wallet', 'rates', 'platforms', 'kit', 'insights'] as const;

const model = (overrides: Partial<CreatorHomeScreenModel> = {}): CreatorHomeScreenModel => ({
  hero: {
    greeting: 'marketplace.creatorHome.greetingTime.evening',
    displayName: 'Leila',
    avatarUrl: 'https://cdn.sada.sy/leila.jpg',
    tier: 'MICRO',
    isVerified: false,
    primaryPlatform: null,
  },
  kpis: {
    reach: 12400,
    reachLoading: false,
    views: { key: 'profile_views', value: 1240, change: 0.12 },
    brandViews: { key: 'unique_brand_views', value: 38, change: 'new' },
    viewsSeries: [3, 5, 4, 9],
    status: 'ready',
    retry: jest.fn(),
  },
  unreadNotifications: 3,
  notice: null,
  deck: { kind: 'none' },
  mapTiles: TILE_KEYS.map(key => tile(key)),
  strikes: 0,
  openStrikes: jest.fn(),
  mediaKit: {
    status: 'ready',
    linkLabel: 'sada.sy/c/leila',
    isPublic: true,
    noActivity: false,
    share: share(),
    onRetry: jest.fn(),
  },
  completion: {
    percentage: 65,
    isLoaded: true,
    nextStep: null,
    stages: [
      { key: 'info', state: 'done' },
      { key: 'rates', state: 'current' },
      { key: 'kyc', state: 'upcoming' },
    ],
  },
  platforms: { items: [platform()], isLoading: false, isError: false, retry: jest.fn() },
  rates: {
    rows: [
      {
        key: 'instagram:reels',
        platform: 'instagram',
        platformLabel: 'Instagram',
        serviceLabel: 'Reel with a mention of the place',
        price: { amount: 5000, currency: 'USD' },
        packageLabel: null,
        includes: [],
        addons: [],
      },
    ],
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  },
  homeDeals: {
    deals: { kind: 'hidden' },
    counts: null,
    openDeal: jest.fn(),
    openDeals: jest.fn(),
    openDealsTab: jest.fn(),
    openStrikes: jest.fn(),
    refresh: jest.fn(),
  } as unknown as CreatorHomeScreenModel['homeDeals'],
  homeCampaigns: {
    campaigns: { kind: 'hidden' },
    enabled: false,
    openCampaign: jest.fn(),
    openFeed: jest.fn(),
    openApplications: jest.fn(),
  },
  walletGlance: { loaded: true, available: null, escrow: null, kycNudge: false },
  amountsHidden: false,
  openWallet: jest.fn(),
  openKyc: jest.fn(),
  refreshing: false,
  onRefresh: jest.fn(),
  openProfile: jest.fn(),
  openNotifications: jest.fn(),
  openPlatforms: jest.fn(),
  openPlatform: jest.fn(),
  openRates: jest.fn(),
  onStepStage: jest.fn(),
  openInsights: jest.fn(),
  openPreview: jest.fn(),
  ...overrides,
});

const render = (overrides: Partial<CreatorHomeScreenModel> = {}) => {
  const vm = model(overrides);
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<CreatorHomeScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

const pressables = (root: ReactTestInstance) => root.findAll(isHost('Pressable'));
const byLabel = (root: ReactTestInstance, label: string) =>
  pressables(root).find(node => node.props.accessibilityLabel === label);
// Interpolated labels render as `key:{options}` under the i18n mock.
const byLabelKey = (root: ReactTestInstance, key: string) =>
  pressables(root).filter(node => String(node.props.accessibilityLabel).startsWith(key));
const buttons = (root: ReactTestInstance, title: string) =>
  root.findAll(isHost('CustomButton')).filter(node => node.props.title === title);
const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(isHost('Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

describe('CreatorHomeScreen — chrome', () => {
  it('slides the body over the glowing navy hero under a transparent overlay header', () => {
    const layout = render().root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    expect(layout.props.heroBackdrop).toBe('brandGlow');
    expect(layout.props.heroBehavior).toBe('parallax');
  });

  it('pins identity, share and the bell; share only while the kit is public', () => {
    const { root, vm } = render();
    const { actions, leading } = root.find(isHost('Layout')).props.header;
    expect(actions[0].badge).toBe(3);
    expect(actions[0].onPress).toBe(vm.openNotifications);
    expect(leading.props.onOpenProfile).toBe(vm.openProfile);
    expect(leading.props.onShare).toBe(vm.mediaKit.share.onShare);
    const closed = render({ mediaKit: { ...model().mediaKit, isPublic: false } });
    expect(closed.root.find(isHost('Layout')).props.header.leading.props.onShare).toBeNull();
  });
});

describe('CreatorHomeScreen — hero', () => {
  it('greets by time of day and name, and falls back to a plain welcome', () => {
    expect(textOf(render().root)).toContain('marketplace.creatorHome.greetingTime.evening');
    expect(textOf(render().root)).toContain('Leila');
    const nameless = render({ hero: { ...model().hero, displayName: '' } });
    expect(textOf(nameless.root)).toContain('marketplace.creatorHome.greetingFallback');
  });

  it('marks a KYC-verified creator only, and shows the tier', () => {
    const verified = (root: ReactTestInstance) => root.findAll(node => node.props.name === 'BadgeCheck');
    expect(verified(render().root)).toHaveLength(0);
    expect(verified(render({ hero: { ...model().hero, isVerified: true } }).root).length).toBeGreaterThan(0);
    expect(render().root.findAll(isHost('TierBadge')).some(n => n.props.tier === 'MICRO')).toBe(true);
  });

  it('puts the link first: copy (answered on the key), preview and share', () => {
    jest.useFakeTimers();
    const { root, vm } = render();
    expect(textOf(root)).toContain('sada.sy/c/leila');
    expect(textOf(root)).toContain('marketplace.creatorHome.hero.linkPublic');
    act(() => byLabel(root, 'marketplace.creatorHome.hero.copyA11y')?.props.onPress());
    expect(vm.mediaKit.share.onCopy).toHaveBeenCalled();
    expect(byLabel(root, 'marketplace.creatorHome.hero.copiedA11y')).toBeDefined();
    act(() => jest.runAllTimers());
    expect(byLabel(root, 'marketplace.creatorHome.hero.copyA11y')).toBeDefined();
    jest.useRealTimers();
    byLabel(root, 'marketplace.creatorHome.hero.previewA11y')?.props.onPress();
    expect(vm.openPreview).toHaveBeenCalled();
    const [heroShare] = buttons(root, 'marketplace.creatorHome.hero.share');
    heroShare?.props.onPress();
    expect(vm.mediaKit.share.onShare).toHaveBeenCalled();
  });

  it('turns share into «make public» on a private kit, with no copy key', () => {
    const { root, vm } = render({ mediaKit: { ...model().mediaKit, isPublic: false } });
    expect(textOf(root)).toContain('marketplace.creatorHome.hero.linkPrivate');
    expect(byLabel(root, 'marketplace.creatorHome.hero.copyA11y')).toBeUndefined();
    buttons(root, 'account.mediaKit.share.makePublic')[0]?.props.onPress();
    expect(vm.mediaKit.share.onMakePublic).toHaveBeenCalled();
  });

  it('retries the kit when the link failed to load', () => {
    const { root, vm } = render({
      mediaKit: { ...model().mediaKit, status: 'error', linkLabel: undefined, isPublic: null },
    });
    byLabel(root, 'marketplace.creatorHome.storefront.pass.linkFailed')?.props.onPress();
    expect(vm.mediaKit.onRetry).toHaveBeenCalled();
  });

  it('shows the last 30 days and opens Insights, or retries when they failed', () => {
    const { root, vm } = render();
    const [pulse] = byLabelKey(root, 'marketplace.creatorHome.hero.pulse.a11y');
    expect(textOf(pulse as ReactTestInstance)).toContain('1240');
    expect(textOf(pulse as ReactTestInstance)).toContain('12400');
    pulse?.props.onPress();
    expect(vm.openInsights).toHaveBeenCalled();

    const retry = jest.fn();
    const failed = render({ kpis: { ...model().kpis, status: 'error', views: null, brandViews: null, retry } });
    const [failedPulse] = byLabelKey(failed.root, 'marketplace.creatorHome.kpi.retry');
    expect(textOf(failedPulse as ReactTestInstance)).toContain('—');
    failedPulse?.props.onPress();
    expect(retry).toHaveBeenCalled();
  });
});

describe('CreatorHomeScreen — task deck', () => {
  it('deals the tasks into the deck with the blocker and the step opener', () => {
    const tasks = [{ kind: 'deal' as const, deal: deal({ needsAction: true }) }];
    const { root, vm } = render({ deck: { kind: 'tasks', tasks, welcome: false } });
    const deck = root.find(isHost('ActionDeck'));
    expect(deck.props.tasks).toBe(tasks);
    expect(deck.props.onStep).toBe(vm.onStepStage);
    expect(deck.props.onOpenDeal).toBe(vm.homeDeals.openDeal);
  });

  it('holds the place while loading, calms down when nothing waits, and leaves when there is nothing', () => {
    expect(render({ deck: { kind: 'loading' } }).root.findAll(isHost('Skeleton')).length).toBeGreaterThan(0);
    expect(textOf(render({ deck: { kind: 'quiet', nextUp: null } }).root)).toContain(
      'marketplace.creatorHome.deals.quiet.title',
    );
    expect(render().root.findAll(isHost('ActionDeck'))).toHaveLength(0);
  });
});

describe('CreatorHomeScreen — Sada map', () => {
  it('lays every tile out 3 · 3 · 2 and opens its place', () => {
    const { root, vm } = render();
    const tiles = byLabelKey(root, 'marketplace.creatorHome.map.tileA11y');
    expect(tiles).toHaveLength(8);
    tiles[0]?.props.onPress();
    expect(vm.mapTiles[0]?.onPress).toHaveBeenCalled();
  });

  it('badges what waits and shows the balance through MoneyText', () => {
    const tiles = TILE_KEYS.map(key =>
      key === 'offers'
        ? tile(key, { badge: 2 })
        : key === 'wallet'
          ? tile(key, { sub: { kind: 'money', value: { amount: 32000, currency: 'USD' } } })
          : tile(key),
    );
    const { root } = render({ mapTiles: tiles, amountsHidden: true });
    expect(root.findAll(isHost('Badge')).map(n => n.props.count)).toContain(2);
    const balance = root.findAll(isHost('MoneyText')).find(n => n.props.value.amount === 32000);
    expect(balance?.props.hidden).toBe(true);
  });

  it('raises the red strike bar only while a strike is live', () => {
    expect(byLabelKey(render().root, 'marketplace.creatorHome.strikes.active')).toHaveLength(0);
    const { root, vm } = render({ strikes: 1 });
    byLabelKey(root, 'marketplace.creatorHome.strikes.active')[0]?.props.onPress();
    expect(vm.openStrikes).toHaveBeenCalled();
  });
});

describe('CreatorHomeScreen — running deals', () => {
  const homeDeals = (deals: CreatorHomeScreenModel['homeDeals']['deals']) =>
    ({ ...model().homeDeals, deals }) as CreatorHomeScreenModel['homeDeals'];

  it('leaves the section out when its read failed', () => {
    expect(byLabelKey(render().root, 'marketplace.creatorHome.running.all')).toHaveLength(0);
  });

  it('lists the deals moving without the creator and opens each, then all', () => {
    const moving = [deal(), deal({ id: 'd2' })];
    const { root, vm } = render({
      homeDeals: homeDeals({ kind: 'deals', waiting: [], moving, nextUp: null, totalCount: 5 }),
    });
    const rows = byLabelKey(root, 'marketplace.creatorHome.running.rowA11y');
    expect(rows).toHaveLength(2);
    rows[1]?.props.onPress();
    expect(vm.homeDeals.openDeal).toHaveBeenCalledWith('d2');
    const [all] = byLabelKey(root, 'marketplace.creatorHome.running.all');
    expect(all?.props.accessibilityLabel).toContain('"count":5');
    all?.props.onPress();
    expect(vm.homeDeals.openDeals).toHaveBeenCalled();
  });

  it('welcomes a creator before the first offer ever', () => {
    const { root } = render({ homeDeals: homeDeals({ kind: 'welcome' }) });
    expect(root.findAll(isHost('DealsWelcome'))).toHaveLength(1);
  });
});

describe('CreatorHomeScreen — campaigns for you', () => {
  const strip = (overrides: object = {}) => ({
    ...model().homeCampaigns,
    campaigns: {
      kind: 'strip' as const,
      feedCount: 12,
      newInvites: 2,
      openApplications: 1,
      items: [campaign(), campaign({ id: 'c2', invited: false })],
      ...overrides,
    },
  });

  it('stays out while the flag is off', () => {
    expect(byLabelKey(render().root, 'marketplace.creatorHome.campaignsB.headerA11y')).toHaveLength(0);
  });

  it('lists the ranked campaigns with the net, and leads to the feed and the applications', () => {
    const { root, vm } = render({ homeCampaigns: strip() });
    const rows = byLabelKey(root, 'marketplace.campaign.feed.card.a11y');
    expect(rows).toHaveLength(2);
    rows[0]?.props.onPress();
    expect(vm.homeCampaigns.openCampaign).toHaveBeenCalledWith('c1');
    expect(textOf(root)).toContain('marketplace.creatorHome.campaignsB.invites:{"count":2}');
    byLabelKey(root, 'marketplace.creatorHome.campaignsB.headerA11y')[0]?.props.onPress();
    expect(vm.homeCampaigns.openFeed).toHaveBeenCalled();
    byLabelKey(root, 'marketplace.creatorHome.campaignsB.reviewing')[0]?.props.onPress();
    expect(vm.homeCampaigns.openApplications).toHaveBeenCalled();
  });

  it('browses the feed when nothing is under review, and points to the prices when nothing fits', () => {
    const browsing = render({ homeCampaigns: strip({ openApplications: 0 }) });
    byLabel(browsing.root, 'marketplace.creatorHome.campaignsB.browse')?.props.onPress();
    expect(browsing.vm.homeCampaigns.openFeed).toHaveBeenCalled();
    const quiet = render({
      homeCampaigns: strip({ feedCount: 0, newInvites: 0, openApplications: 0, items: [] }),
    });
    expect(textOf(quiet.root)).toContain('marketplace.creatorHome.campaigns.quiet.title');
  });
});

describe('CreatorHomeScreen — money', () => {
  it('holds its place until the wallet loads, then shows a calm card when nothing is held', () => {
    const loading = render({ walletGlance: { loaded: false, available: null, escrow: null, kycNudge: false } });
    expect(textOf(loading.root)).not.toContain('marketplace.creatorHome.money.emptyTitle');
    expect(textOf(render().root)).toContain('marketplace.creatorHome.money.emptyTitle');
  });

  it('shows what is held in mint, masked by the eye, and opens the wallet', () => {
    const escrow = { amount: 125000, currency: 'USD' as const };
    const { root, vm } = render({
      walletGlance: { loaded: true, available: null, escrow, kycNudge: false },
      amountsHidden: true,
    });
    const held = root.findAll(isHost('MoneyText')).find(n => n.props.value === escrow);
    expect(held?.props).toMatchObject({ tone: 'money', hidden: true });
    byLabel(root, 'marketplace.creatorHome.money.wallet')?.props.onPress();
    expect(vm.openWallet).toHaveBeenCalled();
  });

  it('nudges ID verification with the amount waiting, never while amounts are hidden', () => {
    const available = { amount: 32000, currency: 'USD' as const };
    const glance = { loaded: true, available, escrow: null, kycNudge: true };
    const { root, vm } = render({ walletGlance: glance });
    byLabelKey(root, 'marketplace.creatorHome.money.kycNudge:')[0]?.props.onPress();
    expect(vm.openKyc).toHaveBeenCalled();
    const hidden = render({ walletGlance: glance, amountsHidden: true });
    expect(byLabel(hidden.root, 'marketplace.creatorHome.money.kycNudgeHidden')).toBeDefined();
  });
});

describe('CreatorHomeScreen — storefront to brands', () => {
  it('shows the views with their pulse and opens Insights', () => {
    const { root, vm } = render();
    const [views] = byLabelKey(root, 'marketplace.creatorHome.look.a11y');
    expect(views?.findAll(isHost('Sparkline'))[0]?.props.values).toEqual([3, 5, 4, 9]);
    views?.props.onPress();
    expect(vm.openInsights).toHaveBeenCalled();
  });

  it('explains a failed share, or nudges a first share', () => {
    const failed = render({ mediaKit: { ...model().mediaKit, share: share({ error: 'failed', canRetry: true }) } });
    expect(failed.root.findAll(isHost('MediaKitShareNotice'))[0]?.props).toMatchObject({
      error: 'failed',
      canRetry: true,
    });
    const quiet = render({ mediaKit: { ...model().mediaKit, noActivity: true } });
    expect(textOf(quiet.root)).toContain('account.mediaKit.noActivity');
  });

  it('holds sharing while the kit is being made public', () => {
    const { root } = render({ mediaKit: { ...model().mediaKit, share: share({ isMakingPublic: true }) } });
    buttons(root, 'marketplace.creatorHome.hero.share').forEach(node => expect(node.props.disabled).toBe(true));
  });
});

describe('CreatorHomeScreen — readiness', () => {
  it('draws the ring to the percentage and opens a stage that is not done', () => {
    const { root, vm } = render();
    expect(root.find(isHost('CampaignRing')).props.progress).toBeCloseTo(0.65);
    expect(textOf(root)).toContain('marketplace.creatorHome.readiness.almost');
    byLabelKey(root, 'marketplace.creatorHome.readiness.stageA11y')[1]?.props.onPress();
    expect(vm.onStepStage).toHaveBeenCalledWith('rates');
    buttons(root, 'marketplace.creatorHome.tasks.step.rates.cta')[0]?.props.onPress();
    expect(vm.onStepStage).toHaveBeenCalledTimes(2);
  });

  it('stays on Home at 100% as a complete card, and holds its place until /me answers', () => {
    const done = render({
      completion: { percentage: 100, isLoaded: true, nextStep: null, stages: [{ key: 'info', state: 'done' }] },
    });
    expect(textOf(done.root)).toContain('marketplace.creatorHome.readiness.complete');
    const loading = render({ completion: { percentage: 0, isLoaded: false, nextStep: null, stages: [] } });
    expect(loading.root.findAll(isHost('CampaignRing'))).toHaveLength(0);
  });
});

describe('CreatorHomeScreen — audience', () => {
  const items = (...list: PlatformResource[]) => ({ items: list, isLoading: false, isError: false, retry: jest.fn() });
  const pillLabels = (root: ReactTestInstance) =>
    root
      .findAll(isHost('StatusPill'))
      .map(n => n.props.label)
      .filter(label => label !== 'account.platforms.primary');

  it('lists the primary first, then the others, then "add platform"', () => {
    const { root, vm } = render({
      platforms: items(platform({ id: 'p2', is_primary: false, username: 'leila.tt' }), platform()),
    });
    const rows = byLabelKey(root, 'marketplace.creatorHome.platforms.open');
    expect(String(rows[0]?.props.accessibilityLabel)).toMatch(/^marketplace\.creatorHome\.platforms\.openPrimary:/);
    rows[1]?.props.onPress();
    expect(vm.openPlatform).toHaveBeenCalledWith('p2');
    byLabel(root, 'marketplace.creatorHome.platforms.add')?.props.onPress();
    expect(vm.openPlatforms).toHaveBeenCalled();
  });

  it('shows one label at most: review outranks paused', () => {
    const { root } = render({
      platforms: items(platform({ verification_status: 'pending_review', is_available: false })),
    });
    expect(pillLabels(root)).toEqual(['account.platforms.status.pendingReview']);
  });

  it('invites linking a first platform instead of an empty box', () => {
    const { root, vm } = render({ platforms: items() });
    expect(textOf(root)).toContain('marketplace.creatorHome.platforms.emptyTitle');
    buttons(root, 'marketplace.creatorHome.platforms.add')[0]?.props.onPress();
    expect(vm.openPlatforms).toHaveBeenCalled();
  });

  it('offers a retry when platforms fail to load', () => {
    const retry = jest.fn();
    const { root } = render({ platforms: { items: [], isLoading: false, isError: true, retry } });
    const notice = root
      .findAll(isHost('Notice'))
      .find(n => n.props.message === 'marketplace.creatorHome.platforms.loadFailed');
    notice?.props.action.onPress();
    expect(retry).toHaveBeenCalled();
  });
});

describe('CreatorHomeScreen — price tags', () => {
  it('hangs each rate as a tag with the whole service and its price, closed by a "new rate" tag', () => {
    const { root, vm } = render();
    const [tag] = byLabelKey(root, 'marketplace.creatorHome.rates.tagA11y');
    expect(tag?.props.accessibilityLabel).toContain('"price":"$5000"');
    const service = tag?.findAll(isHost('Text')).find(n => n.children.includes('Reel with a mention of the place'));
    expect(service?.props.numberOfLines).toBe(2);
    expect(tag?.findAll(isHost('MoneyText'))[0]?.props.value).toEqual({ amount: 5000, currency: 'USD' });
    tag?.props.onPress();
    byLabel(root, 'marketplace.creatorHome.rates.newTag')?.props.onPress();
    expect(vm.openRates).toHaveBeenCalledTimes(2);
  });

  it('says the list is empty and offers to add prices', () => {
    const { root, vm } = render({ rates: { rows: [], isLoading: false, isError: false, retry: jest.fn() } });
    expect(textOf(root)).toContain('marketplace.creatorHome.rates.emptyTitle');
    buttons(root, 'marketplace.creatorHome.rates.add')[0]?.props.onPress();
    expect(vm.openRates).toHaveBeenCalled();
  });

  it('offers a retry when prices fail to load', () => {
    const retry = jest.fn();
    const { root } = render({ rates: { rows: [], isLoading: false, isError: true, retry } });
    const notice = root
      .findAll(isHost('Notice'))
      .find(n => n.props.message === 'marketplace.creatorHome.rates.loadFailed');
    notice?.props.action.onPress();
    expect(retry).toHaveBeenCalled();
  });
});
