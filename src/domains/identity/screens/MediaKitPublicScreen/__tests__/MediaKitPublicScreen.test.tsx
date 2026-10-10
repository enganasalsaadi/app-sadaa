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

jest.mock('lucide-react-native', () => ({ UserX: 'UserX', Lock: 'Lock' }));

jest.mock('../../../components/MediaKitPreview', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    MediaKitPreview: (props: object) => createElement('MediaKitPreview', props),
    MediaKitPreviewSkeleton: () => createElement('MediaKitPreviewSkeleton'),
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
};

const render = (overrides: Partial<MediaKitPublicScreenModel> = {}) => {
  const vm: MediaKitPublicScreenModel = {
    status: 'ready',
    error: undefined,
    kit,
    nicheLabels: ['Fashion'],
    rateRows: [],
    priceLock: null,
    onPriceLockAction: jest.fn(),
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
  it('renders the kit with localised niches and no footer CTA', () => {
    const { root } = render();
    const preview = root.find(isHost('MediaKitPreview'));
    expect(preview.props.preview).toBe(kit);
    expect(preview.props.nicheLabels).toEqual(['Fashion']);
    const layout = root.find(isHost('Layout'));
    expect(layout.props.header.title).toBe('account.mediaKit.publicScreen.title');
    expect(layout.props.footer).toBeUndefined();
  });

  it('locked prices → footer with the reason copy and its CTA', () => {
    const { root, vm } = render({
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
      priceLock: {
        title: 'marketplace.priceLock.pending.title',
        body: 'marketplace.priceLock.pending.body',
        cta: null,
      },
    });
    expect(renderFooter(root).props.primary).toBeUndefined();
  });

  it('loading reserves space with the skeleton', () => {
    const { root } = render({ status: 'loading', kit: undefined });
    expect(root.findAll(isHost('MediaKitPreviewSkeleton'))).toHaveLength(1);
    expect(root.findAll(isHost('MediaKitPreview'))).toHaveLength(0);
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
