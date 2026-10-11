import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { PublicMediaKit } from '../../../types/mediaKit';
import type { MediaKitPublicScreenModel } from '../hooks/useMediaKitPublicScreen';
import { MediaKitPublicScreen } from '../MediaKitPublicScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
});

jest.mock('lucide-react-native', () => ({
  UserX: 'UserX',
  Lock: 'Lock',
  Heart: 'Heart',
  Share2: 'Share2',
}));

jest.mock('../../../components/MediaKitShowcase', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    MediaKitCover: (props: object) => createElement('MediaKitCover', props),
    MediaKitHeaderBar: (props: object) => createElement('MediaKitHeaderBar', props),
    MediaKitShowcaseBody: (props: object) => createElement('MediaKitShowcaseBody', props),
    MediaKitShowcaseBodySkeleton: () => createElement('MediaKitShowcaseBodySkeleton'),
  };
});

jest.mock('@/shared/ui', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  return {
    EmptyState: stub('EmptyState'),
    ErrorState: stub('ErrorState'),
    Layout: stub('Layout'),
    LayoutFooter: stub('LayoutFooter'),
    Box: stub('Box'),
    Text: stub('Text'),
    MoneyText: stub('MoneyText'),
  };
});

const mockModel: { current: MediaKitPublicScreenModel | null } = { current: null };
jest.mock('../hooks/useMediaKitPublicScreen', () => ({
  useMediaKitPublicScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const kit: PublicMediaKit = {
  slug: 'anas',
  display_name: 'Anas Style',
  avatar_url: null,
  tier: null,
  tier_label: null,
  is_verified: false,
  niches: ['fashion'],
  platforms: [],
  rate_cards: [],
  contract_terms: null,
  price_from_usd: null,
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

const services: MediaKitPublicScreenModel['services'] = {
  groups: [],
  activeGroup: null,
  onGroupChange: jest.fn(),
  selected: new Set(),
  toggleService: jest.fn(),
  total: null,
};

const render = (overrides: Partial<MediaKitPublicScreenModel> = {}) => {
  const vm: MediaKitPublicScreenModel = {
    status: 'ready',
    error: undefined,
    kit,
    nicheLabels: ['Fashion'],
    rateRows: [],
    metrics: [{ key: 'engagement', value: '5.2%' }],
    services,
    selectable: false,
    priceFrom: null,
    footer: 'none',
    priceLock: null,
    onPriceLockAction: jest.fn(),
    canShortlist: false,
    isShortlisted: false,
    savingShortlist: false,
    onSaveToShortlist: jest.fn(),
    onToggleShortlist: jest.fn(),
    onOpenShortlist: jest.fn(),
    onShare: null,
    refreshing: false,
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  };
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitPublicScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

/** Stubs drop element props (`Layout.footer`, `LayoutFooter.top`): render one on its own. */
const mountElement = (element: unknown) => {
  if (!React.isValidElement(element)) throw new Error('not an element');
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(element);
  });
  if (!tree) throw new Error('element render failed');
  return tree.root;
};

const renderFooter = (root: ReactTestInstance) =>
  mountElement(root.find(isHost('Layout')).props.footer).find(isHost('LayoutFooter'));

describe('MediaKitPublicScreen', () => {
  it('renders the pitch: cover hero, identity + sections in the body, no footer for a non-brand', () => {
    const { root, vm } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    expect(layout.props.header.title).toBe('Anas Style');
    expect(layout.props.header.actions).toBeUndefined();
    expect(layout.props.footer).toBeUndefined();
    // No cover → the navy band carries the lights.
    expect(layout.props.heroBackdrop).toBe('brandGlow');
    expect(mountElement(layout.props.hero).find(isHost('MediaKitCover')).props.coverUrl).toBeNull();
    const body = root.find(isHost('MediaKitShowcaseBody'));
    expect(body.props.kit).toBe(kit);
    expect(body.props.nicheLabels).toEqual(['Fashion']);
    expect(body.props.metrics).toBe(vm.metrics);
    expect(body.props.services).toBe(services);
    expect(body.props.selectable).toBe(false);
  });

  it('a cover leads the hero on a plain navy backdrop', () => {
    const coverUrl = 'https://cdn.sada.sy/covers/anas.webp';
    const { root } = render({ kit: { ...kit, cover_url: coverUrl } });
    const layout = root.find(isHost('Layout'));
    expect(layout.props.heroBackdrop).toBe('brand');
    expect(mountElement(layout.props.hero).find(isHost('MediaKitCover')).props.coverUrl).toBe(coverUrl);
  });

  it('brand with prices → offer bar saves to the shortlist, header heart + share', () => {
    const onShare = jest.fn();
    const { root, vm } = render({
      footer: 'offer',
      selectable: true,
      canShortlist: true,
      priceFrom: { amount: 2200, currency: 'USD' },
      onShare,
    });
    const layout = root.find(isHost('Layout'));
    const actions = layout.props.header.actions;
    expect(actions.map((a: { icon: string }) => a.icon)).toEqual(['Heart', 'Share2']);
    expect(actions[0].active).toBe(false);
    expect(actions[0].onPress).toBe(vm.onToggleShortlist);
    expect(actions[1].onPress).toBe(onShare);
    const footer = renderFooter(root);
    expect(footer.props.primary.label).toBe('account.mediaKit.showcase.footer.save');
    expect(footer.props.primary.onPress).toBe(vm.onSaveToShortlist);
  });

  it('already shortlisted → the bar opens the shortlist', () => {
    const { root, vm } = render({ footer: 'offer', selectable: true, canShortlist: true, isShortlisted: true });
    expect(root.find(isHost('Layout')).props.header.actions[0].active).toBe(true);
    const footer = renderFooter(root);
    expect(footer.props.primary.label).toBe('account.mediaKit.showcase.footer.openShortlist');
    expect(footer.props.primary.onPress).toBe(vm.onOpenShortlist);
  });

  it('locked prices → footer with the reason copy and its CTA', () => {
    const { root, vm } = render({
      footer: 'lock',
      priceLock: {
        title: 'marketplace.priceLock.verify.title',
        body: 'marketplace.priceLock.verify.body',
        cta: { label: 'marketplace.priceLock.verify.cta', screen: 'CompanyVerification' },
      },
    });
    const footer = renderFooter(root);
    expect(footer.props.primary.label).toBe('marketplace.priceLock.verify.cta');
    expect(footer.props.primary.onPress).toBe(vm.onPriceLockAction);
    const top = mountElement(footer.props.top);
    const texts = top.findAll(isHost('Text')).map(node => node.props.children);
    expect(texts).toEqual(['marketplace.priceLock.verify.title', 'marketplace.priceLock.verify.body']);
  });

  it('locked in review → footer copy only, no button', () => {
    const { root } = render({
      footer: 'lock',
      priceLock: {
        title: 'marketplace.priceLock.pending.title',
        body: 'marketplace.priceLock.pending.body',
        cta: null,
      },
    });
    expect(renderFooter(root).props.primary).toBeUndefined();
  });

  it('loading reserves the cover band and the body skeleton', () => {
    const { root } = render({ status: 'loading', kit: undefined });
    const layout = root.find(isHost('Layout'));
    expect(layout.props.heroBackdrop).toBe('brand');
    expect(mountElement(layout.props.hero).find(isHost('MediaKitCover')).props.coverUrl).toBeNull();
    expect(root.findAll(isHost('MediaKitShowcaseBodySkeleton'))).toHaveLength(1);
    expect(root.findAll(isHost('MediaKitShowcaseBody'))).toHaveLength(0);
    expect(layout.props.footer).toBeUndefined();
  });

  it('404 → "Profile not available" with a way back, for every cause', () => {
    const { root, vm } = render({ status: 'not_found', kit: undefined });
    const empty = root.find(isHost('EmptyState'));
    expect(empty.props.title).toBe('account.mediaKit.publicScreen.notFoundTitle');
    expect(empty.props.action.onPress).toBe(vm.onBack);
    expect(root.findAll(isHost('ErrorState'))).toHaveLength(0);
  });

  it('other errors offer a retry', () => {
    const { root, vm } = render({ status: 'error', kit: undefined });
    expect(root.find(isHost('ErrorState')).props.onRetry).toBe(vm.onRetry);
  });
});
