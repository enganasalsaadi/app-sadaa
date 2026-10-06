import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
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
  const tokens: object = new Proxy({}, { get: () => tokens });
  return {
    useTheme: () => ({ colors: tokens, sizes: tokens, spacing: tokens, isRTL: false }),
    useStyles: () => tokens,
    moderateScale: (n: number) => n,
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
  return {
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    GradientSurface: stub('GradientSurface'),
    Image: stub('Image'),
    KeyValueRow: stub('KeyValueRow'),
    Layout,
    ListRow: stub('ListRow'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    ProgressBar: stub('ProgressBar'),
    SectionHeader: stub('SectionHeader'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StatusPill: stub('StatusPill'),
    Tag: stub('Tag'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
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
    displayName: 'Leila',
    avatarUrl: null,
    tier: 'MICRO',
    primaryPlatform: null,
  },
  unreadNotifications: 3,
  notice: null,
  mediaKit: {} as CreatorHomeScreenModel['mediaKit'],
  completion: { percentage: 65, isVisible: true, nextStep: null },
  platforms: { items: [platform()], isLoading: false, isError: false, retry: jest.fn() },
  rates: {
    rows: [
      {
        key: 'instagram:reels',
        platformLabel: 'Instagram',
        serviceLabel: 'Reel',
        price: { amount: 5000, currency: 'USD' },
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

describe('CreatorHomeScreen', () => {
  it('wires the media kit card to Insights and Preview', () => {
    const { root, vm } = render();
    const card = root.find(isHost('MediaKitCard'));
    expect(card.props.onOpenInsights).toBe(vm.openInsights);
    expect(card.props.onOpenPreview).toBe(vm.openPreview);
  });

  it('shows the unread count on the bell', () => {
    const { root, vm } = render();
    const [bell] = root.find(isHost('Layout')).props.header.actions;
    expect(bell.badge).toBe(3);
    expect(bell.onPress).toBe(vm.openNotifications);
  });

  it('renders no notice when nothing blocks the creator', () => {
    const { root } = render();
    expect(root.findAll(isHost('Notice'))).toHaveLength(0);
  });

  it('renders the one notice with its action', () => {
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
    const notices = root.findAll(isHost('Notice'));
    expect(notices).toHaveLength(1);
    notices[0]?.props.action.onPress();
    expect(onPress).toHaveBeenCalled();
  });

  it('hides profile strength at 100%', () => {
    const { root } = render({ completion: { percentage: 100, isVisible: false, nextStep: null } });
    expect(root.findAll(isHost('ProgressBar'))).toHaveLength(0);
  });

  it('shows profile strength below 100%', () => {
    const { root } = render();
    expect(root.find(isHost('ProgressBar')).props.value).toBeCloseTo(0.65);
  });

  it('opens a platform from its tile', () => {
    const { root, vm } = render();
    const tile = root
      .findAll(isHost('Card'))
      .find(node => typeof node.props.onPress === 'function');
    tile?.props.onPress();
    expect(vm.openPlatform).toHaveBeenCalledWith('p1');
  });

  it('marks the primary platform', () => {
    const { root } = render();
    expect(root.find(isHost('Tag')).props.label).toBe('account.platforms.primary');
  });

  it('flags a platform under review and a paused one', () => {
    const { root } = render({
      platforms: {
        items: [platform({ verification_status: 'pending_review', is_available: false })],
        isLoading: false,
        isError: false,
        retry: jest.fn(),
      },
    });
    const labels = root.findAll(isHost('StatusPill')).map(n => n.props.label);
    expect(labels).toEqual(['account.platforms.status.pendingReview', 'account.platforms.unavailable']);
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

  it('renders each rate through MoneyText', () => {
    const { root } = render();
    const row = root.find(isHost('KeyValueRow'));
    expect(row.props.label).toContain('marketplace.creatorHome.rates.row');
    expect(row.props.value.props.value).toEqual({ amount: 5000, currency: 'USD' });
  });

  it('invites the creator to add rates when there are none', () => {
    const { root, vm } = render({
      rates: { rows: [], isLoading: false, isError: false, retry: jest.fn() },
    });
    const button = root.find(isHost('CustomButton'));
    expect(button.props.title).toBe('marketplace.creatorHome.rates.add');
    expect(button.props.variant).toBe('secondary');
    button.props.onPress();
    expect(vm.openRates).toHaveBeenCalled();
  });
});
