import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Store } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text, useHeroCompact } from '@/shared/ui';
import type { ProfileStepTarget } from '../../../constants/profileSteps';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';
import { KycPill } from './KycPill';
import { ProfileOrbit } from './ProfileOrbit';

interface ProfileHeroProps {
  hero: ProfileScreenModel['hero'];
  onChangePhoto: () => void;
  onStepPress: (target: ProfileStepTarget) => void;
  /** Set while documents can be sent: the KYC pill leads there. */
  onOpenKyc?: () => void;
}

/**
 * Centred identity on the navy hero: the tab name beside the header actions, the
 * orbit (photo + completion ring + satellites), the name, where they are and the KYC pill.
 * Transparent: the navy and its lights come from the Layout's `brandGlow` backdrop,
 * and the body slides over its bottom edge as a sheet.
 */
const ProfileHeroComponent: React.FC<ProfileHeroProps> = ({ hero, onChangePhoto, onStepPress, onOpenKyc }) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const LocationIcon = hero.isBrand ? Store : MapPin;

  const styles = useStyles(
    ({ spacing }): Record<'container' | 'titleRow' | 'identity' | 'shrink', ViewStyle> => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the two header actions at the reading end.
      titleRow: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        minHeight: sizes.iconButton.md,
        paddingEnd: sizes.iconButton.md * 2 + spacing.xs + spacing.sm,
      },
      // Room for the percentage pill hanging off the ring.
      identity: { marginTop: compact ? spacing.lg : spacing['2xl'] },
      shrink: { flexShrink: 1 },
    }),
    [compact, top, sizes.iconButton.md],
  );

  return (
    <Box style={styles.container} px="xl" pb={compact ? '3xl' : '4xl'} align="center" gap={compact ? 'sm' : 'md'}>
      <Box style={styles.titleRow}>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1}>
          {hero.title}
        </Text>
      </Box>

      <ProfileOrbit hero={hero} compact={compact} onChangePhoto={onChangePhoto} onStepPress={onStepPress} />

      <Box style={styles.identity} align="center" gap="xs">
        <Text variant={compact ? 'title' : 'h3'} color={colors.text.onBrand} align="center" numberOfLines={2}>
          {hero.displayName || '—'}
        </Text>
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
      </Box>

      <KycPill status={hero.kycStatus} isBrand={hero.isBrand} onPress={onOpenKyc} />
    </Box>
  );
};

export const ProfileHero = memo(ProfileHeroComponent);
