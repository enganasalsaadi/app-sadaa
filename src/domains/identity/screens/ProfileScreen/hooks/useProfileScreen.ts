import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '@/core/store';
import { selectUser, selectIsAuthenticated, clearCredentials } from '@/domains/auth';
import { useLogoutMutation } from '@/domains/auth';
import {
  useDeleteAccountMutation,
  useUpdateAvatarMutation,
} from '../../../api/accountApi';
import { baseApi, getApiErrorMessage } from '@/core/api';
import { authStorage } from '@/core/storage';
import { appStorage, StorageKeys } from '@/core/storage';
import { toastService } from '@/core/toast';

export const useProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();
  const [updateAvatar, { isLoading: isUploadingAvatar }] =
    useUpdateAvatarMutation();

  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState<string | undefined>();

  const handleLogout = useCallback(async () => {
    try {
      const deviceToken = appStorage.get(StorageKeys.PUSH_TOKEN) ?? undefined;
      await logout({ device_token: deviceToken }).unwrap();
    } catch {
      // onQueryStarted handles credential cleanup regardless of server outcome
    } finally {
      setLogoutSheetVisible(false);
      toastService.success(t('account.profile.logoutSuccess'));
    }
  }, [logout, t]);
  const handleDeleteAccount = useCallback(async () => {
    setDeletePasswordError(undefined);
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      await authStorage.clearTokens();
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      toastService.success(t('account.profile.deleteSuccess'));
      setDeleteSheetVisible(false);
      setDeletePassword('');
    } catch (err) {
      setDeletePasswordError(getApiErrorMessage(err));
    }
  }, [deleteAccount, deletePassword, dispatch, t]);

  const uploadAvatar = useCallback(
    async (asset: { uri?: string; fileName?: string; type?: string }) => {
      if (!asset.uri) return;
      try {
        const formData = new FormData();
        const file: FormDataValue = {
          uri: asset.uri,
          name: asset.fileName ?? 'avatar.jpg',
          type: asset.type ?? 'image/jpeg',
        };
        formData.append('avatar', file);
        await updateAvatar(formData).unwrap();
        toastService.success(t('account.editAccount.saveSuccess'));
      } catch {
        toastService.error(t('errors.generic'));
      }
    },
    [updateAvatar, t],
  );

  const handleChangePhoto = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async response => {
      const asset = response.assets?.[0];
      if (response.didCancel || !asset?.uri) return;
      await uploadAvatar(asset);
    });
  }, [uploadAvatar]);

  return {
    user,
    isAuthenticated,
    isLoggingOut,
    isDeletingAccount,
    isUploadingAvatar,
    logoutSheetVisible,
    deleteSheetVisible,
    deletePassword,
    deletePasswordError,
    setLogoutSheetVisible,
    setDeleteSheetVisible,
    setDeletePassword,
    setDeletePasswordError,
    handleLogout,
    handleDeleteAccount,
    handleChangePhoto,
  };
};
