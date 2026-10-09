import React from 'react';
import { act, create } from 'react-test-renderer';
import { useController } from 'react-hook-form';
import type { MediaKit } from '../../../../types/mediaKit';
import type { SlugAvailability } from '../../../../hooks/useSlugAvailability';
import {
  useMediaKitSettingsScreen,
  type MediaKitSettingsScreenModel,
} from '../useMediaKitSettingsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, dispatch: jest.fn() }),
  usePreventRemove: jest.fn(),
}));

jest.mock('@/core/api', () => jest.requireActual('@/core/api/errorHandler'));
// The barrel also loads push (native Notifee); only the guard is used here.
jest.mock('@/core/hooks', () => jest.requireActual('@/core/hooks/useDiscardGuard'));
jest.mock('@/core/i18n', () => ({ formatDate: (date: Date) => date.toISOString().slice(0, 10) }));

const mockDispatch = jest.fn();
jest.mock('@/core/store', () => ({ useAppDispatch: () => mockDispatch }));

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('@/core/toast', () => ({
  toastService: {
    success: (message: string) => mockToast.success(message),
    error: (message: string) => mockToast.error(message),
  },
}));

const mockKit: { current: MediaKit | undefined } = { current: undefined };
const mockSaveSlug = jest.fn();
const mockSaveVisibility = jest.fn();
let mockMutationCall = 0;
jest.mock('../../../../api/mediaKitApi', () => ({
  mediaKitApi: {
    util: {
      upsertQueryData: (endpoint: string, arg: unknown, data: unknown) => ({ endpoint, arg, data }),
    },
  },
  useGetMediaKitQuery: () => ({
    data: mockKit.current,
    isError: false,
    isFetching: false,
    error: undefined,
    refetch: jest.fn(),
  }),
  // The hook creates the slug mutation first, then the visibility one.
  useUpdateMediaKitMutation: () => {
    mockMutationCall += 1;
    return mockMutationCall % 2 === 1
      ? [mockSaveSlug, { isLoading: false }]
      : [mockSaveVisibility, { isLoading: false }];
  },
}));

const mockAvailability: { current: SlugAvailability } = { current: { status: 'available' } };
const mockRecheck = jest.fn();
jest.mock('../../../../hooks/useSlugAvailability', () => ({
  useSlugAvailability: () => ({ availability: mockAvailability.current, recheck: mockRecheck }),
}));

const kit = (overrides: Partial<MediaKit> = {}): MediaKit => ({
  id: '01J',
  slug: 'anas',
  public_url: 'https://sada.app/c/anas',
  is_public: true,
  slug_changed_at: null,
  can_change_slug_at: null,
  created_at: '2026-10-05T09:00:00+00:00',
  updated_at: '2026-10-05T09:00:00+00:00',
  preview: {} as MediaKit['preview'],
  ...overrides,
});

const vm: { current: MediaKitSettingsScreenModel | null } = { current: null };
const field: { onChange: (value: string) => void; error: string | undefined } = {
  onChange: () => undefined,
  error: undefined,
};

/** Drives the slug field through react-hook-form, as the screen's Controller does. */
const SlugField: React.FC<{ control: MediaKitSettingsScreenModel['control'] }> = ({ control }) => {
  const { field: slugField, fieldState } = useController({ control, name: 'slug' });
  field.onChange = slugField.onChange;
  field.error = fieldState.error?.message;
  return null;
};

const Probe: React.FC = () => {
  vm.current = useMediaKitSettingsScreen();
  return <SlugField control={vm.current.control} />;
};
const current = () => {
  if (!vm.current) throw new Error('not rendered');
  return vm.current;
};

const mount = () => {
  act(() => {
    create(<Probe />);
  });
};


const typeSlug = (slug: string) =>
  act(() => {
    field.onChange(slug);
  });

const rejectWith = (status: number, error_code: string, meta: object = {}) =>
  jest.fn(() => ({
    unwrap: () =>
      Promise.reject({
        status,
        data: { success: false, error_code, errors: null, meta: { locale: 'en', ...meta } },
      }),
  }));

