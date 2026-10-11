import React from 'react';
import { act, create } from 'react-test-renderer';
import { useBrandVisibility, type BrandVisibilityModel } from '../useBrandVisibility';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/core/api', () => jest.requireActual('@/core/api/errorHandler'));

const mockToastError = jest.fn();
jest.mock('@/core/toast', () => ({
  toastService: { error: (message: string) => mockToastError(message) },
}));

const mockQuery = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../api/brandSettingsApi', () => ({
  useGetBrandSettingsQuery: (...args: unknown[]) => mockQuery(...args),
  useUpdateBrandSettingsMutation: () => [mockUpdate, { isLoading: false }],
}));

const settled = (data: object) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });
const rejectWith = (status: number) =>
  jest.fn(() => ({
    unwrap: () =>
      Promise.reject({
        status,
        data: { success: false, error_code: 'x', errors: null, meta: { locale: 'en' } },
      }),
  }));

const vm: { current: BrandVisibilityModel | null } = { current: null };
const Probe: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  vm.current = useBrandVisibility(enabled);
  return null;
};
const current = () => {
  if (!vm.current) throw new Error('not rendered');
  return vm.current;
};
const mount = (enabled = true) => {
  act(() => {
    create(<Probe enabled={enabled} />);
  });
};

describe('useBrandVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReturnValue(settled({ show_on_creator_profiles: true }));
    mockUpdate.mockImplementation(() => ({ unwrap: () => Promise.resolve({}) }));
  });

  it('reads the saved setting', () => {
    mount();
    expect(current().visible).toBe(true);
  });

  it('has no value until the first answer, never a guessed one', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: jest.fn() });
    mount();
    expect(current().visible).toBeNull();
    expect(current().isLoading).toBe(true);
  });

  it('does not call the brand-only endpoint for a creator', () => {
    mount(false);
    expect(mockQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it('sends only the changed flag', async () => {
    mount();
    await act(async () => current().onToggle(false));
    expect(mockUpdate).toHaveBeenCalledWith({ show_on_creator_profiles: false });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('toasts when a 4xx refuses the change', async () => {
    mockUpdate.mockImplementation(rejectWith(429));
    mount();
    await act(async () => current().onToggle(false));
    expect(mockToastError).toHaveBeenCalledWith('account.profile.brandVisibility.updateFailed');
  });

  it('leaves 5xx to the global modal', async () => {
    mockUpdate.mockImplementation(rejectWith(500));
    mount();
    await act(async () => current().onToggle(false));
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('only reports a load error while there is nothing to show', () => {
    mockQuery.mockReturnValue({
      data: { show_on_creator_profiles: false },
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    mount();
    expect(current().isError).toBe(false);
  });
});
