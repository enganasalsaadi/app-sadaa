import React from 'react';
import { act, create } from 'react-test-renderer';
import type { PublicMediaKit, PublicMediaKitResult } from '../../../types/mediaKit';
import {
  useMediaKitPublicScreen,
  type MediaKitPublicScreenModel,
} from '../hooks/useMediaKitPublicScreen';

const mockQuery: {
  data: PublicMediaKitResult | undefined;
  error: unknown;
  isFetching: boolean;
} = { data: undefined, error: undefined, isFetching: true };
const mockQueryArgs: string[] = [];
const mockRefetch = jest.fn();
const mockTrackView = jest.fn();
const mockUpsert = jest.fn((...args: unknown[]) => ({ type: 'upsert', args }));
const mockDispatch = jest.fn();
const mockSetParams = jest.fn();
const mockGoBack = jest.fn();
const mockRoute: { params: { slug: string; source: 'link' | 'app' | 'search' } } = {
  params: { slug: 'old.anas', source: 'link' },
};

jest.mock('../../../api/mediaKitApi', () => ({
  mediaKitApi: { util: { upsertQueryData: (...args: unknown[]) => mockUpsert(...args) } },
  useGetPublicMediaKitQuery: (slug: string) => {
    mockQueryArgs.push(slug);
    return { ...mockQuery, refetch: mockRefetch };
  },
  useTrackMediaKitViewMutation: () => [mockTrackView],
}));

jest.mock('../../../hooks/useMediaKitPreviewLabels', () => ({
  useMediaKitPreviewLabels: () => ({ nicheLabels: [], rateRows: [] }),
}));

jest.mock('@/core/store', () => ({ useAppDispatch: () => mockDispatch }));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual<object>('@react-navigation/native'),
  useNavigation: () => ({ setParams: mockSetParams, goBack: mockGoBack }),
  useRoute: () => mockRoute,
}));

const kit: PublicMediaKit = {
  slug: 'anas',
  display_name: 'Anas Style',
  avatar_url: null,
  tier: null,
  tier_label: null,
  is_verified: false,
  niches: [],
  platforms: [],
  rate_cards: [],
  contract_terms: null,
  price_from_usd: null,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
};

const latest: { vm: MediaKitPublicScreenModel | null } = { vm: null };
const Probe: React.FC = () => {
  latest.vm = useMediaKitPublicScreen();
  return null;
};

const mount = () => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<Probe />);
  });
  if (!tree) throw new Error('mount failed');
  return tree;
};

describe('useMediaKitPublicScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryArgs.length = 0;
    mockQuery.data = undefined;
    mockQuery.error = undefined;
    mockQuery.isFetching = true;
    mockRoute.params = { slug: 'old.anas', source: 'link' };
  });

  it('sends one view beacon per open, with the opening slug and source', () => {
    const tree = mount();
    expect(mockTrackView).toHaveBeenCalledWith({ slug: 'old.anas', src: 'link' });

    mockQuery.data = { kit, canonicalSlug: null };
    mockQuery.isFetching = false;
    act(() => tree.update(<Probe />));
    mockRoute.params = { slug: 'anas', source: 'link' };
    act(() => tree.update(<Probe />));

    expect(mockTrackView).toHaveBeenCalledTimes(1);
    expect(latest.vm?.status).toBe('ready');
  });

  it('moves an old slug to the canonical one: cache upsert + route param', () => {
    mockQuery.data = { kit, canonicalSlug: 'anas' };
    mockQuery.isFetching = false;
    mount();

    expect(mockUpsert).toHaveBeenCalledWith('getPublicMediaKit', 'anas', {
      kit,
      canonicalSlug: null,
    });
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'upsert' }));
    expect(mockSetParams).toHaveBeenCalledWith({ slug: 'anas' });
  });

  it('leaves the route alone when the slug is already canonical', () => {
    mockQuery.data = { kit, canonicalSlug: null };
    mockQuery.isFetching = false;
    mount();
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockSetParams).not.toHaveBeenCalled();
  });

  it('maps a 404 to not_found and retries / goes back on demand', () => {
    mockQuery.error = { status: 404, data: { success: false, error_code: 'not_found' } };
    mockQuery.isFetching = false;
    mount();
    expect(latest.vm?.status).toBe('not_found');

    act(() => latest.vm?.onRetry());
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    act(() => latest.vm?.onBack());
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('beacon source follows how the screen was opened', () => {
    mockRoute.params = { slug: 'anas', source: 'app' };
    mount();
    expect(mockTrackView).toHaveBeenCalledWith({ slug: 'anas', src: 'app' });
  });
});
