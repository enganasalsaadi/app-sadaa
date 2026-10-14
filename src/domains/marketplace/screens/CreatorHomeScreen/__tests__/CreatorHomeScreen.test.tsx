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
    resolveHue: () => tokens,
    iconStroke: { regular: 2 },
    motion: { loop: { passSheen: 1, signSwing: 1 }, spring: {}, duration: { slow: 1 } },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('react-native-reanimated', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const entering = { springify: () => entering };
  return {
    __esModule: true,
    default: {
      View: ({ children, ...props }: { children?: React.ReactNode }) =>
        createElement('AnimatedView', props, children),
    },
    FadeInUp: entering,
    interpolate: () => 0,
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: () => ({}),
    withSpring: () => 1,
    withTiming: () => 1,
  };
});

jest.mock('react-native-linear-gradient', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return { __esModule: true, default: (props: object) => createElement('LinearGradient', props) };
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
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    Divider: stub('Divider'),
    Image: stub('Image'),
    Layout,
    LiveDot: stub('LiveDot'),
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
    useLayoutInView: () => ({ ref: null, onLayout: jest.fn(), visible: true }),
    useLoopClock: () => ({ value: 0 }),
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
  openAvatar: jest.fn(),
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
const button = (root: ReactTestInstance, title: string) =>
  root.findAll(isHost('CustomButton')).find(node => node.props.title === title);
const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(isHost('Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');
const watchGrid = (root: ReactTestInstance) =>
  pressables(root).find(node =>
    /^marketplace\.creatorHome\.(storefront\.watch\.a11y|kpi\.retry)/.test(String(node.props.accessibilityLabel)),
  );

describe('CreatorHomeScreen — chrome', () => {
  it('slides the body over the glowing navy hero under a transparent overlay header', () => {
    const { root } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    expect(layout.props.heroBackdrop).toBe('brandGlow');
    expect(layout.props.heroBehavior).toBe('parallax');
  });

  it('shows the unread count on the bell and pins the identity to the profile', () => {
    const { root, vm } = render();
    const { actions, leading } = root.find(isHost('Layout')).props.header;
    expect(actions[0].badge).toBe(3);
    expect(actions[0].onPress).toBe(vm.openNotifications);
    expect(leading.props.onOpenProfile).toBe(vm.openProfile);
  });
});

describe('CreatorHomeScreen — storefront pass', () => {
  it('greets by time of day and name, and falls back to a plain welcome', () => {
    expect(textOf(render().root)).toContain('marketplace.creatorHome.greetingTime.evening');
    expect(textOf(render().root)).toContain('Leila');
    const nameless = render({ hero: { ...model().hero, displayName: '' } });
    expect(textOf(nameless.root)).toContain('marketplace.creatorHome.greetingFallback');
  });

  it('marks a KYC-verified creator only, and shows the tier', () => {
    const verified = (root: ReactTestInstance) => root.findAll(node => node.props.name === 'BadgeCheck');
    expect(verified(render().root)).toHaveLength(0);
    expect(verified(render({ hero: { ...model().hero, isVerified: true } }).root)).toHaveLength(1);
    expect(render().root.findAll(isHost('TierBadge')).some(n => n.props.tier === 'MICRO')).toBe(true);
  });

  it('tells whether the storefront is open, and says nothing while the kit loads', () => {
    expect(textOf(render().root)).toContain('marketplace.creatorHome.storefront.kickerOpen');
    const closed = render({ mediaKit: { ...model().mediaKit, isPublic: false } });
    expect(textOf(closed.root)).toContain('marketplace.creatorHome.storefront.kickerHidden');
    const loading = render({ mediaKit: { ...model().mediaKit, status: 'loading', isPublic: null } });
    expect(loading.root.findAll(isHost('LiveDot'))).toHaveLength(0);
  });

  it('shows the reach across every linked platform', () => {
    const { root } = render();
    expect(textOf(root)).toContain('12400');
    expect(textOf(root)).toContain('account.mediaKit.showcase.stage.reach:{"count":1}');
  });

  it('turns a missing photo and a first platform into slots that open their steps', () => {
    const { root, vm } = render({
      hero: { ...model().hero, avatarUrl: null },
      platforms: { items: [], isLoading: false, isError: false, retry: jest.fn() },
    });
    byLabel(root, 'marketplace.creatorHome.storefront.pass.addPhoto')?.props.onPress();
    expect(vm.openAvatar).toHaveBeenCalled();
    byLabel(root, 'marketplace.creatorHome.storefront.pass.linkPlatform')?.props.onPress();
    expect(vm.openPlatforms).toHaveBeenCalled();
  });

  it('copies a public link, and only says "hidden" on a closed kit', () => {
    const { root, vm } = render();
    expect(textOf(root)).toContain('sada.sy/c/leila');
    byLabel(root, 'account.mediaKit.share.copy')?.props.onPress();
    expect(vm.mediaKit.share.onCopy).toHaveBeenCalled();

    const closed = render({ mediaKit: { ...model().mediaKit, isPublic: false } });
    expect(textOf(closed.root)).toContain('account.mediaKit.visibility.hidden');
    expect(
      byLabelKey(closed.root, 'account.mediaKit.share.copy').filter(n => n.props.px === 'sm'),
    ).toHaveLength(0);
  });

  it('retries the kit when the link failed to load', () => {
    const { root, vm } = render({
      mediaKit: { ...model().mediaKit, status: 'error', linkLabel: undefined, isPublic: null },
    });
    byLabel(root, 'marketplace.creatorHome.storefront.pass.linkFailed')?.props.onPress();
    expect(vm.mediaKit.onRetry).toHaveBeenCalled();
  });
});

describe('CreatorHomeScreen — hanging sign', () => {
  it('hangs nothing when nothing blocks the creator', () => {
    expect(textOf(render().root)).not.toContain('make public');
  });

  it('hangs the one blocker with its action, spinning while it runs', () => {
    const onPress = jest.fn();
    const { root } = render({
      notice: {
        key: 'kitHidden',
        tone: 'warning',
        title: 'hidden',
        message: 'body',
        action: { label: 'make public', onPress, busy: true },
      },
    });
    const text = textOf(root);
    expect(text).toContain('hidden');
    expect(text).toContain('body');
    const action = button(root, 'make public');
    expect(action?.props.loading).toBe(true);
    action?.props.onPress();
    expect(onPress).toHaveBeenCalled();
    expect(root.findAll(node => node.props.name === 'Lock').length).toBeGreaterThan(0);
  });
});

describe("CreatorHomeScreen — who's looking", () => {
  it('shows brand visits and profile views with their pulse, and opens Insights', () => {
    const { root, vm } = render();
    const grid = watchGrid(root) as ReactTestInstance;
    expect(textOf(grid)).toContain('38');
    expect(textOf(grid)).toContain('1240');
    expect(grid.findAll(isHost('Sparkline'))[0]?.props.values).toEqual([3, 5, 4, 9]);
    grid.props.onPress();
    expect(vm.openInsights).toHaveBeenCalled();
  });

  it('turns into a retry when the stats fail, with no number shown as 0', () => {
    const retry = jest.fn();
    const { root, vm } = render({
      kpis: { ...model().kpis, status: 'error', views: null, brandViews: null, retry },
    });
    const grid = watchGrid(root) as ReactTestInstance;
    expect(grid.props.accessibilityLabel).toBe('marketplace.creatorHome.kpi.retry');
    expect(textOf(grid)).toContain('—');
    expect(grid.findAll(isHost('Sparkline'))).toHaveLength(0);
    grid.props.onPress();
    expect(retry).toHaveBeenCalled();
    expect(vm.openInsights).not.toHaveBeenCalled();
  });

  it('reserves space with skeletons while loading', () => {
    const { root } = render({ kpis: { ...model().kpis, status: 'loading', views: null, brandViews: null } });
    expect((watchGrid(root) as ReactTestInstance).findAll(isHost('Skeleton'))).toHaveLength(2);
  });
});

describe('CreatorHomeScreen — share bar', () => {
  it('shares, copies and previews the storefront', () => {
    const { root, vm } = render();
    button(root, 'marketplace.creatorHome.storefront.share')?.props.onPress();
    expect(vm.mediaKit.share.onShare).toHaveBeenCalled();
    byLabel(root, 'account.mediaKit.preview')?.props.onPress();
    expect(vm.openPreview).toHaveBeenCalled();
  });

  it('holds sharing while the kit is being made public', () => {
    const { root } = render({ mediaKit: { ...model().mediaKit, share: share({ isMakingPublic: true }) } });
    expect(button(root, 'marketplace.creatorHome.storefront.share')?.props.disabled).toBe(true);
  });

  it('explains a failed share, or nudges a first share', () => {
    const failed = render({ mediaKit: { ...model().mediaKit, share: share({ error: 'failed', canRetry: true }) } });
    expect(failed.root.find(isHost('MediaKitShareNotice')).props).toMatchObject({ error: 'failed', canRetry: true });
    const quiet = render({ mediaKit: { ...model().mediaKit, noActivity: true } });
    expect(textOf(quiet.root)).toContain('account.mediaKit.noActivity');
  });
});

describe('CreatorHomeScreen — profile strength', () => {
  it('lights one piece per stage and opens the next step', () => {
    const { root, vm } = render({
      completion: {
        ...model().completion,
        nextStep: {
          key: 'kyc',
          points: 15,
          meta: { icon: ShieldCheck, titleKey: 'account.profile.steps.kyc', target: 'kyc' },
        },
      },
    });
    expect(textOf(root)).toContain('0.65');
    expect(textOf(root)).toContain('marketplace.creatorHome.strength.stage.rates');
    byLabel(root, 'account.profile.steps.kyc, +0.15')?.props.onPress();
    expect(vm.onStepPress).toHaveBeenCalledWith('kyc');
  });

  it('stays on Home at 100% as a complete card', () => {
    const { root } = render({
      completion: { percentage: 100, isLoaded: true, nextStep: null, stages: [{ key: 'info', state: 'done' }] },
    });
    expect(textOf(root)).toContain('marketplace.creatorHome.strength.complete');
    expect(textOf(root)).not.toContain('marketplace.creatorHome.strength.nextStep');
  });

  it('holds its place with a skeleton until /me reports a completion', () => {
    const { root } = render({ completion: { percentage: 0, isLoaded: false, nextStep: null, stages: [] } });
    expect(textOf(root)).not.toContain('marketplace.creatorHome.strength.title');
    expect(textOf(root)).not.toContain('0.00');
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
    button(root, 'marketplace.creatorHome.platforms.add')?.props.onPress();
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
  it('hangs each rate as a tag priced through MoneyText, closed by a "new rate" tag', () => {
    const { root, vm } = render();
    const money = root.findAll(isHost('MoneyText'));
    expect(money).toHaveLength(1);
    expect(money[0]?.props.value).toEqual({ amount: 5000, currency: 'USD' });
    const [tag] = byLabelKey(root, 'marketplace.creatorHome.rates.tagA11y');
    expect(tag?.props.accessibilityLabel).toContain('"price":"$5000"');
    tag?.props.onPress();
    byLabel(root, 'marketplace.creatorHome.rates.newTag')?.props.onPress();
    expect(vm.openRates).toHaveBeenCalledTimes(2);
  });

  it('says the list is empty and offers to add prices', () => {
    const { root, vm } = render({ rates: { rows: [], isLoading: false, isError: false, retry: jest.fn() } });
    expect(textOf(root)).toContain('marketplace.creatorHome.rates.emptyTitle');
    button(root, 'marketplace.creatorHome.rates.add')?.props.onPress();
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
