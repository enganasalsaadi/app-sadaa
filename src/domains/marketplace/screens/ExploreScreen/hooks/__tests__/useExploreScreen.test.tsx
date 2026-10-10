import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ExploreFilters, ExplorePage } from '../../../../types/explore';
import { useExploreScreen, type ExploreScreenModel } from '../useExploreScreen';

// The barrel pulls navigators and UI; only the price-lock helpers are read.
jest.mock('@/domains/identity', () => ({
  ...jest.requireActual<object>('@/domains/identity/utils/priceLock'),
  ...jest.requireActual<object>('@/domains/identity/constants/priceLock'),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Only the error normalizer is used; the barrel would boot the whole API client.
jest.mock('@/core/api', () => jest.requireActual('@/core/api/errorHandler'));

jest.mock('lucide-react-native', () => ({ ListFilter: 'ListFilter', SearchX: 'SearchX' }));

const mockNavigate = jest.fn();
const mockRoute: { params: { filters?: ExploreFilters; focusSearch?: boolean } | undefined } = {
  params: undefined,
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => mockRoute,
}));

jest.mock('../../../../hooks/useCreatorCardActions', () => ({
  useCreatorCardActions: () => ({ openCreator: jest.fn(), toggleShortlist: jest.fn() }),
}));

jest.mock('../../../../api/brandHomeApi', () => ({
  brandHomeApi: { endpoints: { getBrandHome: { useQueryState: () => ({ data: undefined }) } } },
}));

const lockedPage: ExplorePage = {
  items: [],
  nextCursor: null,
  priceLocked: true,
  priceLockReason: 'kyc_pending',
};
type QueryState = { data?: { pages: ExplorePage[] }; currentData?: { pages: ExplorePage[] }; error?: unknown };
const mockQuery: { state: QueryState } = { state: {} };
const mockUseCreators = jest.fn((_filters: ExploreFilters) => ({
  isFetching: false,
  isError: !!mockQuery.state.error,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  ...mockQuery.state,
}));
jest.mock('../../../../api/exploreApi', () => ({
  useGetExploreCreatorsInfiniteQuery: (filters: ExploreFilters) => mockUseCreators(filters),
  useGetExploreFiltersQuery: () => ({ data: undefined, isLoading: false, isError: false, refetch: jest.fn() }),
}));

const vm: { current: ExploreScreenModel | null } = { current: null };
const Probe: React.FC = () => {
  vm.current = useExploreScreen();
  return null;
};
const model = () => {
  if (!vm.current) throw new Error('not rendered');
  return vm.current;
};
const lastFilters = () => mockUseCreators.mock.calls.at(-1)?.[0];

const mount = () => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<Probe />);
  });
  return tree;
};

describe('useExploreScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockUseCreators.mockClear();
    mockRoute.params = undefined;
    mockQuery.state = {};
  });
  afterEach(() => jest.useRealTimers());

  it('starts from the route prefill and debounces the search into `q`', () => {
    mockRoute.params = { filters: { category: 'food', q: 'reem' }, focusSearch: true };
    mount();
    expect(lastFilters()).toEqual({ category: 'food', q: 'reem' });
    expect(model().search).toBe('reem');
    expect(model().autoFocus).toBe(true);

    act(() => model().onChangeSearch('مطاعم'));
    expect(lastFilters()?.q).toBe('reem');
    act(() => jest.advanceTimersByTime(400));
    expect(lastFilters()).toEqual({ category: 'food', q: 'مطاعم' });

    act(() => model().onChangeSearch('م'));
    act(() => jest.advanceTimersByTime(400));
    expect(lastFilters()).toEqual({ category: 'food' });
  });

  it('never sends a 🔒 sort while prices are locked: the lock sheet opens instead', () => {
    mockQuery.state = { data: { pages: [lockedPage] }, currentData: { pages: [lockedPage] } };
    mount();
    act(() => model().selectSort('price_asc'));
    expect(lastFilters()?.sort).toBeUndefined();
    expect(model().lockVisible).toBe(true);
    expect(model().lockSheetReason).toBe('kyc_pending');

    act(() => model().selectSort('newest'));
    expect(lastFilters()?.sort).toBe('newest');
  });

  it('opens the lock only once the sheet asking for it is gone', () => {
    mockQuery.state = { data: { pages: [lockedPage] }, currentData: { pages: [lockedPage] } };
    mount();
    act(() => model().openFilters());
    act(() => model().requestLock());
    expect(model().sheet).toBeNull();
    expect(model().lockVisible).toBe(false);
    act(() => model().onSheetDismissed());
    expect(model().lockVisible).toBe(true);
  });

  it('drops the 🔒 part and opens the lock when the server answers 403 gated_parameter', () => {
    mockRoute.params = { filters: { rush: true, sort: 'price_desc', priceMax: 50 } };
    mockQuery.state = {
      error: { status: 403, data: { success: false, message: 'locked', error_code: 'gated_parameter', meta: { reason: 'kyc_required' } } },
    };
    mount();
    expect(lastFilters()).toEqual({ rush: true });
    expect(model().lockVisible).toBe(true);
    expect(model().lockSheetReason).toBe('kyc_required');
    expect(model().isError).toBe(false);
  });

  it('banners the lock with the reason CTA, routed to the account screen', () => {
    const page: ExplorePage = { ...lockedPage, priceLockReason: 'kyc_required' };
    mockQuery.state = { data: { pages: [page] }, currentData: { pages: [page] } };
    mount();
    const banner = model().lockBanner;
    expect(banner?.message).toBe('marketplace.priceLock.verify.title');
    act(() => banner?.action?.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('SettingsTab', { screen: 'CompanyVerification', initial: false });
  });

  it('clears narrowing filters but keeps the search and sort', () => {
    mockRoute.params = { filters: { q: 'reem', sort: 'newest', category: 'food', rush: true } };
    mount();
    expect(model().emptyAction).toBeDefined();
    act(() => model().emptyAction?.onPress());
    expect(lastFilters()).toEqual({ q: 'reem', sort: 'newest' });
    expect(model().emptyAction).toBeUndefined();
  });
});
