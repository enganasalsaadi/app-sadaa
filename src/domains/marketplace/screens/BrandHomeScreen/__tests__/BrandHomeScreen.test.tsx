import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { BrandActiveCampaign, BrandActiveDeal } from '../../../types';
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
  formatMoney: ({ amount }: { amount: number }) => `$${(amount / 100).toFixed(2)}`,
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
      radii: tokens,
      shadows: tokens,
      borderWidths: tokens,
      isRTL: false,
    }),
    useStyles: () => tokens,
    resolveHue: () => tokens,
    moderateScale: (n: number) => n,
    iconStroke: { regular: 2, bold: 2.5 },
    motion: { duration: { base: 250 }, spring: {} },
  };
});

jest.mock('react-native-reanimated', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    __esModule: true,
    default: {
      View: ({ children, ...props }: { children?: React.ReactNode }) =>
        createElement('AnimatedView', props, children),
    },
    cancelAnimation: () => undefined,
    Easing: { inOut: () => undefined, sin: undefined },
    interpolate: () => 1,
    useReducedMotion: () => false,
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: () => ({}),
    withRepeat: () => 1,
    withSequence: () => 1,
    withSpring: () => 1,
    withTiming: () => 1,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  return {
    GestureDetector: ({ children }: { children?: React.ReactNode }) => createElement(Fragment, null, children),
  };
});

jest.mock('react-native-linear-gradient', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return ({ children }: { children?: React.ReactNode }) => createElement('LinearGradient', null, children);
});

const mockNextStep = jest.fn();
jest.mock('../../../hooks/useNextStepDeck', () => ({
  useNextStepDeck: () => ({ gesture: {}, drag: { value: 0 }, enter: { value: 0 }, index: 0, next: mockNextStep }),
}));

const mockNow = Date.parse('2026-10-15T09:00:00Z');
jest.mock('../../../hooks/useClock', () => ({ useClock: () => mockNow }));

