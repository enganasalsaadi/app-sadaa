import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { PublicMediaKit } from '../../../types/mediaKit';
import type { MediaKitPreviewScreenModel } from '../hooks/useMediaKitPreviewScreen';
import { MediaKitPreviewScreen } from '../MediaKitPreviewScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({ formatNumber: (value: number) => String(value) }));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
});

jest.mock('@/shared/context/BottomBarContext', () => ({ useHideBottomBar: jest.fn() }));

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
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

jest.mock('../../../utils/mediaKitCard', () => ({
  pickPrimaryPlatform: (platforms: { is_primary: boolean }[]) =>
    platforms.find(p => p.is_primary) ?? null,
  toPriceFrom: (usd: number | null) => (usd === null ? null : { amount: usd * 100, currency: 'USD' }),
}));

jest.mock('@/shared/ui', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  const Layout = ({
    footer,
    children,
    ...props
  }: {
    footer?: React.ReactNode;
    children?: React.ReactNode;
  }) => createElement('Layout', props, createElement(Fragment, null, children, footer));
  const LayoutFooter = ({ top, ...props }: { top?: React.ReactNode }) =>
    createElement('LayoutFooter', props, top);
  return {
    Avatar: stub('Avatar'),
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    Divider: stub('Divider'),
    ErrorState: stub('ErrorState'),
    KeyValueRow: stub('KeyValueRow'),
    Layout,
    LayoutFooter,
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    SectionHeader: stub('SectionHeader'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    Tag: stub('Tag'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
  };
});

const mockModel: { current: MediaKitPreviewScreenModel | null } = { current: null };
jest.mock('../hooks/useMediaKitPreviewScreen', () => ({
  useMediaKitPreviewScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const preview: PublicMediaKit = {
  slug: 'anas',
  display_name: 'Anas Style',
  avatar_url: null,
  tier: 'MICRO',
  tier_label: 'Micro',
  is_verified: true,
  niches: ['fashion', 'beauty'],
  platforms: [
    {
      platform: 'instagram',
      platform_label: 'Instagram',
      username: 'anas',
      profile_url: null,
      display_name: 'Anas Style',
      follower_count: 45210,
      follower_count_verified: true,
      follower_tier: 'MICRO',
      follower_tier_label: 'Micro',
      is_primary: true,
    },
    {
      platform: 'tiktok',
      platform_label: 'TikTok',
      username: 'anas.tt',
      profile_url: null,
      display_name: null,
      follower_count: 1200,
      follower_count_verified: false,
      follower_tier: null,
      follower_tier_label: null,
      is_primary: false,
    },
  ],
  rate_cards: [],
  price_from_usd: 30,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
};

const share = (): MediaKitPreviewScreenModel['share'] => ({
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
});

const model = (overrides: Partial<MediaKitPreviewScreenModel> = {}): MediaKitPreviewScreenModel => ({
  status: 'ready',
  error: undefined,
  preview,
  isPublic: true,
  nicheLabels: ['Fashion', 'Beauty'],
  rateRows: [
    {
      key: 'instagram:reels',
      platform: 'instagram',
      platformLabel: 'Instagram',
      serviceLabel: 'Reels',
      price: { amount: 5000, currency: 'USD' },
    },
  ],
  share: share(),
  openSettings: jest.fn(),
  refreshing: false,
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  ...overrides,
});

const render = (overrides: Partial<MediaKitPreviewScreenModel> = {}) => {
  const vm = model(overrides);
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitPreviewScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

describe('MediaKitPreviewScreen', () => {
  it('renders the kit as brands see it: identity, every platform, rates', () => {
    const { root } = render();
    expect(root.findAll(isHost('Tag')).map(tag => tag.props.label)).toEqual(['Fashion', 'Beauty']);
    expect(root.findAll(isHost('SocialPlatformIcon')).map(icon => icon.props.platform)).toEqual([
      'instagram',
      'instagram',
      'tiktok',
    ]);
    expect(root.findAll(isHost('KeyValueRow'))).toHaveLength(1);
    // ✓ only next to verified follower counts.
    const verified = root
      .findAll(isHost('Icon'))
      .filter(icon => icon.props.name === 'CheckCircle2');
    expect(verified).toHaveLength(2);
  });

  it('hides sections without data', () => {
    const { root } = render({
      preview: { ...preview, platforms: [] },
      rateRows: [],
    });
    expect(root.findAll(isHost('SectionHeader'))).toHaveLength(0);
    expect(root.findAll(isHost('KeyValueRow'))).toHaveLength(0);
  });

  it('warns when the kit is hidden and offers Make public', () => {
    const { root, vm } = render({ isPublic: false });
    const notice = root.find(isHost('Notice'));
    expect(notice.props.tone).toBe('warning');
    expect(notice.props.action.onPress).toBe(vm.share.onMakePublic);
  });

  it('opens settings from the header and shares from the footer', () => {
    const { root, vm } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.header.actions[0].onPress).toBe(vm.openSettings);
    const footer = root.find(isHost('LayoutFooter'));
    expect(footer.props.primary.onPress).toBe(vm.share.onShare);
  });

  it('loading shows a skeleton and no footer; error offers retry', () => {
    const loading = render({ status: 'loading', preview: undefined });
    expect(loading.root.findAll(isHost('Skeleton')).length).toBeGreaterThan(0);
    expect(loading.root.findAll(isHost('LayoutFooter'))).toHaveLength(0);

    const failed = render({ status: 'error', preview: undefined });
    expect(failed.root.find(isHost('ErrorState')).props.onRetry).toBe(failed.vm.onRetry);
  });
});
