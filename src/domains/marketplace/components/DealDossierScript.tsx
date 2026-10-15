import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const STEP = moderateScale(24);
const RAIL = moderateScale(4);

export interface DealDossierScriptProps {
  talkingPoints: string[];
  donts: string[];
}

/**
 * What the ad says, read like a script: numbered lines on a teal rail, then a red «avoid» box.
 * Server text, shown as written.
 */
const DealDossierScriptComponent: React.FC<DealDossierScriptProps> = ({
  talkingPoints,
  donts,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'script' | 'rail' | 'step' | 'avoid', ViewStyle> => ({
      script: {
        borderRadius: radii.xl,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        overflow: 'hidden',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      rail: {
        position: 'absolute',
        start: 0,
        top: spacing.lg,
        bottom: spacing.lg,
        width: RAIL,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.main,
      },
      step: {
        width: STEP,
        height: STEP,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      avoid: {
        borderRadius: radii.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        backgroundColor: colors.status.danger.soft,
      },
    }),
    [
      colors.border.card,
      colors.interactive.main,
      colors.interactive.soft,
      colors.status.danger.soft,
      colors.surface.main,
    ],
  );

  return (
    <Box gap="md">
      {talkingPoints.length > 0 ? (
        <Box style={styles.script}>
          <Box style={styles.rail} />
          {talkingPoints.map((point, index) => (
            <Box key={point} row align="flex-start" gap="md" ps="xs">
              <Box style={styles.step}>
                <Text variant="buttonSmall" color={colors.interactive.text}>
                  {formatNumber(index + 1)}
                </Text>
              </Box>
              <Box flex={1}>
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {point}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
      {donts.length > 0 ? (
        <Box style={styles.avoid}>
          <Text variant="buttonSmall" color={colors.status.danger.text}>
            {t('marketplace.deals.dossier.avoid')}
          </Text>
          {donts.map(dont => (
            <Box key={dont} row align="flex-start" gap="sm">
              <X size={sizes.icon.sm} color={colors.status.danger.main} />
              <Box flex={1}>
                <Text variant="bodySmall" color={colors.text.primary}>
                  {dont}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export const DealDossierScript = memo(DealDossierScriptComponent);
