import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const BADGE = moderateScale(22);

export interface DealDossierBlockProps {
  /** 1-based position among the blocks this deal actually has. */
  number: number;
  title: string;
  children: React.ReactNode;
}

/** One numbered chapter of the offer file: a small counter, its name, then its content. */
const DealDossierBlockComponent: React.FC<DealDossierBlockProps> = ({
  number,
  title,
  children,
}) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'badge', ViewStyle> => ({
      badge: {
        width: BADGE,
        height: BADGE,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.elevated,
      },
    }),
    [colors.surface.elevated],
  );

  return (
    <Box gap="md">
      <Box row align="center" gap="sm" accessibilityRole="header">
        <Box style={styles.badge}>
          <Text variant="buttonSmall" color={colors.text.secondary}>
            {formatNumber(number)}
          </Text>
        </Box>
        <Box flex={1}>
          <Text variant="buttonSmall" color={colors.text.tertiary}>
            {title}
          </Text>
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export const DealDossierBlock = memo(DealDossierBlockComponent);
