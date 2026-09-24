import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  User,
  Shield,
  Globe,
  FileText,
  Lock,
  LogOut,
  Trash2,
  ChevronRight,
  Camera,
  UserRoundPen,
  ChevronLeft,
  Palette,
} from 'lucide-react-native';
import { useTheme, useStyles, moderateScale } from '@/core/theme';
import { Layout } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { Pressable } from '@/shared/ui/primitives/Pressable';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useProfileScreen } from './hooks/useProfileScreen';
import type { SettingsStackScreenProps } from '@/core/navigation';
import { navigate } from '@/core/navigation';
import { Card, CustomButton, CustomInput, Image } from '@/shared/ui';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '@/domains/auth';

type Props = SettingsStackScreenProps<'ProfileScreen'>;

const AVATAR_SIZE = moderateScale(88);

const ProfileScreenComponent: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const styles = useStyles(({ colors: c, radii, borderWidths }) => ({
    cameraBtn: {
      position: 'absolute' as const,
      bottom: 0,
      end: 0,
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: radii.full,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: c.interactive.main,
    },
    itemBorder: {
      borderBottomWidth: borderWidths.hairline,
    },
    halfButton: {
      flex: 1,
    },
  }));

  const {
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
  } = useProfileScreen();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const dispatch = useDispatch();
  const privateSettingsItems = [
    {
      key: 'security',
      icon: Shield,
      label: t('account.profile.changePassword'),
      onPress: () => navigation.navigate('ChangePasswordScreen'),
    },
  ];

  const publicSettingsItems = [
    {
      key: 'language',
      icon: Globe,
      label: t('account.profile.language'),
      onPress: () => navigation.navigate('LanguageScreen'),
    },
    {
      key: 'terms',
      icon: FileText,
      label: t('account.profile.terms'),
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: t('account.profile.terms'),
          url: '__terms__',
        }),
    },
    {
      key: 'privacy',
      icon: Lock,
      label: t('account.profile.privacy'),
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: t('account.profile.privacy'),
          url: '__privacy__',
        }),
    },
  ];

  // Dev-only entry into the Design System Showcase — stripped from production
  // builds by dead-code elimination on the `__DEV__` constant.
  const devSettingsItems = __DEV__
    ? [
        {
          key: 'devShowcase',
          icon: Palette,
          label: t('devShowcase.entryLabel'),
          onPress: () => navigate('DevShowcase'),
        },
      ]
    : [];

  const settingsItems = isAuthenticated
    ? [...privateSettingsItems, ...publicSettingsItems, ...devSettingsItems]
    : [...publicSettingsItems, ...devSettingsItems];

  const closeDeleteSheet = () => {
    setDeleteSheetVisible(false);
    setDeletePassword('');
    setDeletePasswordError(undefined);
  };

  const navigateToLogin = () => {
    dispatch(clearCredentials());
  };
  const renderSettingsItem = (
    item: (typeof settingsItems)[number],
    index: number,
    arr: typeof settingsItems,
  ) => {
    const Icon = item.icon;
    const isLast = index === arr.length - 1;
    return (
      <Card
        key={item.key}
        onPress={item.onPress}
        row
        align="center"
        px="lg"
        py="md"
        style={isLast ? undefined : styles.itemBorder}
      >
        <Box
          width={moderateScale(36)}
          height={moderateScale(36)}
          borderRadius="lg"
          bg={colors.surface.elevated}
          align="center"
          justify="center"
          me="md"
        >
          <Icon size={moderateScale(18)} color={colors.icon.primary} />
        </Box>
        <Box flex={1}>
          <Text variant="body" color={colors.text.primary}>
            {item.label}
          </Text>
        </Box>
        <ChevronIcon size={moderateScale(16)} color={colors.text.tertiary} />
      </Card>
    );
  };

  return (
    <>
      <Layout
        withGradient={false}
        withScroll
        contentPadding={false}
        screenHeader={{
          title: t('account.profile.title'),
          fillStatusBar: true,
          showBackButton: false,
        }}
        edges={['bottom', 'left', 'right']}
      >
        {isAuthenticated ? (
          <>
            {/* Authenticated hero */}
            <Box align="center" pt="3xl" pb="2xl" px="2xl">
              <Box position="relative">
                {user?.avatar_url ? (
                  <Image uri={user.avatar_url} size={AVATAR_SIZE} circle />
                ) : (
                  <Box
                    width={AVATAR_SIZE}
                    height={AVATAR_SIZE}
                    borderRadius="full"
                    bg={colors.surface.elevated}
                    align="center"
                    justify="center"
                  >
                    <User
                      size={moderateScale(40)}
                      color={colors.text.tertiary}
                    />
                  </Box>
                )}
                <Pressable
                  style={styles.cameraBtn}
                  onPress={handleChangePhoto}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('account.profile.changePhoto')}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.text.onAccent}
                    />
                  ) : (
                    <Camera
                      size={moderateScale(14)}
                      color={colors.text.onAccent}
                    />
                  )}
                </Pressable>
              </Box>

              <Box row align="center" mt="lg" gap="sm">
                <Text variant="h3" color={colors.text.primary} align="center">
                  {[user?.first_name, user?.last_name]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </Text>
                <Pressable
                  onPress={() => navigation.navigate('EditAccountScreen')}
                  p="sm"
                  borderRadius="full"
                  accessibilityRole="button"
                  accessibilityLabel={t('account.editAccount.title')}
                >
                  <UserRoundPen
                    size={moderateScale(18)}
                    color={colors.text.secondary}
                  />
                </Pressable>
              </Box>

              <Box row align="center" mt="xs" gap="xs">
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {user?.phone || '—'}
                </Text>
              </Box>

              {user?.member_since && (
                <Text variant="caption" color={colors.text.tertiary} mt="xs">
                  {t('account.profile.memberSince', {
                    date: user.member_since,
                  })}
                </Text>
              )}

              {(user?.total_bookings ?? 0) > 0 && (
                <Box
                  mt="md"
                  px="lg"
                  py="sm"
                  borderRadius="full"
                  bg={colors.surface.elevated}
                >
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {t('account.profile.totalBookings', {
                      count: user?.total_bookings ?? 0,
                    })}
                  </Text>
                </Box>
              )}
            </Box>
          </>
        ) : (
          /* Guest hero */
          <Box align="center" pt="3xl" pb="2xl" px="2xl">
            <Box
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              borderRadius="full"
              bg={colors.surface.elevated}
              align="center"
              justify="center"
              mb="lg"
            >
              <User size={moderateScale(40)} color={colors.text.tertiary} />
            </Box>
            <Text
              variant="h3"
              color={colors.text.primary}
              align="center"
              mb="sm"
            >
              {t('account.profile.guestTitle')}
            </Text>
            <Text
              variant="body"
              color={colors.text.secondary}
              align="center"
              mb="2xl"
            >
              {t('account.profile.guestSubtitle')}
            </Text>
            <CustomButton
              title={t('account.profile.loginBtn')}
              onPress={navigateToLogin}
              variant="primary"
              fullWidth
            />
          </Box>
        )}

        {/* Settings section */}
        <Box px="2xl" pb="5xl">
          <Text
            variant="label"
            color={colors.text.secondary}
            mb="md"
          >
            {t('account.profile.settings')}
          </Text>

          <Box borderRadius="lg" gap="md">
            {settingsItems.map((item, index) =>
              renderSettingsItem(item, index, settingsItems),
            )}
          </Box>

          {isAuthenticated && (
            <>
              {/* Logout */}
              <Box
                mt="lg"
                borderRadius="lg"
                bg={colors.surface.main}
                borderWidth="hairline"
                borderColor={colors.border.default}
                overflow="hidden"
              >
                <Pressable
                  row
                  align="center"
                  px="lg"
                  py="md"
                  onPress={() => setLogoutSheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('account.profile.logout')}
                >
                  <Box
                    width={moderateScale(36)}
                    height={moderateScale(36)}
                    borderRadius="lg"
                    bg={colors.surface.elevated}
                    align="center"
                    justify="center"
                    me="md"
                  >
                    <LogOut
                      size={moderateScale(18)}
                      color={colors.text.secondary}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text variant="body" color={colors.text.primary}>
                      {t('account.profile.logout')}
                    </Text>
                  </Box>
                  <ChevronIcon
                    size={moderateScale(16)}
                    color={colors.text.tertiary}
                  />
                </Pressable>
              </Box>

              {/* Delete Account */}
              <Box
                mt="md"
                borderRadius="lg"
                bg={colors.surface.main}
                borderWidth="hairline"
                borderColor={colors.status.danger.main}
                overflow="hidden"
              >
                <Pressable
                  row
                  align="center"
                  px="lg"
                  py="md"
                  onPress={() => setDeleteSheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('account.profile.deleteAccount')}
                >
                  <Box
                    width={moderateScale(36)}
                    height={moderateScale(36)}
                    borderRadius="lg"
                    bg={colors.status.danger.soft}
                    align="center"
                    justify="center"
                    me="md"
                  >
                    <Trash2
                      size={moderateScale(18)}
                      color={colors.status.danger.main}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text variant="body" color={colors.status.danger.text}>
                      {t('account.profile.deleteAccount')}
                    </Text>
                  </Box>
                </Pressable>
              </Box>
            </>
          )}
        </Box>
      </Layout>

      {/* Logout confirmation */}
      <BottomSheet
        visible={logoutSheetVisible}
        onClose={() => setLogoutSheetVisible(false)}
        muted
      >
        <Box px="2xl" pt="lg" pb="3xl" align="center">
          <Box
            width={moderateScale(56)}
            height={moderateScale(56)}
            borderRadius="full"
            bg={colors.surface.elevated}
            align="center"
            justify="center"
            mb="lg"
          >
            <LogOut size={moderateScale(24)} color={colors.text.secondary} />
          </Box>
          <Text variant="h4" color={colors.text.primary} mb="sm" align="center">
            {t('account.profile.logoutConfirmTitle')}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            mb="2xl"
            align="center"
          >
            {t('account.profile.logoutConfirmSubtitle')}
          </Text>
          <Box row gap="xl" width="100%" justify="center">
            <CustomButton
              onPress={() => setLogoutSheetVisible(false)}
              title={t('common.cancel')}
              variant="outline"
              fullWidth
              style={styles.halfButton}
            />
            <CustomButton
              onPress={handleLogout}
              title={t('account.profile.logoutConfirmBtn')}
              disabled={isLoggingOut}
              loading={isLoggingOut}
              variant="primary"
              fullWidth
              style={styles.halfButton}
            />
          </Box>
        </Box>
      </BottomSheet>

      {/* Delete account confirmation */}
      <BottomSheet
        visible={deleteSheetVisible}
        onClose={closeDeleteSheet}
        muted
      >
        <Box px="2xl" pt="lg" pb="3xl" align="center">
          <Box
            width={moderateScale(56)}
            height={moderateScale(56)}
            borderRadius="full"
            bg={colors.status.danger.soft}
            align="center"
            justify="center"
            mb="lg"
          >
            <Trash2
              size={moderateScale(24)}
              color={colors.status.danger.main}
            />
          </Box>
          <Text variant="h4" color={colors.text.primary} mb="sm" align="center">
            {t('account.profile.deleteConfirmTitle')}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            mb="2xl"
            align="center"
          >
            {t('account.profile.deleteConfirmSubtitle')}
          </Text>
          <Box width="100%" mb="xl">
            <CustomInput
              label={t('account.profile.deleteConfirmPasswordLabel')}
              placeholder={t(
                'account.profile.deleteConfirmPasswordPlaceholder',
              )}
              value={deletePassword}
              onChangeText={text => {
                setDeletePassword(text);
                setDeletePasswordError(undefined);
              }}
              secureTextEntry
              autoCapitalize="none"
              error={deletePasswordError}
            />
          </Box>
          <Box row gap="xl" width="100%" justify="center">
            <CustomButton
              onPress={closeDeleteSheet}
              title={t('common.cancel')}
              variant="outline"
              fullWidth
              style={styles.halfButton}
            />
            <CustomButton
              onPress={handleDeleteAccount}
              title={t('account.profile.deleteConfirmBtn')}
              disabled={isDeletingAccount || !deletePassword.trim()}
              loading={isDeletingAccount}
              variant="danger"
              fullWidth
              style={styles.halfButton}
            />
          </Box>
        </Box>
      </BottomSheet>
    </>
  );
};

export const ProfileScreen = memo(ProfileScreenComponent);
