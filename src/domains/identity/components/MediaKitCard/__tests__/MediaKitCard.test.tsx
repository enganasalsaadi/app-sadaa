import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { CustomButton, IconButton, Notice, StatTile, Tag } from '@/shared/ui';
import type { PublicMediaKit } from '../../../types/mediaKit';
import type { MediaKitTile } from '../../../utils/mediaKitCard';
import { MediaKitCard } from '../MediaKitCard';
import type { MediaKitCardProps } from '../MediaKitCard';

const isHost = (node: ReactTestInstance, type: string): boolean => node.type === type;

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
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
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

jest.mock('@/shared/ui', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  return {
    Avatar: stub('Avatar'),
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    IconButton: stub('IconButton'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StatTile: stub('StatTile'),
    Tag: stub('Tag'),
    TierBadge: stub('TierBadge'),
    Text: stub('Text'),
  };
});

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
      display_name: null,
      follower_count: 45210,
      follower_count_verified: true,
      follower_tier: 'MICRO',
      follower_tier_label: 'Micro',
      is_primary: true,
    },
  ],
  rate_cards: [],
  price_from_usd: 30,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
};

const tiles: MediaKitTile[] = [
  { key: 'profile_views', value: 1240, change: 0.12 },
  { key: 'unique_brand_views', value: 38, change: 0.267 },
  { key: 'link_opens', value: 96, change: 'new' },
];

const fn = () => jest.fn();

const baseProps = (): MediaKitCardProps => ({
  status: 'ready',
  preview,
  link: 'https://sada.app/c/anas',
  nicheLabels: ['Fashion', 'Beauty'],
  stats: { status: 'ready', tiles },
  share: {
    isReady: true,
    isSharing: false,
    error: null,
    canRetry: false,
    isMakingPublic: false,
    onShare: fn(),
    onCopy: fn(),
    onRetry: fn(),
    onDismissError: fn(),
    onMakePublic: fn(),
  },
  onRetry: fn(),
  onRetryStats: fn(),
});

const render = (overrides: Partial<MediaKitCardProps> = {}) => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitCard {...baseProps()} {...overrides} />);
  });
  if (!tree) {
    throw new Error('render failed');
  }
  return tree.root;
};

const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(n => isHost(n, 'Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

const icons = (root: ReactTestInstance, name: string) =>
  root.findAll(n => isHost(n, 'Icon') && n.props.name === name);

describe('MediaKitCard — stat tiles', () => {
  it('renders one tile per metric it was given', () => {
    const root = render();
    const rendered = root.findAllByType(StatTile);
    expect(rendered.map(t => t.props.label)).toEqual([
      'account.mediaKit.tiles.views',
      'account.mediaKit.tiles.brands',
      'account.mediaKit.tiles.linkOpens',
    ]);
  });

  it('hides tiles that are absent (a metric that is not live yet)', () => {
    const root = render();
    expect(
      root.findAllByType(StatTile).some(t => t.props.label === 'account.mediaKit.tiles.offers'),
    ).toBe(false);
  });

  it('shows a fourth tile once offers ship, laid out 2 × 2', () => {
    const root = render({
      stats: {
        status: 'ready',
        tiles: [...tiles, { key: 'offers_from_profile', value: 4, change: -0.2 }],
      },
    });
    const rendered = root.findAllByType(StatTile);
    expect(rendered).toHaveLength(4);
    expect(new Set(rendered.map(t => t.parent)).size).toBe(2);
  });

  it('passes "new" through when there is no previous period, and fractions otherwise', () => {
    const root = render();
    const changes = root.findAllByType(StatTile).map(t => t.props.change);
    expect(changes).toEqual([0.12, 0.267, 'new']);
  });

  it('swaps the tiles for a "share your link" prompt when there is no activity yet', () => {
    const root = render({
      stats: {
        status: 'ready',
        tiles: tiles.map(tile => ({ ...tile, value: 0, change: undefined })),
      },
    });
    expect(root.findAllByType(StatTile)).toHaveLength(0);
    expect(textOf(root)).toContain('account.mediaKit.noActivity');
  });

  it('shows placeholder tiles while stats load', () => {
    const root = render({ stats: { status: 'loading', tiles: [] } });
    const rendered = root.findAllByType(StatTile);
    expect(rendered).toHaveLength(3);
    expect(rendered.every(t => t.props.loading === true)).toBe(true);
  });

  it('keeps a stats failure inside the card, with a retry', () => {
    const onRetryStats = jest.fn();
    const root = render({ stats: { status: 'error', tiles: [] }, onRetryStats });
    expect(root.findAllByType(StatTile)).toHaveLength(0);
    const notice = root.findByType(Notice);
    expect(notice.props.message).toBe('account.mediaKit.statsFailed');
    act(() => notice.props.action.onPress());
    expect(onRetryStats).toHaveBeenCalledTimes(1);
    // the rest of the card is still usable
    expect(root.findAllByType(CustomButton)).toHaveLength(1);
  });
});

describe('MediaKitCard — share and copy triggers', () => {
  it('fires onShare from the one primary button', () => {
    const props = baseProps();
    const onShare = props.share.onShare;
    const root = render(props);
    const button = root.findByType(CustomButton);
    expect(button.props.title).toBe('account.mediaKit.share.cta');
    act(() => button.props.onPress());
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('fires onCopy from the copy icon', () => {
    const props = baseProps();
    const onCopy = props.share.onCopy;
    const root = render(props);
    const copy = root.findByType(IconButton);
    expect(copy.props.accessibilityLabel).toBe('account.mediaKit.share.copy');
    act(() => copy.props.onPress());
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('shows the link without its protocol', () => {
    expect(textOf(render())).toContain('sada.app/c/anas');
  });

  it('shows the button loading while sharing and locks copy', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isSharing: true } });
    expect(root.findByType(CustomButton).props.loading).toBe(true);
    expect(root.findByType(IconButton).props.disabled).toBe(true);
  });

  it('disables both triggers until the share URL is known', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isReady: false } });
    expect(root.findByType(CustomButton).props.disabled).toBe(true);
    expect(root.findByType(IconButton).props.disabled).toBe(true);
  });

  it('disables Share while the kit is being made public', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isMakingPublic: true } });
    expect(root.findByType(CustomButton).props.disabled).toBe(true);
  });
});

