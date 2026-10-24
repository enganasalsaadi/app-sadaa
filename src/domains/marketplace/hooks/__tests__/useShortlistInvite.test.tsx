import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ExploreCreator } from '../../types/explore';
import { useShortlistInvite } from '../useShortlistInvite';

jest.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => undefined },
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockError = jest.fn();
const mockInfo = jest.fn();
jest.mock('@/core/toast', () => ({
  toastService: { error: (message: string) => mockError(message), info: (message: string) => mockInfo(message) },
}));

const mockInvite = jest.fn();
const campaign = (id: string) => ({ id, title: id, seatsTotal: 3, counters: { seatsOccupied: 1 } });
const mockQuery = {
  data: { pages: [{ items: [campaign('c1'), campaign('c2')] }] },
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
};
const mockUseQuery = jest.fn((..._args: unknown[]) => mockQuery);
jest.mock('../../api/brandCampaignsApi', () => ({
  useGetCampaignsInfiniteQuery: (...args: unknown[]) => mockUseQuery(...args),
  useInviteCreatorsMutation: () => [(args: unknown) => ({ unwrap: () => mockInvite(args) }), { isLoading: false }],
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
  rating: null,
  completion: null,
  response: null,
  price: { locked: false, from: null, fromSypApprox: null },
  isShortlisted: true,
});

type Model = ReturnType<typeof useShortlistInvite>;
const current: { model: Model | null } = { model: null };
const Harness = () => {
  current.model = useShortlistInvite();
  return null;
};
const vm = (): Model => {
  if (!current.model) throw new Error('not rendered');
  return current.model;
};

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    create(<Harness />);
  });
});

describe('useShortlistInvite', () => {
  it('picks and drops creators in invite mode; leaving the mode forgets them', () => {
    act(() => vm().start());
    act(() => vm().toggle(creator('reem')));
    act(() => vm().toggle(creator('omar')));
    expect(vm().picks.map(pick => pick.slug)).toEqual(['reem', 'omar']);
    act(() => vm().toggle(creator('reem')));
    expect(vm().pickedSlugs.has('reem')).toBe(false);
    act(() => vm().exit());
    expect(vm().active).toBe(false);
    expect(vm().picks).toEqual([]);
  });

  it('refuses the 101st creator with a word', () => {
    act(() => vm().start());
    for (let i = 0; i < 100; i += 1) act(() => vm().toggle(creator(`c${i}`)));
    act(() => vm().toggle(creator('extra')));
    expect(vm().picks).toHaveLength(100);
    expect(mockInfo).toHaveBeenCalledWith('marketplace.shortlist.invite.full');
  });

  it('opens the campaign sheet only with someone picked, and reads campaigns only then', () => {
    act(() => vm().openSheet());
    expect(vm().sheet.visible).toBe(false);
    expect(mockUseQuery).toHaveBeenLastCalledWith({ statuses: ['open'] }, { skip: true, refetchOnMountOrArgChange: true });
    act(() => vm().toggle(creator('reem')));
    act(() => vm().openSheet());
    expect(vm().sheet.visible).toBe(true);
    expect(mockUseQuery).toHaveBeenLastCalledWith({ statuses: ['open'] }, { skip: false, refetchOnMountOrArgChange: true });
  });

  it('is ready to send to the newest campaign and sends every picked slug', async () => {
    mockInvite.mockResolvedValue({
      rows: [
        { slug: 'reem', displayName: null, invited: true, reason: null, eligibility: [] },
        { slug: 'omar', displayName: null, invited: false, reason: { key: 'already_invited', label: 'Already' }, eligibility: [] },
      ],
      invited: 1,
      skipped: 1,
      limit: 50,
      used: 1,
    });
    act(() => vm().toggle(creator('reem')));
    act(() => vm().toggle(creator('omar')));
    act(() => vm().openSheet());
    expect(vm().sheet.chosen).toBe('c1');
    act(() => vm().sheet.choose('c2'));
    await act(() => vm().sheet.send());

    expect(mockInvite).toHaveBeenCalledWith({ id: 'c2', slugs: ['reem', 'omar'] });
    expect(vm().sheet.rows.map(row => [row.name, row.invited, row.reasonKey])).toEqual([
      ['REEM', true, null],
      ['OMAR', false, 'already_invited'],
    ]);
  });

  it('closing the report ends invite mode; closing the picker keeps the picks', async () => {
    mockInvite.mockResolvedValue({ rows: [], invited: 0, skipped: 0, limit: 50, used: 0 });
    act(() => vm().start());
    act(() => vm().toggle(creator('reem')));
    act(() => vm().openSheet());
    act(() => vm().sheet.close());
    expect(vm().sheet.visible).toBe(false);
    expect(vm().picks).toHaveLength(1);

    act(() => vm().openSheet());
    await act(() => vm().sheet.send());
    act(() => vm().sheet.close());
    expect(vm().active).toBe(false);
    expect(vm().picks).toEqual([]);
    expect(vm().sheet.report).toBeNull();
  });

  it('shows the server message when the campaign stopped accepting, and keeps the picker', async () => {
    mockInvite.mockRejectedValue({ status: 409, data: { message: 'Campaign closed', error_code: 'campaign_not_accepting' } });
    act(() => vm().toggle(creator('reem')));
    act(() => vm().openSheet());
    await act(() => vm().sheet.send());
    expect(mockError).toHaveBeenCalledWith('Campaign closed');
    expect(vm().sheet.report).toBeNull();
    expect(vm().sheet.visible).toBe(true);
  });
});
