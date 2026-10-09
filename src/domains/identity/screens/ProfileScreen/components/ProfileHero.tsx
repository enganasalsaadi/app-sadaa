import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Camera, Mail, MapPin, Store, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, Image, Pressable, ProgressBar, Text, useHeroCompact } from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

const CAMERA_BADGE = moderateScale(24);

type Hero = ProfileScreenModel['hero'];

interface ProfileHeroProps {
  hero: Hero;
  onChangePhoto: () => void;
}

/** Photo (or logo) in a glass ring with the camera badge; tapping it changes the photo. */
const HeroPhoto = memo<{ hero: Hero; size: number; onPress: () => void }>(
  ({ hero, size, onPress }) => {
    const { t } = useTranslation();
    const { colors, sizes, borderWidths } = useTheme();
    // A brand's avatar is its logo.
    const Placeholder = hero.isBrand ? Building2 : User;
    const ringSize = size + borderWidths.md * 2;
    const styles = useStyles(({ colors: c, radii, borderWidths: bw }) => ({
      camera: {
        position: 'absolute' as const,
        bottom: 0,
        end: 0,
        width: CAMERA_BADGE,
        height: CAMERA_BADGE,
        borderRadius: radii.full,
        borderWidth: bw.thin,
        borderColor: c.text.onBrand,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: c.interactive.main,
      },
    }));

    return (
      <Pressable
        width={ringSize}
        height={ringSize}
        borderRadius="full"
        borderWidth="md"
        borderColor={colors.glass.border}
        align="center"
        justify="center"
        onPress={onPress}
        disabled={hero.isUploadingAvatar}
        accessibilityRole="button"
        accessibilityLabel={t(hero.isBrand ? 'account.profile.changeLogo' : 'account.profile.changePhoto')}
      >
        {hero.avatarUrl ? (
          <Image uri={hero.avatarUrl} size={size} circle />
        ) : (
          <Box width={size} height={size} borderRadius="full" bg={colors.glass.badge} align="center" justify="center">
            <Placeholder size={sizes.icon.md} color={colors.text.onBrand} />
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
    );
  },
);

const HeroName = memo<{ hero: Hero; compact: boolean }>(({ hero, compact }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));

  return (
    <Box row align="center" gap="xs">
      <Box style={styles.shrink}>
        <Text variant={compact ? 'title' : 'h3'} color={colors.text.onBrand} numberOfLines={1}>
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
  );
});

/** One muted line with its icon; the text ellipsizes instead of pushing the icon out. */
const MetaLine = memo<{ icon: LucideIcon; text: string }>(({ icon: Icon, text }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  return (
    <Box row align="center" gap="xs">
      <Icon size={sizes.icon.xs} color={colors.text.onBrandMuted} />
      <Box style={styles.shrink}>
        <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
          {text}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * Glass completion card in the slot Home gives its KPI strip, so both heroes share
 * one height: label and big percentage on one line, the bar, then why it matters.
 * Stays at 100% as a "complete" state instead of collapsing the hero.
 */
const CompletionCard = memo<{ hero: Hero; compact: boolean }>(({ hero, compact }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const percent = formatNumber(hero.percentage / 100, { style: 'percent' });
  const label = t(hero.isComplete ? 'account.profile.completed' : 'account.profile.completion');

  return (
    <Box
      gap="sm"
      px="lg"
      py="md"
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.fill}
      accessible
      accessibilityLabel={`${label}, ${percent}`}
    >
      <Box row align="center" justify="space-between" gap="md">
        <Box row align="center" gap="xs" flex={1}>
          {hero.isComplete ? (
            <BadgeCheck size={sizes.icon.sm} color={colors.glass.iconInteractive} />
          ) : null}
          <Text variant="label" color={colors.text.onBrandMuted} numberOfLines={1}>
            {label}
          </Text>
        </Box>
        <Text variant={compact ? 'title' : 'h4'} color={colors.text.onBrand}>
          {percent}
        </Text>
      </Box>
      <ProgressBar
        value={hero.percentage / 100}
        size="md"
        surface="brand"
        accessibilityLabel={label}
      />
      {compact || hero.isBrand ? null : (
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {t('account.profile.completeSubtitle')}
        </Text>
      )}
    </Box>
  );
});

/**
 * Identity hero built like Home's (`CreatorHomeHero`): the screen name owns the header
 * row beside the actions, the identity block gets the full width, then the glass
 * completion card. Transparent: the navy and its light washes come from the Layout's
 * `brandGlow` backdrop. Compact (keyboard / short screens): one identity row beside
 * the actions, then the card without its benefit line.
 */
const ProfileHeroComponent: React.FC<ProfileHeroProps> = ({ hero, onChangePhoto }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const LocationIcon = hero.isBrand ? Store : MapPin;

  const styles = useStyles(
    ({ spacing }) => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the two header actions at the reading end.
      headerRow: {
        minHeight: sizes.iconButton.md,
        paddingEnd: sizes.iconButton.md * 2 + spacing.xs + spacing.sm,
      },
    }),
    [top, sizes.iconButton.md],
  );

  if (compact) {
    return (
      <Box style={styles.container} px="xl" pb="4xl" gap="md">
        <Box row align="center" gap="md" style={styles.headerRow}>
          <HeroPhoto hero={hero} size={sizes.avatar.md} onPress={onChangePhoto} />
          <Box flex={1}>
            <HeroName hero={hero} compact />
          </Box>
        </Box>
        <CompletionCard hero={hero} compact />
      </Box>
    );
  }

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="lg">
      <Box justify="center" style={styles.headerRow}>
        <Text variant="body" color={colors.text.onBrandMuted} numberOfLines={1}>
          {t('account.profile.title')}
        </Text>
      </Box>

      <Box row align="center" gap="lg">
        <HeroPhoto hero={hero} size={sizes.avatar.lg} onPress={onChangePhoto} />
        <Box flex={1} gap="sm">
          <HeroName hero={hero} compact={false} />
          {hero.location ? <MetaLine icon={LocationIcon} text={hero.location} /> : null}
          {hero.email ? <MetaLine icon={Mail} text={hero.email} /> : null}
        </Box>
      </Box>

      <CompletionCard hero={hero} compact={false} />
    </Box>
  );
};

export const ProfileHero = memo(ProfileHeroComponent);
