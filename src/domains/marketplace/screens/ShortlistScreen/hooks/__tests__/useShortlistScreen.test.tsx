import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ToastOptions } from '@/core/toast';
import type { ExploreCreator } from '../../../../types/explore';
import { useShortlistScreen } from '../useShortlistScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockInfo = jest.fn<void, [string, ToastOptions | undefined]>();
jest.mock('@/core/toast', () => ({
  toastService: { info: (message: string, options?: ToastOptions) => mockInfo(message, options) },
}));

const mockSetShortlist = jest.fn<Promise<boolean>, [ExploreCreator, boolean]>();
const mockOpenCreator = jest.fn();
jest.mock('../../../../hooks/useCreatorCardActions', () => ({
  useCreatorCardActions: () => ({ openCreator: mockOpenCreator, setShortlist: mockSetShortlist }),
}));

const creator = (slug: string): ExploreCreator => ({
  slug,
  displayName: slug.toUpperCase(),
  avatarUrl: null,
  governorate: null,
  niches: [],
  tier: null,
  primaryPlatform: null,
  platforms: [],
  badges: { kycVerified: false, followersVerified: false, rush: false, onSite: false, isNew: false },
  fastestDeliveryDays: null,
  price: { locked: false, from: null, fromSypApprox: null },
  isShortlisted: true,
});

const mockQuery = {
  data: { pages: [{ items: [creator('reem')], nextCursor: 'c2' }, { items: [creator('omar')], nextCursor: null }] },
  isFetching: false,
  isError: false,
  hasNextPage: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(() => Promise.resolve()),
};
const mockUseQuery = jest.fn((_arg: undefined, _options: object) => mockQuery);
jest.mock('../../../../api/shortlistApi', () => ({
  useGetShortlistInfiniteQuery: (arg: undefined, options: object) => mockUseQuery(arg, options),
}));

type Model = ReturnType<typeof useShortlistScreen>;

const renderModel = () => {
  const ref: { current: Model | null } = { current: null };
  const Harness = () => {
    ref.current = useShortlistScreen();
    return null;
  };
  act(() => {
    create(<Harness />);
  });
  if (!ref.current) throw new Error('render failed');
  return ref.current;
};

beforeEach(() => jest.clearAllMocks());

describe('useShortlistScreen', () => {
  it('refetches on every open and flattens the cursor pages', () => {
    const vm = renderModel();
    expect(mockUseQuery).toHaveBeenCalledWith(undefined, { refetchOnMountOrArgChange: true });
    expect(vm.creators.map(c => c.slug)).toEqual(['reem', 'omar']);
  });

  it('loads the next page near the end', () => {
    const vm = renderModel();
    vm.onEndReached();
    expect(mockQuery.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('removes on ❤️ and offers Undo, which saves the creator back', async () => {
    mockSetShortlist.mockResolvedValue(true);
    const vm = renderModel();
    const reem = creator('reem');
    await act(() => vm.removeCreator(reem));

    expect(mockSetShortlist).toHaveBeenCalledWith(reem, false);
    expect(mockInfo).toHaveBeenCalledTimes(1);
    const [message, options] = mockInfo.mock.calls[0] ?? [];
    expect(message).toBe('marketplace.shortlist.removed:{"name":"REEM"}');
    expect(options?.action?.label).toBe('common.undo');

    options?.action?.onPress();
    expect(mockSetShortlist).toHaveBeenLastCalledWith(reem, true);
  });

  it('offers no Undo when the removal failed (the error toast already said so)', async () => {
    mockSetShortlist.mockResolvedValue(false);
    const vm = renderModel();
    await act(() => vm.removeCreator(creator('reem')));
    expect(mockInfo).not.toHaveBeenCalled();
  });

  it('sends an empty shortlist to Explore', () => {
    const vm = renderModel();
    vm.emptyAction.onPress();
    expect(mockNavigate).toHaveBeenCalledWith('Explore');
  });
});
