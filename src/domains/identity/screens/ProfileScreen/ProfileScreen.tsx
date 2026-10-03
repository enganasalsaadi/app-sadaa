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
  Camera,
  UserRoundPen,
  Palette,
} from 'lucide-react-native';
import { useTheme, useStyles, moderateScale } from '@/core/theme';
import { useProfileScreen } from './hooks/useProfileScreen';
import type { SettingsStackScreenProps } from '@/core/navigation';
import { navigate } from '@/core/navigation';
import {
  BottomSheet,
  Box,
  CustomButton,
  IconButton,
  Image,
  Layout,
  ListGroup,
  ListRow,
  Pressable,
  Text,
} from '@/shared/ui';
import { DeleteAccountSheet } from '@/domains/auth';

type Props = SettingsStackScreenProps<'ProfileScreen'>;

const AVATAR_SIZE = moderateScale(88);

const ProfileScreenComponent: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(({ colors: c, radii }) => ({
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
    halfButton: {
      flex: 1,
    },
  }));

  const {
    user,
    isLoggingOut,
    isUploadingAvatar,
    logoutSheetVisible,
    deleteSheetVisible,
    setLogoutSheetVisible,
    openDeleteSheet,
    closeDeleteSheet,
    handleLogout,
    handleChangePhoto,
  } = useProfileScreen();

  const accountSettingsItems = [
    {
      key: 'security',
      icon: Shield,
      label: t('account.profile.changePassword'),
      onPress: () => navigation.navigate('ChangePasswordScreen'),
    },
  ];

  const appSettingsItems = [
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

  const settingsItems = [
    ...accountSettingsItems,
    ...appSettingsItems,
    ...devSettingsItems,
  ];

  return (
    <>
      <Layout
        padding="none"
        header={{ title: t('account.profile.title'), showBackButton: false }}
      >
        {/* Hero */}
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
                <User size={moderateScale(40)} color={colors.text.tertiary} />
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
                <ActivityIndicator size="small" color={colors.text.onAccent} />
              ) : (
                <Camera size={moderateScale(14)} color={colors.text.onAccent} />
              )}
            </Pressable>
          </Box>

          <Box row align="center" mt="lg" gap="sm">
            <Text variant="h3" color={colors.text.primary} align="center">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
                '—'}
            </Text>
            <IconButton
              icon={UserRoundPen}
              size="sm"
              onPress={() => navigation.navigate('EditAccountScreen')}
              accessibilityLabel={t('account.editAccount.title')}
            />
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
        </Box>

        {/* Settings section */}
        <Box px="2xl" pb="5xl" gap="lg">
          <ListGroup title={t('account.profile.settings')}>
            {settingsItems.map(item => (
              <ListRow
                key={item.key}
                icon={item.icon}
                title={item.label}
                onPress={item.onPress}
              />
            ))}
          </ListGroup>

          <ListGroup>
            <ListRow
              icon={LogOut}
              title={t('account.profile.logout')}
              onPress={() => setLogoutSheetVisible(true)}
            />
          </ListGroup>
          <ListGroup tone="danger">
            <ListRow
              icon={Trash2}
              tone="danger"
              title={t('auth.deleteAccount.entry')}
              onPress={openDeleteSheet}
            />
          </ListGroup>
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

      <DeleteAccountSheet
        visible={deleteSheetVisible}
        onClose={closeDeleteSheet}
      />
    </>
  );
};

export const ProfileScreen = memo(ProfileScreenComponent);