describe('MediaKitCard — share errors', () => {
  it('prompts "Make public" when the kit is hidden', () => {
    const props = baseProps();
    const onMakePublic = props.share.onMakePublic;
    const root = render({ share: { ...props.share, error: 'private' } });
    const notice = root.findByType(Notice);
    expect(notice.props.title).toBe('account.mediaKit.share.privateTitle');
    expect(notice.props.action.label).toBe('account.mediaKit.share.makePublic');
    act(() => notice.props.action.onPress());
    expect(onMakePublic).toHaveBeenCalledTimes(1);
  });

  it('offers a retry for a failed share, and dismisses', () => {
    const props = baseProps();
    const { onRetry, onDismissError } = props.share;
    const root = render({ share: { ...props.share, error: 'failed', canRetry: true } });
    const notice = root.findByType(Notice);
    act(() => notice.props.action.onPress());
    act(() => notice.props.onDismiss());
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('has no retry when the failure cannot be replayed', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, error: 'rate_limited', canRetry: false } });
    const notice = root.findByType(Notice);
    expect(notice.props.message).toBe('account.mediaKit.share.rateLimited');
    expect(notice.props.action).toBeUndefined();
  });

  it('shows no notice when nothing went wrong', () => {
    expect(render().findAllByType(Notice)).toHaveLength(0);
  });
});

describe('MediaKitCard — states', () => {
  it('reserves space with skeletons while the kit loads', () => {
    const root = render({ status: 'loading', preview: undefined, link: undefined });
    expect(root.findAllByType(CustomButton)).toHaveLength(0);
    expect(root.findAll(n => isHost(n, 'Skeleton')).length).toBeGreaterThan(0);
  });

  it('shows a retryable error when the kit fails to load', () => {
    const onRetry = jest.fn();
    const root = render({ status: 'error', preview: undefined, link: undefined, onRetry });
    const notice = root.findByType(Notice);
    expect(notice.props.message).toBe('account.mediaKit.loadFailed');
    act(() => notice.props.action.onPress());
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows Insights / Preview links only when their screens are wired', () => {
    const none = render();
    expect(none.findAll(n => isHost(n, 'Pressable'))).toHaveLength(0);

    const onOpenInsights = jest.fn();
    const onOpenPreview = jest.fn();
    const both = render({ onOpenInsights, onOpenPreview });
    const links = both.findAll(n => isHost(n, 'Pressable'));
    expect(links.map(l => l.props.accessibilityLabel)).toEqual([
      'account.mediaKit.insights',
      'account.mediaKit.preview',
    ]);
    act(() => links[0]?.props.onPress());
    act(() => links[1]?.props.onPress());
    expect(onOpenInsights).toHaveBeenCalledTimes(1);
    expect(onOpenPreview).toHaveBeenCalledTimes(1);
  });
});

describe('MediaKitCard — identity', () => {
  it('shows name, niches and the lowest price', () => {
    const root = render();
    expect(textOf(root)).toContain('Anas Style');
    expect(root.findAllByType(Tag).map(t => t.props.label)).toEqual(['Fashion', 'Beauty']);
    const price = root.findAll(n => isHost(n, 'MoneyText'));
    expect(price[0]?.props.value).toEqual({ amount: 3000, currency: 'USD' });
  });

  it('ticks the follower count only when it is verified', () => {
    expect(icons(render(), 'CheckCircle2')).toHaveLength(1);
    const [first] = preview.platforms;
    if (!first) {
      throw new Error('fixture needs a platform');
    }
    const unverified = render({
      preview: { ...preview, platforms: [{ ...first, follower_count_verified: false }] },
    });
    expect(icons(unverified, 'CheckCircle2')).toHaveLength(0);
  });

  it('marks a KYC-verified creator, and omits tier, price and niches when absent', () => {
    expect(icons(render(), 'BadgeCheck')).toHaveLength(1);
    const root = render({
      preview: {
        ...preview,
        display_name: null,
        is_verified: false,
        tier: null,
        platforms: [],
        price_from_usd: null,
      },
      nicheLabels: [],
    });
    expect(icons(root, 'BadgeCheck')).toHaveLength(0);
    expect(root.findAll(n => isHost(n, 'TierBadge'))).toHaveLength(0);
    expect(root.findAll(n => isHost(n, 'MoneyText'))).toHaveLength(0);
    expect(root.findAllByType(Tag)).toHaveLength(0);
    // no display name → the slug stands in
    expect(textOf(root)).toContain('anas');
  });
});
