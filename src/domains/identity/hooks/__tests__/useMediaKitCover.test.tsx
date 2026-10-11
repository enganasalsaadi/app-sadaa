import React from 'react';
import { act, create } from 'react-test-renderer';
import { useMediaKitCover, type MediaKitCoverModel } from '../useMediaKitCover';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/core/api', () => jest.requireActual('@/core/api/errorHandler'));

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('@/core/toast', () => ({
  toastService: {
    success: (message: string) => mockToast.success(message),
    error: (message: string) => mockToast.error(message),
  },
}));

const mockLaunch = jest.fn();
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: (...args: unknown[]) => mockLaunch(...args),
}));

const mockUpload = jest.fn();
const mockRemove = jest.fn();
jest.mock('../../api/mediaKitApi', () => ({
  useUploadMediaKitCoverMutation: () => [mockUpload, { isLoading: false }],
  useRemoveMediaKitCoverMutation: () => [mockRemove, { isLoading: false }],
}));

const ok = () => jest.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const rejectWith = (status: number, error_code: string) =>
  jest.fn(() => ({
    unwrap: () =>
      Promise.reject({
        status,
        data: { success: false, error_code, errors: null, meta: { locale: 'en' } },
      }),
  }));

const vm: { current: MediaKitCoverModel | null } = { current: null };
const Probe: React.FC<{ coverUrl: string | null }> = ({ coverUrl }) => {
  vm.current = useMediaKitCover(coverUrl);
  return null;
};
const current = () => {
  if (!vm.current) throw new Error('not rendered');
  return vm.current;
};
const mount = (coverUrl: string | null = null) => {
  act(() => {
    create(<Probe coverUrl={coverUrl} />);
  });
};

const pick = async (asset: object | null) => {
  mockLaunch.mockResolvedValueOnce(asset ? { assets: [asset] } : { didCancel: true });
  await act(async () => {
    await current().onChoose();
  });
};

const JPEG = { uri: 'file:///c.jpg', fileName: 'c.jpg', type: 'image/jpeg', fileSize: 1024 };

describe('useMediaKitCover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockImplementation(ok());
    mockRemove.mockImplementation(ok());
  });

  it('shows the saved cover until a photo is picked', () => {
    mount('https://cdn/c.webp');
    expect(current().previewUri).toBe('https://cdn/c.webp');
    expect(current().hasCover).toBe(true);
    expect(current().isPending).toBe(false);
  });

  it('a picked photo is previewed but not uploaded yet', async () => {
    mount('https://cdn/c.webp');
    await pick(JPEG);
    expect(current().previewUri).toBe('file:///c.jpg');
    expect(current().isPending).toBe(true);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('cancelling the picker changes nothing', async () => {
    mount();
    await pick(null);
    expect(current().isPending).toBe(false);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('rejects a wrong type or an oversize photo before any upload', async () => {
    mount();
    await pick({ ...JPEG, type: 'image/gif' });
    await pick({ ...JPEG, fileSize: 6 * 1024 * 1024 });
    expect(mockToast.error).toHaveBeenCalledTimes(2);
    expect(mockToast.error).toHaveBeenCalledWith('account.mediaKit.settingsScreen.cover.invalid');
    expect(current().isPending).toBe(false);
  });

  it('cancel drops the picked photo and falls back to the saved cover', async () => {
    mount('https://cdn/c.webp');
    await pick(JPEG);
    act(() => current().onCancelPending());
    expect(current().previewUri).toBe('https://cdn/c.webp');
  });

  it('upload sends the photo in the cover field and clears the preview', async () => {
    mount();
    await pick(JPEG);
    await act(async () => {
      await current().onUpload();
    });
    const body = mockUpload.mock.calls[0]?.[0] as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(mockToast.success).toHaveBeenCalledWith('account.mediaKit.settingsScreen.cover.uploaded');
    expect(current().isPending).toBe(false);
  });

  it('429 explains the hourly limit and keeps the photo for a later retry', async () => {
    mockUpload.mockImplementation(rejectWith(429, 'too_many_requests'));
    mount();
    await pick(JPEG);
    await act(async () => {
      await current().onUpload();
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      'account.mediaKit.settingsScreen.cover.rateLimited',
    );
    expect(current().isPending).toBe(true);
  });

  it('422 leaves the toast to baseQuery', async () => {
    mockUpload.mockImplementation(rejectWith(422, 'validation_failed'));
    mount();
    await pick(JPEG);
    await act(async () => {
      await current().onUpload();
    });
    expect(mockToast.error).not.toHaveBeenCalled();
    expect(current().isPending).toBe(true);
  });

  it('another 4xx shows the generic upload failure', async () => {
    mockUpload.mockImplementation(rejectWith(400, 'bad_request'));
    mount();
    await pick(JPEG);
    await act(async () => {
      await current().onUpload();
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      'account.mediaKit.settingsScreen.cover.uploadFailed',
    );
  });

  it('remove asks first, then deletes and closes the sheet', async () => {
    mount('https://cdn/c.webp');
    act(() => current().openRemoveSheet());
    expect(current().removeSheetVisible).toBe(true);
    await act(async () => {
      await current().confirmRemove();
    });
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(current().removeSheetVisible).toBe(false);
    expect(mockToast.success).toHaveBeenCalledWith('account.mediaKit.settingsScreen.cover.removed');
  });

  it('a failed remove reports it', async () => {
    mockRemove.mockImplementation(rejectWith(400, 'bad_request'));
    mount('https://cdn/c.webp');
    await act(async () => {
      await current().confirmRemove();
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      'account.mediaKit.settingsScreen.cover.removeFailed',
    );
  });
});