const mockDeckNext = jest.fn();
jest.mock('../hooks/useStoryDeck', () => ({
  DECK_THROW_DISTANCE: 90,
  useStoryDeck: () => ({ gesture: {}, base: { value: 0 }, drag: { value: 0 }, top: 0, next: mockDeckNext }),
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
  const StaggerIn = ({ children }: { children?: React.ReactNode }) => createElement(Fragment, null, children);
  return {
    Badge: stub('Badge'),
    Box: stub('Box'),
    CustomButton: stub('CustomButton'),
    EmptyState: stub('EmptyState'),
    GradientSurface: stub('GradientSurface'),
    Image: stub('Image'),
    Layout: stub('Layout'),
    LiveDot: stub('LiveDot'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    Rail: stub('Rail'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StaggerIn,
    StatusPill: stub('StatusPill'),
    Text: stub('Text'),
    TierBadge: stub('TierBadge'),
    useScreenFocused: () => true,
  };
});

const mockModel: { current: BrandHomeScreenModel | null } = { current: null };
jest.mock('../hooks/useBrandHomeScreen', () => ({
  useBrandHomeScreen: () => mockModel.current,
}));

const mockIcon = (name: string) => {
  const Icon = () => null;
  Icon.displayName = name;
  return Icon as unknown as BrandHomeScreenModel['categories'][number]['icon'];
};

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
    canTopUp: false,
  },
  island: null,
  hidden: false,
  rails: [
    {
      key: 'near_you',
      title: 'Near you',
      items: [creator(), creator({ slug: 'omar', displayName: 'Omar' })],
      seeAll: { governorate: ['damascus'] },
    },
    {
      key: 'verified',
      title: 'Verified',
      items: [creator({ slug: 'lina', displayName: 'Lina', price: { locked: true, lockReason: 'kyc_pending' } })],
      seeAll: { kycVerified: true },
    },
    {
      key: 'fast_delivery',
      title: 'Fast delivery',
      items: [creator({ slug: 'sara', displayName: 'Sara', fastestDeliveryDays: 1 })],
      seeAll: { rush: true },
    },
    {
      key: 'new',
      title: 'New on Sada',
      items: [creator({ slug: 'yousef', displayName: 'Yousef Khatib' })],
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
  openTopUp: jest.fn(),
  openCreator: jest.fn(),
  toggleShortlist: jest.fn(),
  contactSupport: jest.fn(),
  openSearch: jest.fn(),
  categories: [
    { value: 'restaurants', label: 'Food', icon: mockIcon('Utensils') },
    { value: 'fashion', label: 'Fashion', icon: mockIcon('Shirt') },
  ],
  openCategory: jest.fn(),
  openRail: jest.fn(),
  browseAll: jest.fn(),
  deals: { kind: 'hidden' },
  openDeal: jest.fn(),
  openDeals: jest.fn(),
  campaigns: { kind: 'hidden' },
  openCampaignAction: jest.fn(),
  ...overrides,
});

const HOUR = 3_600_000;
const activeDeal = (overrides: Partial<BrandActiveDeal> = {}): BrandActiveDeal => ({
  id: 'd1',
  status: { key: 'negotiating_deadline', label: 'Extension asked' },
  stage: null,
  creator: { name: 'Lana', avatarUrl: null, slug: null },
  title: 'Instagram reel ×2',
  total: { amount: 24000, currency: 'USD' },
  dueAt: mockNow + 6 * HOUR,
  needsAction: true,
  action: { key: 'answer_extension', label: 'Answer the extension' },
  campaign: null,
  ...overrides,
});
const waitingDeals = [
  activeDeal(),
  activeDeal({
    id: 'd2',
    creator: { name: 'Sara', avatarUrl: null, slug: null },
    status: { key: 'awaiting_payment', label: 'Awaiting payment' },
    total: { amount: 9000, currency: 'USD' },
    dueAt: mockNow + 50 * HOUR,
    action: { key: 'fund', label: 'Pay to start' },
  }),
];
const movingDeals = [
  activeDeal({
    id: 'd3',
    creator: { name: 'Nour', avatarUrl: null, slug: null },
    status: { key: 'in_progress', label: 'In progress' },
    stage: { key: 'verifying_live', label: 'Checking the post' },
    needsAction: false,
    action: null,
  }),
  activeDeal({
    id: 'd4',
    creator: { name: 'Ahmad', avatarUrl: null, slug: null },
    status: { key: 'disputed', label: 'Dispute' },
    needsAction: false,
    action: null,
    dueAt: null,
  }),
];
const dealsModel = (
  overrides: Partial<Extract<BrandHomeScreenModel['deals'], { kind: 'deals' }>> = {},
): BrandHomeScreenModel['deals'] => ({
  kind: 'deals',
  waiting: waitingDeals,
  moving: movingDeals,
  needsActionCount: 2,
  movingCount: 8,
  moreCount: 10,
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
    .findAll(isHost('Pressable'))
    .find(node => node.props.accessibilityLabel === label);
const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(isHost('Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

describe('BrandHomeScreen — top', () => {
  it('is a plain scroll page: no navy band, no overlay header', () => {
    const { root } = render();
    const layout = root.find(isHost('Layout'));
    expect(layout.props.hero).toBeUndefined();
    expect(layout.props.header).toBeUndefined();
  });

  it('greets, names "company · city" and opens the account', () => {
    const { root, vm } = render();
    const text = textOf(root);
    expect(text).toContain('marketplace.creatorHome.greetingTime.morning');
    expect(text).toContain('Al Noor · Damascus');
    byLabel(root, 'marketplace.brandHome.openProfile:{"name":"Al Noor"}')?.props.onPress();
    expect(vm.openProfile).toHaveBeenCalled();
  });

  it('puts ❤️ (shortlist) beside the bell, which carries the unread count', () => {
    const { root, vm } = render();
    byLabel(root, 'marketplace.shortlist.open')?.props.onPress();
    expect(vm.openShortlist).toHaveBeenCalled();
    const bell = byLabel(root, 'notifications.inbox.openUnread:{"count":2}');
    expect(bell?.findByType('Badge' as never).props.count).toBe(2);
    bell?.props.onPress();
    expect(vm.openNotifications).toHaveBeenCalled();
  });

  it('shows the balance on its own quiet line (not mint text) that opens the wallet', () => {
    const { root, vm } = render();
    const balance = root.findAll(isHost('MoneyText')).find(n => n.props.value.amount === 125000);
    expect(balance?.props).toMatchObject({ hidden: false, rounding: 'down' });
    expect(balance?.props.tone).toBeUndefined();
    // One amount: the ≈ SYP line stays on the wallet tab.
    expect(root.findAll(isHost('MoneyText')).some(n => n.props.value.currency === 'SYP')).toBe(false);
    byLabel(root, 'marketplace.brandHome.wallet.open')?.props.onPress();
    expect(vm.openWallet).toHaveBeenCalled();
  });

  it('offers "Top up" only when /me allows it', () => {
    expect(byLabel(render().root, 'finance.wallet.deposit')).toBeUndefined();
    const { root, vm } = render({ hero: { ...model().hero, canTopUp: true } });
    byLabel(root, 'finance.wallet.deposit')?.props.onPress();
    expect(vm.openTopUp).toHaveBeenCalled();
  });

  it('masks the balance when amounts are hidden', () => {
    const { root } = render({ hidden: true });
    const balance = root.findAll(isHost('MoneyText')).find(n => n.props.value.amount === 125000);
    expect(balance?.props.hidden).toBe(true);
  });

  it('shows the server blocker (title + line) and routes its CTA', () => {
    const onPress = jest.fn();
    const { root } = render({
      island: {
        key: 'verify_account',
        tone: 'warning',
        title: 'Verify your account',
        message: 'See prices',
        note: null,
        hint: 'Start',
        onPress,
      },
    });
    const island = byLabel(root, 'marketplace.brandHome.islandLabel:{"title":"Verify your account","message":"See prices"}');
    expect(island?.props.accessibilityHint).toBe('Start');
    expect(textOf(root)).toContain('See prices');
    island?.props.onPress();
    expect(onPress).toHaveBeenCalled();
    expect(root.findAll(isHost('LiveDot'))).toHaveLength(1);
  });

  it('keeps the island out when the server sends none', () => {
    expect(render().root.findAll(isHost('LiveDot'))).toHaveLength(0);
  });
});

describe('BrandHomeScreen — rails', () => {
  it('gives every rail its own shape, in server order', () => {
    const { root } = render();
    const titles = root
      .findAll(isHost('Text'))
      .filter(n => n.props.accessibilityRole === 'header')
      .map(n => n.children.join(''));
    // The page's question first, then one heading per rail.
    expect(titles.slice(1)).toEqual(['Near you', 'Verified', 'Fast delivery', 'New on Sada']);
    expect(textOf(root)).toContain('marketplace.brandHome.railCount:{"count":2}');
    // Verified tiles, fast rows and rings each open the creator.
    expect(byLabel(root, 'Lina')).toBeDefined();
    const fastRow = root
      .findAll(isHost('Pressable'))
      .find(n => String(n.props.accessibilityLabel).startsWith('marketplace.brandHome.fastRowLabel:'));
    expect(fastRow?.props.accessibilityLabel).toContain('"name":"Sara"');
    expect(textOf(root)).toContain('Yousef');
  });

  it('opens a deck card, ❤️ toggles without opening, and "next" throws the top card', () => {
    const { root, vm } = render();
    const card = byLabel(root, 'marketplace.brandHome.deck.cardLabel:{"name":"Reem","meta":"Aleppo"}');
    card?.props.onPress();
    expect(vm.openCreator).toHaveBeenCalledWith(expect.objectContaining({ slug: 'reem' }));
    byLabel(root, 'marketplace.shortlist.add')?.props.onPress();
    expect(vm.toggleShortlist).toHaveBeenCalled();
    expect(vm.openCreator).toHaveBeenCalledTimes(1);
    card?.props.onAccessibilityAction({ nativeEvent: { actionName: 'next' } });
    expect(mockDeckNext).toHaveBeenCalled();
  });

  it('shows the price, or the lock line for the viewer\'s reason', () => {
    const text = textOf(render().root);
    expect(text).toContain('marketplace.creator.priceFrom');
    expect(text).toContain('marketplace.creator.priceLock.pending');
  });

  it('shows the delivery days as the fast row\'s big figure', () => {
    const text = textOf(render().root);
    expect(text).toContain('marketplace.brandHome.dayUnit:{"count":1}');
  });

  it('shows "See all" only on rails the server gave filters for', () => {
    const { root, vm } = render();
    expect(byLabel(root, 'marketplace.brandHome.seeAllOf:{"title":"New on Sada"}')).toBeUndefined();
    byLabel(root, 'marketplace.brandHome.seeAllOf:{"title":"Near you"}')?.props.onPress();
    expect(vm.openRail).toHaveBeenCalledWith(expect.objectContaining({ key: 'near_you' }));
  });

  it('offers Explore when every rail is empty', () => {
    const { root, vm } = render({ rails: [] });
    const empty = root.find(isHost('EmptyState'));
    expect(empty.props.action.label).toBe('marketplace.brandHome.empty.explore');
    empty.props.action.onPress();
    expect(vm.browseAll).toHaveBeenCalled();
  });
});

describe('BrandHomeScreen — Explore entry', () => {
  it('opens Explore from search, and for browsing from the filter key', () => {
    const { root, vm } = render();
    byLabel(root, 'marketplace.explore.searchPlaceholder')?.props.onPress();
    expect(vm.openSearch).toHaveBeenCalled();
    byLabel(root, 'marketplace.brandHome.filters')?.props.onPress();
    expect(vm.browseAll).toHaveBeenCalled();
  });

  it('opens Explore prefilled from a category chip, "All" without a filter', () => {
    const { root, vm } = render();
    byLabel(root, 'Fashion')?.props.onPress();
    expect(vm.openCategory).toHaveBeenCalledWith('fashion');
    byLabel(root, 'marketplace.brandHome.allCategories')?.props.onPress();
    expect(vm.browseAll).toHaveBeenCalledTimes(1);
  });

  it('hides the chips when there are no categories', () => {
    expect(byLabel(render({ categories: [] }).root, 'marketplace.brandHome.allCategories')).toBeUndefined();
  });
});

describe('BrandHomeScreen — states', () => {
  it('reserves a skeleton deck and rows while Home loads', () => {
    const { root } = render({
      status: 'loading',
      rails: [],
      hero: { ...model().hero, status: 'loading', wallet: null },
    });
    expect(root.findAll(isHost('Skeleton')).length).toBeGreaterThan(5);
    expect(root.findAll(isHost('EmptyState'))).toHaveLength(0);
  });

  it('shows a retry banner and a dash for the balance when Home fails', () => {
    const { root, vm } = render({
      status: 'error',
      rails: [],
      hero: { ...model().hero, status: 'error', wallet: null },
    });
    root.find(isHost('Notice')).props.action.onPress();
    expect(vm.retry).toHaveBeenCalled();
    expect(textOf(root)).toContain('—');
  });

  it('opens support from the closing line, and hides it without a link', () => {
    const { root, vm } = render();
    byLabel(root, 'marketplace.brandHome.support.action')?.props.onPress();
    expect(vm.contactSupport).toHaveBeenCalled();
    expect(byLabel(render({ hasSupport: false }).root, 'marketplace.brandHome.support.action')).toBeUndefined();
  });
});

describe('BrandHomeScreen — your deals', () => {
  it('leads with the next step: the server action, time left, one named button that opens the deal', () => {
    const { root, vm } = render({ deals: dealsModel() });
    const text = textOf(root);
    expect(text).toContain('marketplace.brandHome.deals.waiting:{"count":2}');
    expect(text).toContain('marketplace.brandHome.deals.moving:{"count":8}');
    expect(text).toContain('Answer the extension');
    expect(text).toContain('marketplace.brandHome.deals.next.position:{"index":1,"count":2}');
    expect(text).toContain('Instagram reel ×2 · $240.00');
    expect(text).toContain('marketplace.brandHome.deals.next.left:');
    // The next card peeks from behind.
    expect(text).toContain('marketplace.brandHome.deals.next.peek:{"name":"Sara","action":"Pay to start"}');
    const cta = byLabel(root, 'marketplace.brandHome.deals.next.cardLabel:{"name":"Lana","action":"Answer the extension"}');
    expect(textOf(cta as ReactTestInstance)).toContain('marketplace.brandHome.deals.cta.answerExtension');
    cta?.props.onPress();
    expect(vm.openDeal).toHaveBeenCalledWith('d1');
    byLabel(root, 'marketplace.brandHome.deals.next.nextLabel')?.props.onPress();
    expect(mockNextStep).toHaveBeenCalled();
  });

  it('puts the rest on trackers: server labels, a red stop for a dispute, each row opens its deal', () => {
    const { root, vm } = render({ deals: dealsModel() });
    const rows = root
      .findAll(isHost('Pressable'))
      .filter(n => String(n.props.accessibilityLabel).startsWith('marketplace.brandHome.deals.rowLabel:'));
    expect(rows).toHaveLength(2);
    expect(rows[0]?.props.accessibilityLabel).toContain('marketplace.brandHome.deals.stops.publish · Checking the post');
    expect(textOf(rows[1] as ReactTestInstance)).toContain('Dispute');
    rows[0]?.props.onPress();
    expect(vm.openDeal).toHaveBeenCalledWith('d3');
    const more = root
      .findAll(isHost('Pressable'))
      .find(n => textOf(n) === 'marketplace.brandHome.deals.seeAllCount:{"count":10}');
    more?.props.onPress();
    expect(vm.openDeals).toHaveBeenCalled();
  });

  it('has no arrow or peek with a single waiting deal, and no footer when every deal is shown', () => {
    const { root } = render({ deals: dealsModel({ waiting: waitingDeals.slice(0, 1), moreCount: null }) });
    expect(byLabel(root, 'marketplace.brandHome.deals.next.nextLabel')).toBeUndefined();
    expect(textOf(root)).not.toContain('marketplace.brandHome.deals.next.peek');
    expect(textOf(root)).not.toContain('marketplace.brandHome.deals.seeAllCount');
  });

  it('says «all smooth» when nothing waits on the brand', () => {
    const { root } = render({ deals: dealsModel({ waiting: [], needsActionCount: 0 }) });
    const text = textOf(root);
    expect(text).toContain('marketplace.brandHome.deals.calm.title');
    expect(text).not.toContain('marketplace.brandHome.deals.waiting');
    expect(text).not.toContain('marketplace.brandHome.deals.next.label');
  });

  it('shows the pause when the server froze the clock', () => {
    const { root } = render({
      deals: dealsModel({ waiting: [activeDeal({ dueAt: null })] }),
    });
    expect(textOf(root)).toContain('marketplace.brandHome.deals.next.paused');
  });

  it('welcomes a brand with no open deal and sends it to Explore', () => {
    const { root, vm } = render({ deals: { kind: 'welcome', faces: [] } });
    expect(textOf(root)).toContain('marketplace.brandHome.deals.welcome.title');
    root.find(isHost('CustomButton')).props.onPress();
    expect(vm.browseAll).toHaveBeenCalled();
  });

  it('hides the section quietly when Home fails', () => {
    const { root } = render({ deals: { kind: 'hidden' } });
    expect(textOf(root)).not.toContain('marketplace.brandHome.deals.title');
  });
});

const activeCampaign = (overrides: Partial<BrandActiveCampaign> = {}): BrandActiveCampaign => ({
  id: 'c1',
  title: 'Ramadan launch',
  status: { key: 'open', label: 'Open' },
  seats: { total: 5, occupied: 2, free: 3 },
  applicationsOpen: 3,
  awaitingPaymentCount: 1,
  applyDeadlineAt: null,
  dropAt: mockNow + 5 * 24 * HOUR,
  budgetSecured: true,
  needsAction: true,
  action: { key: 'fund_seats', label: 'Fund the selected seats' },
  ...overrides,
});
const campaignsModel = (
  overrides: Partial<Extract<BrandHomeScreenModel['campaigns'], { kind: 'rail' }>> = {},
): BrandHomeScreenModel['campaigns'] => ({
  kind: 'rail',
  needsActionCount: 1,
  totalCount: 2,
  items: [
    activeCampaign(),
    activeCampaign({
      id: 'c2',
      title: 'Branch opening',
      needsAction: false,
      action: null,
      budgetSecured: false,
      awaitingPaymentCount: 0,
      dropAt: null,
    }),
  ],
  ...overrides,
});

describe('BrandHomeScreen — my active campaigns', () => {
  it('shows nothing when the server sends none', () => {
    const { root } = render();
    expect(textOf(root)).not.toContain('marketplace.brandHome.campaigns.title');
  });

  it('leads each card with the server action and counts the ones that need the brand', () => {
    const { root } = render({ campaigns: campaignsModel() });
    const text = textOf(root);
    expect(text).toContain('marketplace.brandHome.campaigns.title');
    expect(text).toContain('marketplace.brandHome.campaigns.needsYou:{"count":1}');
    expect(text).toContain('Fund the selected seats');
    expect(text).toContain('marketplace.brandHome.campaigns.seatsLeft:{"free":"3","total":"5"}');
    // The calm one reads «open», and its unsecured budget is said out loud.
    expect(text).toContain('marketplace.brandHome.campaigns.open');
    expect(text).toContain('marketplace.brandHome.campaigns.unsecured');
  });

  it('opens the campaign through the model when a card is pressed', () => {
    const { root, vm } = render({ campaigns: campaignsModel() });
    const card = root
      .findAll(isHost('Pressable'))
      .find(n => String(n.props.accessibilityLabel).startsWith('marketplace.brandHome.campaigns.cardA11y:'));
    card?.props.onPress();
    expect(vm.openCampaignAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('adds a tile to every campaign only when the server has more than it sent', () => {
    expect(byLabel(render({ campaigns: campaignsModel() }).root, 'marketplace.brandHome.campaigns.allA11y:{"count":2}')).toBeUndefined();
    const { root, vm } = render({ campaigns: campaignsModel({ totalCount: 7 }) });
    byLabel(root, 'marketplace.brandHome.campaigns.allA11y:{"count":7}')?.props.onPress();
    expect(vm.openDeals).toHaveBeenCalled();
  });

  it('puts the campaign chip on a deal that came from one', () => {
    const { root } = render({
      deals: dealsModel({ moving: [activeDeal({ id: 'd9', needsAction: false, action: null, campaign: { id: 'c1', title: 'Ramadan launch' } })] }),
    });
    expect(textOf(root)).toContain('Ramadan launch');
  });

  it('says how many of the waiting deals are campaign seats, under the island', () => {
    const { root } = render({
      island: {
        key: 'fund_deals',
        tone: 'warning',
        title: '3 deals await payment',
        message: 'The first lapses soon',
        note: 'marketplace.brandHome.island.campaignSeats:{"count":2}',
        hint: 'Top up',
        onPress: jest.fn(),
      },
    });
    expect(textOf(root)).toContain('marketplace.brandHome.island.campaignSeats:{"count":2}');
  });
});
