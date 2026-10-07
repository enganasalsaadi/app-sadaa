import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { Tag } from '@/shared/ui';
import type { PublicMediaKit } from '../../../types/mediaKit';
import { MediaKitPreviewIdentity } from '../MediaKitPreviewIdentity';

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
    StatusPill: stub('StatusPill'),
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

interface RenderProps {
  preview?: PublicMediaKit;
  nicheLabels?: readonly string[];
}

const render = ({ preview: kit = preview, nicheLabels = ['Fashion', 'Beauty'] }: RenderProps = {}) => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitPreviewIdentity preview={kit} nicheLabels={nicheLabels} />);
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

describe('MediaKitPreviewIdentity', () => {
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
