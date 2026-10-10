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

const mockSession: { signedIn: boolean; userType: string | null } = {
  signedIn: true,
  userType: 'brand',
};
jest.mock('@/core/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockSession) => unknown) => selector(mockSession),
}));

// The barrel pulls navigators and UI; only the session selectors are read.
jest.mock('@/domains/auth', () => ({
  selectIsAuthenticated: (state: { signedIn: boolean }) => state.signedIn,
  selectUserType: (state: { userType: string | null }) => state.userType,
}));

const mockNavigate = jest.fn();
jest.mock('@/core/navigation', () => ({
  navigate: (...args: unknown[]) => mockNavigate(...args),
}));

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
    mockSession.signedIn = true;
    mockSession.userType = 'brand';
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

  describe('price lock (brand-explore §6)', () => {
    const lockedKit = (reason: string | null): PublicMediaKit => ({
      ...kit,
      price_locked: true,
      price_lock_reason: reason,
    });

    const open = (reason: string | null) => {
      mockQuery.data = { kit: lockedKit(reason), canonicalSlug: null };
      mockQuery.isFetching = false;
      mount();
    };

    it('no footer while prices are visible', () => {
      mockQuery.data = { kit: { ...kit, price_locked: false }, canonicalSlug: null };
      mockQuery.isFetching = false;
      mount();
      expect(latest.vm?.priceLock).toBeNull();
    });

    it('brand: the reason CTA opens its account screen over Profile', () => {
      open('kyc_required');
      expect(latest.vm?.priceLock?.cta?.screen).toBe('CompanyVerification');
      act(() => latest.vm?.onPriceLockAction());
      expect(mockNavigate).toHaveBeenCalledWith('Main', {
        screen: 'SettingsTab',
        params: { screen: 'CompanyVerification', initial: false },
      });
    });

    it('brand with an unfinished company profile → company info', () => {
      open('onboarding_incomplete');
      act(() => latest.vm?.onPriceLockAction());
      expect(mockNavigate).toHaveBeenCalledWith('Main', {
        screen: 'SettingsTab',
        params: { screen: 'CompanyInfoScreen', initial: false },
      });
    });

    it('brand in review: copy only, the action does nothing', () => {
      open('kyc_pending');
      expect(latest.vm?.priceLock).toMatchObject({
        title: 'marketplace.priceLock.pending.title',
        cta: null,
      });
      act(() => latest.vm?.onPriceLockAction());
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('guest: sign in, back to Login under the kit', () => {
      mockSession.signedIn = false;
      mockSession.userType = null;
      open('kyc_required');
      expect(latest.vm?.priceLock?.title).toBe('account.mediaKit.publicScreen.guestLock.title');
      act(() => latest.vm?.onPriceLockAction());
      expect(mockNavigate).toHaveBeenCalledWith('Auth', { screen: 'Login' });
    });

    it('creator: plain text, never the brand verification flow', () => {
      mockSession.userType = 'influencer';
      open('kyc_required');
      expect(latest.vm?.priceLock).toMatchObject({
        title: 'marketplace.priceLock.unavailable.title',
        cta: null,
      });
    });

    it('unknown reason reads as "verify"', () => {
      open('something_new');
      expect(latest.vm?.priceLock?.title).toBe('marketplace.priceLock.verify.title');
    });
  });
});
