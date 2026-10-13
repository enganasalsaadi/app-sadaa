import React, { memo } from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BellOff } from 'lucide-react-native';
import type { PushPermission } from '@/core/notification';
import { moderateScale, opacity, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, GradientSurface, Text } from '@/shared/ui';

const APP_TILE = moderateScale(38);
const OFF_BADGE = moderateScale(40);
const LINE_H = moderateScale(9);
/** The blurred notification's text lines (a shape, not copy). */
const GHOST_LINES: readonly DimensionValue[] = ['40%', '85%', '60%'];

interface PushCardProps {
  permission: PushPermission | null;
  isBrand: boolean;
  onEnable: () => void;
}

/**
 * Push off: a faded notification that never arrived, with the bell crossed out over it.
 * Askable → the OS dialog · blocked → the device settings. Shown only while off.
 */
const PushCardComponent: React.FC<PushCardProps> = ({ permission, isBrand, onEnable }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const blocked = permission === 'blocked';

  const styles = useStyles(
    ({ radii }): Record<'off' | 'line', ViewStyle> => ({
      off: {
        position: 'absolute',
        top: '50%',
        start: '50%',
        width: OFF_BADGE,
        height: OFF_BADGE,
        marginTop: -OFF_BADGE / 2,
        marginStart: -OFF_BADGE / 2,
        borderRadius: radii.full,
        backgroundColor: colors.status.warning.soft,
        alignItems: 'center',
        justifyContent: 'center',
      },
      line: { height: LINE_H, borderRadius: radii.xs, backgroundColor: colors.border.default },
    }),
    [colors.border.default, colors.status.warning.soft],
  );

  if (permission !== 'askable' && permission !== 'blocked') return null;

  const title = t(blocked ? 'account.profile.push.blockedTitle' : 'account.profile.push.offTitle');
  const body = t(
    blocked
      ? 'account.profile.push.blockedBody'
      : isBrand
        ? 'account.profile.push.offBodyBrand'
        : 'account.profile.push.offBody',
  );

  return (
    <Box p="lg" gap="md" borderRadius="xl" bg={colors.surface.main} borderWidth="thin" borderColor={colors.border.card} shadow="card">
      <Box importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Box row align="center" gap="sm" p="md" borderRadius="lg" bg={colors.surface.elevated} opacity={opacity.disabled}>
          <GradientSurface variant="brand" width={APP_TILE} height={APP_TILE} borderRadius="md" />
          <Box flex={1} gap="sm">
            {GHOST_LINES.map(width => (
              <Box key={String(width)} width={width} style={styles.line} />
            ))}
          </Box>
        </Box>
        <Box style={styles.off} pointerEvents="none">
          <BellOff size={sizes.icon.md} color={colors.status.warning.main} />
        </Box>
      </Box>

      <Box row align="center" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="title">{title}</Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {body}
          </Text>
        </Box>
        <CustomButton
          title={t(blocked ? 'account.profile.push.openSettings' : 'account.profile.push.enable')}
          variant={blocked ? 'secondary' : 'primary'}
          size="md"
          onPress={onEnable}
        />
      </Box>
    </Box>
  );
};

export const PushCard = memo(PushCardComponent);
