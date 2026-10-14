import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { getVersion } from 'react-native-device-info';
import { useAppSelector } from '@/core/store';
import { normalizeApiError, useLookupItems } from '@/core/api';
import { getValidLanguage } from '@/core/i18n';
import { HAPTIC_TAP_MS, type SupportedLanguage } from '@/core/config';
import { useTheme, type ThemeMode } from '@/core/theme';
import { toastService } from '@/core/toast';
import { navigate, type DealGuideParams, type SettingsStackParamList } from '@/core/navigation';
import {
  selectUser,
  useGetProfileQuery,
  useLogoutMutation,
  type KycStatus,
} from '@/domains/auth';
import { useGetUserProfileQuery, useUpdateAvatarMutation } from '../../../api/accountApi';
import { useGetMediaKitQuery } from '../../../api/mediaKitApi';
import { useGetRateCardsQuery } from '../../../api/rateCardsApi';
import { PROFILE_SECTIONS, type ProfileSectionKey } from '../../../constants/profileSections';
import type { ProfileStepTarget } from '../../../constants/profileSteps';
import { useBrandVisibility } from '../../../hooks/useBrandVisibility';
import { useMediaKitShare } from '../../../hooks/useMediaKitShare';
import { usePushPermissionStatus } from '../../../hooks/usePushPermissionStatus';
import { formatLinkLabel } from '../../../utils/mediaKitCard';
import { buildMissingSteps } from '../../../utils/profileCompletion';
import { buildProfileOrbit, buildProfileSteps } from '../../../utils/profileOrbit';
import { needsRateCards } from '../../../utils/rateCardNotice';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'ProfileScreen'>;

/** Contract §9: jpeg/png/webp ≤ 5MB, ≤ 4096px (we downscale further on device). */
const AVATAR_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp','image/jpg'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MAX_EDGE = 2048;

/** A company link reads without its scheme and `www.`. */
const LINK_SCHEME = /^https?:\/\/(www\.)?/i;

const LANGUAGE_LABEL = {
  ar: 'chooseLanguage.options.ar.label',
  en: 'chooseLanguage.options.en.label',
} as const satisfies Record<SupportedLanguage, ParseKeys>;

