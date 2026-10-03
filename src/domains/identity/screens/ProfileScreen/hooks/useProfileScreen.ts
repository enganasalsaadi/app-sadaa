import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector } from '@/core/store';
import { selectUser, selectIsAuthenticated } from '@/domains/auth';
import { useLogoutMutation } from '@/domains/auth';
import { useUpdateAvatarMutation } from '../../../api/accountApi';
import { toastService } from '@/core/toast';

export const useProfileScreen = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateAvatar, { isLoading: isUploadingAvatar }] =
    useUpdateAvatarMutation();

  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      // The mutation signs out locally whatever the server answered.
    } finally {
      setLogoutSheetVisible(false);
      toastService.success(t('account.profile.logoutSuccess'));
    }
  }, [logout, t]);

  const openDeleteSheet = useCallback(() => setDeleteSheetVisible(true), []);
  const closeDeleteSheet = useCallback(() => setDeleteSheetVisible(false), []);

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
    isUploadingAvatar,
    logoutSheetVisible,
    deleteSheetVisible,
    setLogoutSheetVisible,
    openDeleteSheet,
    closeDeleteSheet,
    handleLogout,
    handleChangePhoto,
  };
};