describe('useMediaKitSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutationCall = 0;
    mockKit.current = kit();
    mockAvailability.current = { status: 'available' };
  });

  it('shows the cooldown end while can_change_slug_at is in the future', () => {
    mockKit.current = kit({ can_change_slug_at: '2999-01-01T00:00:00+00:00' });
    mount();
    expect(current().cooldownMessage).toContain('2999-01-01');
  });

  it('no cooldown notice when the slug can change now', () => {
    mockKit.current = kit({ can_change_slug_at: '2000-01-01T00:00:00+00:00' });
    mount();
    expect(current().cooldownMessage).toBeNull();
  });

  it('saving the unchanged slug just goes back', async () => {
    mount();
    await act(async () => current().onSave());
    expect(mockSaveSlug).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('a cooldown 409 becomes a field error with the date', async () => {
    mockSaveSlug.mockImplementation(
      rejectWith(409, 'slug_change_cooldown', {
        retry_after: 60,
        available_at: '2026-11-05T10:00:00+00:00',
      }),
    );
    mount();
    typeSlug('noor');
    await act(async () => current().onSave());
    expect(mockSaveSlug).toHaveBeenCalledWith({ slug: 'noor' });
    expect(field.error).toBe(
      'account.mediaKit.settingsScreen.cooldown.saveBlocked:{"date":"2026-11-05"}',
    );
    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('a taken 409 after a green check re-runs the live check', async () => {
    mockSaveSlug.mockImplementation(rejectWith(409, 'slug_unavailable', { reason: 'taken' }));
    mount();
    typeSlug('noor');
    await act(async () => current().onSave());
    expect(mockRecheck).toHaveBeenCalled();
    expect(field.error).toBe('account.mediaKit.settingsScreen.reasons.taken');
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('never PATCHes a slug the live check already reported unavailable', async () => {
    mockAvailability.current = { status: 'unavailable', reason: 'reserved' };
    mount();
    typeSlug('admin');
    await act(async () => current().onSave());
    expect(mockSaveSlug).not.toHaveBeenCalled();
    expect(field.error).toBe('account.mediaKit.settingsScreen.reasons.reserved');
  });

  it('a successful save toasts and goes back', async () => {
    mockSaveSlug.mockReturnValue({ unwrap: () => Promise.resolve(kit({ slug: 'noor' })) });
    mount();
    typeSlug('noor');
    await act(async () => current().onSave());
    expect(mockToast.success).toHaveBeenCalledWith('account.mediaKit.settingsScreen.link.saved');
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('a 429 on save is a rate-limit toast, not a field error', async () => {
    mockSaveSlug.mockImplementation(rejectWith(429, 'too_many_requests'));
    mount();
    typeSlug('noor');
    await act(async () => current().onSave());
    expect(mockToast.error).toHaveBeenCalledWith('account.mediaKit.settingsScreen.rateLimited');
    expect(field.error).toBeUndefined();
  });

  it('hiding asks first, then PATCHes and writes the answer into the cache', async () => {
    const updated = kit({ is_public: false });
    mockSaveVisibility.mockReturnValue({ unwrap: () => Promise.resolve(updated) });
    mount();
    act(() => current().onTogglePublic(false));
    expect(current().hideSheetVisible).toBe(true);
    expect(mockSaveVisibility).not.toHaveBeenCalled();

    await act(async () => current().confirmHide());
    expect(mockSaveVisibility).toHaveBeenCalledWith({ is_public: false });
    expect(mockDispatch).toHaveBeenCalledWith({
      endpoint: 'getMediaKit',
      arg: undefined,
      data: updated,
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      'account.mediaKit.settingsScreen.visibility.madeHidden',
    );
  });

  it('making public needs no confirmation; a 429 toasts the rate limit', async () => {
    mockKit.current = kit({ is_public: false });
    mockSaveVisibility.mockImplementation(rejectWith(429, 'too_many_requests'));
    mount();
    await act(async () => current().onTogglePublic(true));
    expect(mockSaveVisibility).toHaveBeenCalledWith({ is_public: true });
    expect(mockToast.error).toHaveBeenCalledWith('account.mediaKit.settingsScreen.rateLimited');
    expect(current().isPublic).toBe(false);
  });
});
