import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { ShieldCheck } from 'lucide-react-native';
import type { PlatformResource } from '@/domains/auth';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { CreatorHomeScreen } from '../CreatorHomeScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number) => String(value),
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
      isRTL: false,
    }),
    useStyles: () => tokens,
    moderateScale: (n: number) => n,
    iconStroke: { regular: 2 },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

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
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    GlowOrbs: stub('GlowOrbs'),
    GradientSurface: stub('GradientSurface'),
    Image: stub('Image'),
    Layout,
    LiveIsland: stub('LiveIsland'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    ProgressBar: stub('ProgressBar'),
    SectionHeader: stub('SectionHeader'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StaggerIn,
    StatusPill: stub('StatusPill'),
    Tag: stub('Tag'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
    Timeline: stub('Timeline'),
    useHeroCompact: () => false,
  };
});

jest.mock('@/domains/identity', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const MediaKitCard = (props: object) => createElement('MediaKitCard', props);
  return {
    MediaKitCard,
    PLATFORM_STATUS_PILL: jest.requireActual<{ PLATFORM_STATUS_PILL: object }>(
      '@/domains/identity/constants/platformStatus',
    ).PLATFORM_STATUS_PILL,
  };
});

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

const model = (overrides: Partial<CreatorHomeScreenModel> = {}): CreatorHomeScreenModel => ({
  hero: {
    greeting: 'marketplace.creatorHome.greetingTime.evening',
    displayName: 'Leila',
    avatarUrl: null,
    tier: 'MICRO',
    isVerified: false,
    primaryPlatform: null,
  },
  kpis: {
    reach: 12400,
    reachLoading: false,
    views: { key: 'profile_views', value: 1240, change: 0.12 },
    brandViews: { key: 'unique_brand_views', value: 38, change: 'new' },
    status: 'ready',
    retry: jest.fn(),
  },
  unreadNotifications: 3,
  notice: null,
  mediaKit: {} as CreatorHomeScreenModel['mediaKit'],
  completion: {
    percentage: 65,
    isVisible: true,
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
        serviceLabel: 'Reel',
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
  refreshing: false,
  onRefresh: jest.fn(),
  openProfile: jest.fn(),
  openNotifications: jest.fn(),
  openPlatforms: jest.fn(),
  openPlatform: jest.fn(),
  openRates: jest.fn(),
  onStepPress: jest.fn(),
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
const kpiStrip = (root: ReactTestInstance) =>
  pressables(root).find(node =>
    String(node.props.accessibilityLabel).startsWith('marketplace.creatorHome.kpi.'),
  );
const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(isHost('Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

describe('CreatorHomeScreen — chrome', () => {
  it('paints the brand backdrop with parallax under a transparent overlay header', () => {
    const { root } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    expect(layout.props.heroBackdrop).toBe('brandGlow');
    expect(layout.props.heroBehavior).toBe('parallax');
  });

  it('shows the unread count on the bell', () => {
    const { root, vm } = render();
    const [bell] = root.find(isHost('Layout')).props.header.actions;
    expect(bell.badge).toBe(3);
    expect(bell.onPress).toBe(vm.openNotifications);
  });

  it('wires the media kit card to Preview', () => {
    const { root, vm } = render();
    expect(root.find(isHost('MediaKitCard')).props.onOpenPreview).toBe(vm.openPreview);
  });
});

describe('CreatorHomeScreen — hero', () => {
  it('greets by time of day and name, and opens the profile from the avatar', () => {
    const { root, vm } = render();
    const text = textOf(root);
    expect(text).toContain('marketplace.creatorHome.greetingTime.evening');
    expect(text).toContain('Leila');
    byLabel(root, 'marketplace.creatorHome.openProfile')?.props.onPress();
    expect(vm.openProfile).toHaveBeenCalled();
  });

  it('falls back to a plain welcome without a name', () => {
    const { root } = render({
      hero: { ...model().hero, displayName: '' },
    });
    expect(textOf(root)).toContain('marketplace.creatorHome.greetingFallback');
  });

  it('marks a KYC-verified creator only', () => {
    const verified = (root: ReactTestInstance) =>
      root.findAll(node => node.props.name === 'BadgeCheck');
    expect(verified(render().root)).toHaveLength(0);
    expect(
      verified(render({ hero: { ...model().hero, isVerified: true } }).root),
    ).toHaveLength(1);
  });

  it('shows the tier as a TierBadge', () => {
    const { root } = render();
    expect(root.findAll(isHost('TierBadge')).some(n => n.props.tier === 'MICRO')).toBe(true);
  });
});

describe('CreatorHomeScreen — KPI strip', () => {
  it('shows reach, views (with change) and brand views, and opens Insights', () => {
    const { root, vm } = render();
    const strip = kpiStrip(root);
    expect(strip?.props.accessibilityLabel).toContain('marketplace.creatorHome.kpi.a11y');
    expect(textOf(strip as ReactTestInstance)).toContain('12400');
    expect(textOf(strip as ReactTestInstance)).toContain('1240');
    expect(textOf(strip as ReactTestInstance)).toContain('38');
    strip?.props.onPress();
    expect(vm.openInsights).toHaveBeenCalled();
    expect(strip?.findAll(node => node.props.name === 'TrendingUp')).toHaveLength(1);
  });

  it('turns into a retry when the stats fail, with no number shown as 0', () => {
    const retry = jest.fn();
    const { root, vm } = render({
      kpis: { ...model().kpis, status: 'error', views: null, brandViews: null, retry },
    });
    const strip = kpiStrip(root);
    expect(strip?.props.accessibilityLabel).toBe('marketplace.creatorHome.kpi.retry');
    expect(textOf(strip as ReactTestInstance)).toContain('—');
    strip?.props.onPress();
    expect(retry).toHaveBeenCalled();
    expect(vm.openInsights).not.toHaveBeenCalled();
  });

  it('reserves space with skeletons while loading', () => {
    const { root } = render({
      kpis: { ...model().kpis, status: 'loading', reachLoading: true, views: null, brandViews: null },
    });
    const strip = kpiStrip(root);
    expect(strip?.findAll(isHost('Skeleton'))).toHaveLength(3);
  });

  it('shows a dash for reach when no platform reports a count', () => {
    const { root } = render({ kpis: { ...model().kpis, reach: null } });
    expect(textOf(kpiStrip(root) as ReactTestInstance)).toContain('—');
  });
});

describe('CreatorHomeScreen — sections', () => {
  it('renders no live island when nothing blocks the creator', () => {
    const { root } = render();
    expect(root.findAll(isHost('LiveIsland'))).toHaveLength(0);
  });

  it('renders the one blocker as the hero live island with its action', () => {
    const onPress = jest.fn();
    const { root } = render({
      notice: {
        key: 'kitHidden',
        tone: 'warning',
        title: 'hidden',
        message: 'body',
        action: { label: 'make public', onPress },
      },
    });
    const islands = root.findAll(isHost('LiveIsland'));
    expect(islands).toHaveLength(1);
    expect(islands[0]?.props).toMatchObject({ title: 'hidden', tone: 'warning', accessibilityHint: 'make public' });
    islands[0]?.props.onPress();
    expect(onPress).toHaveBeenCalled();
  });

  it('hides profile strength at 100%', () => {
    const { root } = render({ completion: { percentage: 100, isVisible: false, nextStep: null, stages: [] } });
    expect(root.findAll(isHost('Timeline'))).toHaveLength(0);
  });

  it('shows profile strength below 100% as a stage track', () => {
    const { root } = render();
    const track = root.find(isHost('Timeline'));
    expect(track.props.variant).toBe('track');
    expect(track.props.steps).toEqual([
      { key: 'info', title: 'marketplace.creatorHome.strength.stage.info', state: 'done' },
      { key: 'rates', title: 'marketplace.creatorHome.strength.stage.rates', state: 'current' },
      { key: 'kyc', title: 'marketplace.creatorHome.strength.stage.kyc', state: 'upcoming' },
    ]);
  });

  it('opens the next step from its row', () => {
    const { root, vm } = render({
      completion: {
        percentage: 65,
        isVisible: true,
        stages: [],
        nextStep: {
          key: 'kyc',
          points: 15,
          meta: { icon: ShieldCheck, titleKey: 'account.profile.steps.kyc', target: 'kyc' },
        },
      },
    });
    byLabel(root, 'account.profile.steps.kyc, +0.15')?.props.onPress();
    expect(vm.onStepPress).toHaveBeenCalledWith('kyc');
  });
});

describe('CreatorHomeScreen — platforms', () => {
  const items = (...list: PlatformResource[]) => ({
    items: list,
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  });
  const pillLabels = (root: ReactTestInstance) =>
    root
      .findAll(isHost('StatusPill'))
      .map(n => n.props.label)
      .filter(label => label !== 'account.platforms.primary');
  // Interpolated labels render as `key:{options}` under the i18n mock.
  const cardLabels = (root: ReactTestInstance) =>
    root.findAll(isHost('Card')).map(n => String(n.props.accessibilityLabel));
  const cardByLabel = (root: ReactTestInstance, key: string) =>
    root
      .findAll(isHost('Card'))
      .find(node => String(node.props.accessibilityLabel).startsWith(`${key}:`));

  it('opens the primary platform from its teal-framed row', () => {
    const { root, vm } = render();
    const primary = cardByLabel(root, 'marketplace.creatorHome.platforms.openPrimary');
    expect(primary?.props.borderColor).toBeDefined();
    primary?.props.onPress();
    expect(vm.openPlatform).toHaveBeenCalledWith('p1');
  });

  it('lists the primary first, then the others, then "add platform"', () => {
    const { root, vm } = render({
      platforms: items(platform({ id: 'p2', is_primary: false, username: 'leila.tt' }), platform()),
    });
    const rows = cardLabels(root).filter(l => l.startsWith('marketplace.creatorHome.platforms.open'));
    expect(rows[0]).toMatch(/^marketplace\.creatorHome\.platforms\.openPrimary:/);
    expect(rows[1]).toMatch(/^marketplace\.creatorHome\.platforms\.open:/);
    const primaryPill = root
      .findAll(isHost('StatusPill'))
      .find(n => n.props.label === 'account.platforms.primary');
    expect(primaryPill?.props.tone).toBe('interactive');
    cardByLabel(root, 'marketplace.creatorHome.platforms.open')?.props.onPress();
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

  it('flags a paused platform that is otherwise verified', () => {
    const { root } = render({
      platforms: items(platform({ is_primary: false, is_available: false })),
    });
    expect(pillLabels(root)).toEqual(['account.platforms.unavailable']);
  });

  it('keeps verified platforms calm', () => {
    const { root } = render({
      platforms: items(platform(), platform({ id: 'p2', is_primary: false })),
    });
    expect(pillLabels(root)).toEqual([]);
  });

  it('invites linking a first platform', () => {
    const { root, vm } = render({
      platforms: { items: [], isLoading: false, isError: false, retry: jest.fn() },
    });
    const button = root
      .findAll(isHost('CustomButton'))
      .find(n => n.props.title === 'marketplace.creatorHome.platforms.add');
    expect(button?.props.variant).toBe('secondary');
    button?.props.onPress();
    expect(vm.openPlatforms).toHaveBeenCalled();
  });

  it('offers a retry when platforms fail to load', () => {
    const retry = jest.fn();
    const { root } = render({
      platforms: { items: [], isLoading: false, isError: true, retry },
    });
    const notice = root.find(isHost('Notice'));
    expect(notice.props.message).toBe('marketplace.creatorHome.platforms.loadFailed');
    notice.props.action.onPress();
    expect(retry).toHaveBeenCalled();
  });
});

describe('CreatorHomeScreen — rates', () => {
  it('renders each rate through MoneyText with its service and platform', () => {
    const { root } = render();
    const money = root.findAll(isHost('MoneyText'));
    expect(money).toHaveLength(1);
    expect(money[0]?.props.value).toEqual({ amount: 5000, currency: 'USD' });
    expect(textOf(root)).toContain('Reel');
  });

  it('invites the creator to add rates when there are none', () => {
    const { root, vm } = render({
      rates: { rows: [], isLoading: false, isError: false, retry: jest.fn() },
    });
    const button = root
      .findAll(isHost('CustomButton'))
      .find(n => n.props.title === 'marketplace.creatorHome.rates.add');
    expect(button?.props.variant).toBe('secondary');
    button?.props.onPress();
    expect(vm.openRates).toHaveBeenCalled();
  });
});
