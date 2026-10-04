import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Camera, Mail, MapPin, Store, User } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import {
  Box,
  GradientSurface,
  Image,
  Pressable,
  ProgressBar,
  Text,
  useHeroCompact,
} from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

const AVATAR = moderateScale(64);
const AVATAR_COMPACT = moderateScale(48);
const CAMERA_BADGE = moderateScale(24);

interface ProfileHeroProps {
  hero: ProfileScreenModel['hero'];
  onChangePhoto: () => void;
}

/**
 * Navy identity hero (≤ 25% of the screen): avatar row + completion bar, which is
 * dropped at 100%. Leaves room on top for the overlay header (title + edit action).
 */
const ProfileHeroComponent: React.FC<ProfileHeroProps> = ({ hero, onChangePhoto }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const avatarSize = compact ? AVATAR_COMPACT : AVATAR;
  // A brand's avatar is its logo, and its line is "activity · city".
  const Placeholder = hero.isBrand ? Building2 : User;
  const LocationIcon = hero.isBrand ? Store : MapPin;

  const styles = useStyles(
    ({ colors: c, radii, borderWidths }) => ({
      // Matches the overlay ScreenHeader: inset + vertical padding + one icon-button row.
      container: { paddingTop: top + spacing.sm * 2 + sizes.iconButton.md },
      camera: {
        position: 'absolute' as const,
        bottom: 0,
        end: 0,
        width: CAMERA_BADGE,
        height: CAMERA_BADGE,
        borderRadius: radii.full,
        borderWidth: borderWidths.thin,
        borderColor: c.text.onBrand,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: c.interactive.main,
      },
      // Lets one-line texts ellipsize next to their icon instead of pushing it out.
      shrink: { flexShrink: 1 },
    }),
    [top, spacing.sm, sizes.iconButton.md],
  );

  return (
    <GradientSurface variant="brand" style={styles.container} px="xl" pb="xl" gap="lg">
      <Box row align="center" gap="lg">
        <Pressable
          onPress={onChangePhoto}
          disabled={hero.isUploadingAvatar}
          accessibilityRole="button"
          accessibilityLabel={t(hero.isBrand ? 'account.profile.changeLogo' : 'account.profile.changePhoto')}
        >
          {hero.avatarUrl ? (
            <Image uri={hero.avatarUrl} size={avatarSize} circle />
          ) : (
            <Box
              width={avatarSize}
              height={avatarSize}
              borderRadius="full"
              bg={colors.glass.badge}
              align="center"
              justify="center"
            >
              <Placeholder size={sizes.icon.lg} color={colors.text.onBrand} />
            </Box>
          )}
          <Box style={styles.camera}>
            {hero.isUploadingAvatar ? (
              <ActivityIndicator size="small" color={colors.text.onAccent} />
            ) : (
              <Camera size={sizes.icon.xs} color={colors.text.onAccent} />
            )}
          </Box>
        </Pressable>

        <Box flex={1} gap="xs">
          <Box row align="center" gap="xs">
            <Box style={styles.shrink}>
              <Text variant="h4" color={colors.text.onBrand} numberOfLines={1}>
                {hero.displayName || '—'}
              </Text>
            </Box>
            {hero.isVerified ? (
              <BadgeCheck
                size={sizes.icon.sm}
                color={colors.premium.main}
                accessibilityLabel={t('account.profile.kyc.verifiedPill')}
              />
            ) : null}
          </Box>
          {hero.location ? (
            <Box row align="center" gap="xs">
              <LocationIcon size={sizes.icon.xs} color={colors.text.onBrandMuted} />
              <Box style={styles.shrink}>
                <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
                  {hero.location}
                </Text>
              </Box>
            </Box>
          ) : null}
          {hero.email && !compact ? (
            <Box row align="center" gap="xs">
              <Mail size={sizes.icon.xs} color={colors.text.onBrandMuted} />
              <Box style={styles.shrink}>
                <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
                  {hero.email}
                </Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>

      {hero.isComplete ? null : (
        <ProgressBar
          value={hero.percentage / 100}
          surface="brand"
          label={t('account.profile.completion')}
          valueLabel={formatNumber(hero.percentage / 100, { style: 'percent' })}
          accessibilityLabel={t('account.profile.completion')}
        />
      )}
    </GradientSurface>
  );
};

export const ProfileHero = memo(ProfileHeroComponent);
