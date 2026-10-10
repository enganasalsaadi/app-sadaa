import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { ExploreCreator } from '../../../types/explore';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { BrandHomeScreen } from '../BrandHomeScreen';

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
    motion: { duration: { base: 250 }, spring: {} },
  };
});

jest.mock('react-native-reanimated', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const chain: object = new Proxy({}, { get: () => () => chain });
  return {
    __esModule: true,
    default: {
      View: ({ children }: { children?: React.ReactNode }) => createElement('AnimatedView', null, children),
    },
    ZoomIn: chain,
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: () => ({}),
    withSequence: () => 1,
    withSpring: () => 1,
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
  const StaggerIn = ({ children }: { children?: React.ReactNode }) => createElement(Fragment, null, children);
  return {
    Avatar: stub('Avatar'),
    Box: stub('Box'),
    Card: stub('Card'),
    Chip: stub('Chip'),
    CustomButton: stub('CustomButton'),
    EmptyState: stub('EmptyState'),
    IconButton: stub('IconButton'),
    Layout,
    LiveIsland: stub('LiveIsland'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    SearchBar: stub('SearchBar'),
    SectionHeader: stub('SectionHeader'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StaggerIn,
    StatusPill: stub('StatusPill'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
    useHeroCompact: () => false,
  };
});

const mockModel: { current: BrandHomeScreenModel | null } = { current: null };
jest.mock('../hooks/useBrandHomeScreen', () => ({
  useBrandHomeScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const creator = (overrides: Partial<ExploreCreator> = {}): ExploreCreator => ({
  slug: 'reem',
  displayName: 'Reem',
  avatarUrl: null,
  governorate: { value: 'aleppo', label: 'Aleppo' },
  niches: [],
  tier: 'MICRO',
  primaryPlatform: {
    platform: 'instagram',
    platformLabel: 'Instagram',
    followerCount: 48200,
    followerCountVerified: true,
  },
  platforms: ['instagram'],
  badges: { kycVerified: true, followersVerified: true, rush: false, onSite: false, isNew: false },
  fastestDeliveryDays: 2,
  price: { locked: false, from: { amount: 4000, currency: 'USD' }, fromSypApprox: null },
  isShortlisted: false,
  ...overrides,
});

const model = (overrides: Partial<BrandHomeScreenModel> = {}): BrandHomeScreenModel => ({
  status: 'ready',
  error: undefined,
  hero: {
    status: 'ready',
    greeting: 'marketplace.creatorHome.greetingTime.morning',
    companyName: 'Al Noor',
    governorate: 'Damascus',
    wallet: {
      available: { amount: 125000, currency: 'USD' },
      availableSypApprox: { amount: 18750000, currency: 'SYP' },
    },
  },
  island: null,
  hidden: false,
  toggleHidden: jest.fn(),
  rails: [
    {
      key: 'near_you',
      title: 'Near you',
      items: [creator(), creator({ slug: 'omar' })],
      seeAll: { governorate: ['damascus'] },
    },
    {
      key: 'new',
      title: 'New on Sada',
      items: [creator({ slug: 'lina', price: { locked: true, lockReason: 'kyc_pending' } })],
      seeAll: null,
    },
  ],
  hasSupport: true,
  unreadNotifications: 2,
  refreshing: false,
  onRefresh: jest.fn(),
  retry: jest.fn(),
  openProfile: jest.fn(),
  openNotifications: jest.fn(),
  openShortlist: jest.fn(),
  openWallet: jest.fn(),
  openCreator: jest.fn(),
  toggleShortlist: jest.fn(),
  contactSupport: jest.fn(),
  openSearch: jest.fn(),
  categories: [
    { value: 'food', label: 'Food' },
    { value: 'fashion', label: 'Fashion' },
  ],
  categoriesLoading: false,
  openCategory: jest.fn(),
  openRail: jest.fn(),
  browseAll: jest.fn(),
  ...overrides,
});

const render = (overrides: Partial<BrandHomeScreenModel> = {}) => {
  const vm = model(overrides);
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<BrandHomeScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

const byLabel = (root: ReactTestInstance, label: string) =>
  root
    .findAll(node => ['Pressable', 'Card', 'IconButton'].includes(String(node.type)))
    .find(node => node.props.accessibilityLabel === label);
const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(isHost('Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

describe('BrandHomeScreen — chrome', () => {
  it('is a dashboard: lit navy hero under a transparent overlay header', () => {
    const { root } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.headerBehavior).toBe('overlay');
    expect(layout.props.heroBackdrop).toBe('brandGlow');
    expect(layout.props.heroBehavior).toBe('parallax');
  });

  it('puts ❤️ (shortlist) beside the bell, which carries the unread count', () => {
    const { root, vm } = render();
    const { actions } = root.find(isHost('Layout')).props.header;
    expect(actions).toHaveLength(2);
    expect(actions[0].accessibilityLabel).toBe('marketplace.shortlist.open');
    expect(actions[0].onPress).toBe(vm.openShortlist);
    expect(actions[1].badge).toBe(2);
    expect(actions[1].onPress).toBe(vm.openNotifications);
  });
});

describe('BrandHomeScreen — hero', () => {
  it('greets, names the company and its governorate, and opens the account', () => {
    const { root, vm } = render();
    const text = textOf(root);
    expect(text).toContain('marketplace.creatorHome.greetingTime.morning');
    expect(text).toContain('Al Noor');
    expect(text).toContain('Damascus');
    byLabel(root, 'marketplace.brandHome.openProfile:{"name":"Al Noor"}')?.props.onPress();
    expect(vm.openProfile).toHaveBeenCalled();
  });

  it('rolls the balance up once with ≈ SYP under it, and opens the wallet', () => {
    const { root, vm } = render();
    const [usd, syp] = root.findAll(isHost('MoneyText'));
    expect(usd?.props).toMatchObject({ value: { amount: 125000, currency: 'USD' }, animated: true, hidden: false });
    expect(syp?.props).toMatchObject({ value: { amount: 18750000, currency: 'SYP' }, estimate: true });
    byLabel(root, 'marketplace.brandHome.wallet.open')?.props.onPress();
    expect(vm.openWallet).toHaveBeenCalled();
  });

  it('masks the balance and drops the SYP line when amounts are hidden', () => {
    const { root, vm } = render({ hidden: true });
    // Hero amounts only: the rail cards show prices too.
    const amounts = root
      .findAll(isHost('MoneyText'))
      .filter(n => n.props.value.amount === 125000 || n.props.value.currency === 'SYP');
    expect(amounts).toHaveLength(1);
    expect(amounts[0]?.props.hidden).toBe(true);
    byLabel(root, 'finance.wallet.showAmounts')?.props.onPress();
    expect(vm.toggleHidden).toHaveBeenCalled();
  });

  it('shows the server blocker as a live island that routes its CTA', () => {
    const onPress = jest.fn();
    const { root } = render({
      island: {
        key: 'verify_account',
        tone: 'warning',
        title: 'Verify your account',
        message: 'See prices',
        hint: 'Start',
        onPress,
      },
    });
    const island = root.find(isHost('LiveIsland'));
    expect(island.props).toMatchObject({ title: 'Verify your account', message: 'See prices', tone: 'warning' });
    island.props.onPress();
    expect(onPress).toHaveBeenCalled();
  });

  it('keeps the island out when the server sends none', () => {
    const { root } = render();
    expect(root.findAll(isHost('LiveIsland'))).toHaveLength(0);
  });
});

describe('BrandHomeScreen — rails', () => {
  it('renders each rail with its compact cards', () => {
    const { root } = render();
    expect(root.findAll(isHost('SectionHeader')).map(n => n.props.title)).toEqual(['Near you', 'New on Sada']);
    expect(root.findAll(isHost('Card')).filter(n => n.props.onPress)).toHaveLength(3);
  });

  it('opens a creator and toggles ❤️ without opening the card', () => {
    const { root, vm } = render();
    byLabel(root, 'Reem')?.props.onPress();
    expect(vm.openCreator).toHaveBeenCalledWith(expect.objectContaining({ slug: 'reem' }));
    byLabel(root, 'marketplace.shortlist.add')?.props.onPress();
    expect(vm.toggleShortlist).toHaveBeenCalledWith(expect.objectContaining({ slug: 'reem' }));
    expect(vm.openCreator).toHaveBeenCalledTimes(1);
  });

  it('shows the price, or the lock line for the viewer\'s reason', () => {
    const { root } = render();
    const text = textOf(root);
    expect(text).toContain('marketplace.creator.priceFrom');
    expect(text).toContain('marketplace.creator.priceLock.pending');
  });

  it('offers Explore when every rail is empty', () => {
    const { root, vm } = render({ rails: [] });
    const empty = root.find(isHost('EmptyState'));
    expect(empty.props.action.label).toBe('marketplace.brandHome.empty.explore');
    empty.props.action.onPress();
    expect(vm.browseAll).toHaveBeenCalled();
  });

  it('shows "See all" only on rails the server gave filters for', () => {
    const { root, vm } = render();
    const [near, fresh] = root.findAll(isHost('SectionHeader'));
    expect(fresh?.props.action).toBeUndefined();
    expect(near?.props.action.label).toBe('marketplace.brandHome.seeAll');
    near?.props.action.onPress();
    expect(vm.openRail).toHaveBeenCalledWith(expect.objectContaining({ key: 'near_you' }));
  });
});

describe('BrandHomeScreen — Explore entry', () => {
  it('opens Explore from the search field', () => {
    const { root, vm } = render();
    byLabel(root, 'marketplace.explore.searchPlaceholder')?.props.onPress();
    expect(vm.openSearch).toHaveBeenCalled();
  });

  it('opens Explore prefilled from a category chip', () => {
    const { root, vm } = render();
    const chips = root.findAll(isHost('Chip'));
    expect(chips.map(chip => chip.props.label)).toEqual(['Food', 'Fashion']);
    chips[1]?.props.onSelect('fashion');
    expect(vm.openCategory).toHaveBeenCalledWith('fashion');
  });

  it('reserves chip space while categories load, and hides them when there are none', () => {
    expect(render({ categoriesLoading: true }).root.findAll(isHost('Chip'))).toHaveLength(0);
    expect(render({ categories: [] }).root.findAll(isHost('Chip'))).toHaveLength(0);
  });
});

describe('BrandHomeScreen — states', () => {
  it('reserves skeleton rails while Home loads', () => {
    const { root } = render({
      status: 'loading',
      rails: [],
      hero: { ...model().hero, status: 'loading', wallet: null },
    });
    expect(root.findAll(isHost('Skeleton')).length).toBeGreaterThan(3);
    expect(root.findAll(isHost('SectionHeader'))).toHaveLength(0);
  });

  it('shows a retry banner and a dash for the balance when Home fails', () => {
    const { root, vm } = render({
      status: 'error',
      rails: [],
      hero: { ...model().hero, status: 'error', wallet: null },
    });
    const notice = root.find(isHost('Notice'));
    notice.props.action.onPress();
    expect(vm.retry).toHaveBeenCalled();
    expect(textOf(root)).toContain('—');
  });

  it('opens support from the help card, and hides it without a link', () => {
    const { root, vm } = render();
    root.find(isHost('CustomButton')).props.onPress();
    expect(vm.contactSupport).toHaveBeenCalled();
    expect(render({ hasSupport: false }).root.findAll(isHost('CustomButton'))).toHaveLength(0);
  });
});