export const useProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { mode: themeMode, setThemeMode } = useTheme();
  const user = useAppSelector(selectUser);

  // Keeps `/me` subscribed so `User` invalidations (avatar, push) refresh the store.
  const me = useGetProfileQuery();
  const details = useGetUserProfileQuery();
  const { items: nicheOptions } = useLookupItems('niches');
  const push = usePushPermissionStatus();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateAvatar, { isLoading: isUploadingAvatar }] = useUpdateAvatarMutation();

  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const profile = details.data?.profile;
  const userType = user?.user_type ?? 'influencer';
  const isBrand = userType === 'brand';
  const rateCards = useGetRateCardsQuery(undefined, { skip: isBrand });
  const mediaKit = useGetMediaKitQuery(undefined, { skip: isBrand });
  const mediaKitShare = useMediaKitShare({ skip: isBrand });
  const brandVisibility = useBrandVisibility(isBrand);

  const displayName =
    user?.display_name || profile?.full_name || profile?.company_name || user?.full_name || '';
  const avatarUrl = user?.avatar_url ?? details.data?.avatar_url ?? null;
  // A brand has no area: its line reads "activity · city".
  const location =
    (isBrand
      ? [profile?.business_type_label, profile?.governorate_label]
      : [profile?.governorate_label, profile?.area]
    )
      .filter(Boolean)
      .join(' · ') || null;

  const kycStatus: KycStatus = user?.kyc?.status ?? user?.kyc_status ?? 'unverified';
  const kycRejectionReason = user?.kyc?.rejection_reason ?? null;

  const completion = user?.profile_completion;
  const percentage = completion?.percentage ?? 0;
  const isComplete = completion != null && percentage >= 100;

  const platformsReview = user?.platforms_review_status ?? null;
  const steps = useMemo(
    () =>
      buildProfileSteps(
        buildMissingSteps(completion?.steps ?? [], kycStatus, isBrand),
        kycStatus,
        platformsReview,
      ),
    [completion?.steps, isBrand, kycStatus, platformsReview],
  );
  const orbit = useMemo(
    () => buildProfileOrbit(completion?.steps.length ?? 0, steps),
    [completion?.steps.length, steps],
  );
  // A rejected KYC gets its own strip with the reason, so it is no ticket.
  const tickets = useMemo(
    () => steps.filter(step => step.key !== 'kyc' || step.state !== 'rejected'),
    [steps],
  );

  const platforms = profile?.platforms ?? [];
  const socialLinks = useMemo(
    () =>
      (profile?.social_links ?? []).map(link => ({ ...link, label: link.url.replace(LINK_SCHEME, '') })),
    [profile?.social_links],
  );
  const rateCardCount = rateCards.data?.length ?? 0;

  const nicheLabels = useMemo(() => {
    const labels = new Map(nicheOptions.map(o => [o.value, o.label]));
    return (profile?.niches ?? []).map(id => labels.get(id) ?? id);
  }, [nicheOptions, profile?.niches]);

  const detailsFailed = details.isError && !details.data;
  const pushPermission = push.permission;

  // Drop cards that would render nothing, so the section gap stays even.
  const sections = useMemo<ProfileSectionKey[]>(
    () =>
      PROFILE_SECTIONS[userType].filter(section => {
        switch (section) {
          case 'kycRejected':
            return kycStatus === 'rejected';
          case 'completion':
            return tickets.length > 0;
          case 'push':
            return pushPermission === 'askable' || pushPermission === 'blocked';
          case 'detailsError':
            return detailsFailed;
          case 'platforms':
          case 'company':
            return !detailsFailed;
          default:
            return true;
        }
      }),
    [userType, kycStatus, tickets.length, pushPermission, detailsFailed],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([me.refetch(), details.refetch(), ...(isBrand ? [] : [rateCards.refetch(), mediaKit.refetch()])]);
    } finally {
      setRefreshing(false);
    }
  }, [me, details, isBrand, rateCards, mediaKit]);

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

  const openLogoutSheet = useCallback(() => setLogoutSheetVisible(true), []);
  const closeLogoutSheet = useCallback(() => setLogoutSheetVisible(false), []);
  const openDeleteSheet = useCallback(() => setDeleteSheetVisible(true), []);
  const closeDeleteSheet = useCallback(() => setDeleteSheetVisible(false), []);

  const uploadAvatar = useCallback(
    async (asset: Asset) => {
      if (!asset.uri) return;
      const type = asset.type ?? 'image/jpeg';
      if (!AVATAR_TYPES.includes(type) || (asset.fileSize ?? 0) > AVATAR_MAX_BYTES) {
        toastService.error(t('account.profile.avatarInvalid'));
        return;
      }
      const formData = new FormData();
      const file: FormDataValue = { uri: asset.uri, name: asset.fileName ?? 'avatar.jpg', type };
      formData.append('avatar', file);
      try {
        await updateAvatar(formData).unwrap();
        toastService.success(t('account.profile.avatarUpdated'));
      } catch (err) {
        // 422 is already toasted by baseQuery.
        if (!normalizeApiError(err).isValidationError) toastService.error(t('errors.generic'));
      }
    },
    [updateAvatar, t],
  );

  const changePhoto = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: AVATAR_MAX_EDGE, maxHeight: AVATAR_MAX_EDGE },
      response => {
        const asset = response.assets?.[0];
        if (response.didCancel || !asset) return;
        uploadAvatar(asset);
      },
    );
  }, [uploadAvatar]);

  // Brand and creator edit different things: company details vs personal details.
  const openEditInfo = useCallback(
    () => navigation.navigate(isBrand ? 'CompanyInfoScreen' : 'PersonalInfoScreen'),
    [navigation, isBrand],
  );
  const openPassword = useCallback(() => navigation.navigate('ChangePasswordScreen'), [navigation]);
  const openLanguage = useCallback(() => navigation.navigate('LanguageScreen'), [navigation]);
  const openPlatforms = useCallback(() => navigation.navigate('PlatformsScreen'), [navigation]);
  const openRates = useCallback(() => navigation.navigate('RateCards'), [navigation]);
  const openNiches = useCallback(() => navigation.navigate('NichesScreen'), [navigation]);
  const openMediaKitSettings = useCallback(() => navigation.navigate('MediaKitSettings'), [navigation]);
  // A brand picks one of four verification methods first; a creator uploads an ID.
  const openKyc = useCallback(
    () => navigation.navigate(isBrand ? 'CompanyVerification' : 'KycScreen'),
    [navigation, isBrand],
  );
  const openNotifications = useCallback(
    () => navigation.navigate('NotificationsScreen'),
    [navigation],
  );
  const openTerms = useCallback(
    () =>
      navigation.navigate('WebViewScreen', { title: t('account.profile.terms'), url: '__terms__' }),
    [navigation, t],
  );
  const openPrivacy = useCallback(
    () =>
      navigation.navigate('WebViewScreen', {
        title: t('account.profile.privacy'),
        url: '__privacy__',
      }),
    [navigation, t],
  );
  const openDealGuide = useCallback(() => {
    const guide: DealGuideParams = { role: isBrand ? 'brand' : 'creator', context: 'general' };
    navigate('DealGuide', guide);
  }, [isBrand]);
  const openDevShowcase = useCallback(() => navigate('DevShowcase'), []);
  const openWallet = useCallback(() => navigate('Main', { screen: 'WalletTab' }), []);
  // Payout methods live in the wallet stack; `initial: false` keeps the wallet underneath.
  const openPayoutMethods = useCallback(
    () => navigate('Main', { screen: 'WalletTab', params: { screen: 'PayoutMethods', initial: false } }),
    [],
  );

  const onStepPress = useCallback(
    (target: ProfileStepTarget) => {
      Vibration.vibrate(HAPTIC_TAP_MS);
      switch (target) {
        case 'editInfo':
          openEditInfo();
          return;
        case 'avatar':
          changePhoto();
          return;
        case 'platforms':
          openPlatforms();
          return;
        case 'rates':
          openRates();
          return;
        case 'kyc':
          openKyc();
          return;
        default: {
          const _exhaustive: never = target;
          return _exhaustive;
        }
      }
    },
    [openEditInfo, changePhoto, openPlatforms, openRates, openKyc],
  );

  const changeThemeMode = useCallback((next: ThemeMode) => setThemeMode(next), [setThemeMode]);

  return {
    sections,
    userType,
    isBrand,
    brandVisibility,
    hero: {
      isBrand,
      title: t(isBrand ? 'tabs.account' : 'tabs.myProfile'),
      displayName,
      avatarUrl,
      location,
      kycStatus,
      isVerified: kycStatus === 'verified',
      percentage,
      isComplete,
      orbit,
      isUploadingAvatar,
    },
    tickets,
    unreadNotifications: user?.unread_notifications_count ?? 0,
    kyc: {
      status: kycStatus,
      rejectionReason: kycRejectionReason,
      // Contract §7.3: an upload is possible only before a decision or after a rejection.
      canSubmit: kycStatus === 'unverified' || kycStatus === 'rejected',
    },
    push,
    rates: {
      count: rateCardCount,
      isLoading: rateCards.isLoading,
      needsSetup: needsRateCards(user),
    },
    platforms,
    mediaKit: {
      link: mediaKit.data ? formatLinkLabel(mediaKit.data.public_url) : null,
      isPublic: mediaKit.data?.is_public ?? false,
      canShare: mediaKitShare.isReady && (mediaKit.data?.is_public ?? false),
      isSharing: mediaKitShare.isSharing,
      share: mediaKitShare.share,
    },
    nicheLabels,
    company: {
      businessType: profile?.business_type_label ?? null,
      governorate: profile?.governorate_label ?? null,
      socialLinks,
    },
    details: {
      isLoading: details.isLoading,
      isError: detailsFailed,
      error: details.error,
      retry: details.refetch,
    },
    themeMode,
    languageLabel: t(LANGUAGE_LABEL[getValidLanguage(i18n.language)]),
    appVersion: getVersion(),
    refreshing,
    onRefresh,
    isLoggingOut,
    logoutSheetVisible,
    deleteSheetVisible,
    openLogoutSheet,
    closeLogoutSheet,
    openDeleteSheet,
    closeDeleteSheet,
    openWallet,
    openPayoutMethods,
    handleLogout,
    changePhoto,
    changeThemeMode,
    onStepPress,
    openEditInfo,
    openPassword,
    openLanguage,
    openPlatforms,
    openRates,
    openNiches,
    openMediaKitSettings,
    openKyc,
    openNotifications,
    openDealGuide,
    openTerms,
    openPrivacy,
    openDevShowcase,
  };
};

export type ProfileScreenModel = ReturnType<typeof useProfileScreen>;
