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

jest.mock('../../../components/MediaKitShowcase', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    MediaKitHero: (props: object) => createElement('MediaKitHero', props),
    MediaKitHeaderBar: (props: object) => createElement('MediaKitHeaderBar', props),
    // Renders `intro` so the notice above the sections can be asserted.
    MediaKitShowcaseBody: ({ intro, ...props }: { intro?: React.ReactNode }) =>
      createElement('MediaKitShowcaseBody', props, intro),
    MediaKitShowcaseHeroSkeleton: () => createElement('MediaKitShowcaseHeroSkeleton'),
    MediaKitShowcaseBodySkeleton: () => createElement('MediaKitShowcaseBodySkeleton'),
  };
});

jest.mock('../../../components/MediaKitCard/MediaKitShareNotice', () => ({
  MediaKitShareNotice: 'MediaKitShareNotice',
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
    hero,
    children,
    ...props
  }: {
    footer?: React.ReactNode;
    hero?: React.ReactNode;
    children?: React.ReactNode;
  }) => createElement('Layout', props, createElement(Fragment, null, hero, children, footer));
  const LayoutFooter = ({ top, ...props }: { top?: React.ReactNode }) =>
    createElement('LayoutFooter', props, top);
  return {
    Accordion: stub('Accordion'),
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
  contract_terms: null,
  price_from_usd: 30,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
  cover_url: null,
  city: null,
  public_url: 'https://sada.sy/c/anas',
  is_shortlisted: null,
  highlights: null,
  audience: null,
  worked_with: null,
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
      packageLabel: null,
      includes: [],
      addons: [],
    },
  ],
  metrics: [{ key: 'reach', value: '46.4K' }],
  services: {
    groups: [],
    activeGroup: null,
    onGroupChange: jest.fn(),
    selected: new Set(),
    toggleService: jest.fn(),
    total: null,
  },
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
  it('renders the same pitch brands see, read-only', () => {
    const { root, vm } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    const hero = root.find(isHost('MediaKitHero'));
    expect(hero.props.kit).toBe(preview);
    expect(hero.props.nicheLabels).toEqual(['Fashion', 'Beauty']);
    expect(hero.props.metrics).toBe(vm.metrics);
    const body = root.find(isHost('MediaKitShowcaseBody'));
    expect(body.props.kit).toBe(preview);
    expect(body.props.selectable).toBe(false);
  });

  it('public kit → info notice above the sections', () => {
    const { root } = render();
    expect(root.find(isHost('Notice')).props.tone).toBe('info');
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

  it('loading shows skeletons and no footer; error offers retry', () => {
    const loading = render({ status: 'loading', preview: undefined });
    expect(loading.root.findAll(isHost('MediaKitShowcaseHeroSkeleton'))).toHaveLength(1);
    expect(loading.root.findAll(isHost('MediaKitShowcaseBodySkeleton'))).toHaveLength(1);
    expect(loading.root.findAll(isHost('LayoutFooter'))).toHaveLength(0);

    const failed = render({ status: 'error', preview: undefined });
    expect(failed.root.find(isHost('ErrorState')).props.onRetry).toBe(failed.vm.onRetry);
  });
});
