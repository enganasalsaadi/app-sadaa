import React, { memo } from 'react';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, Text } from '@/shared/ui';
import type { ViewStyle } from 'react-native';

const BADGE = moderateScale(24);

export interface CampaignPageSectionProps {
  /** Position on the page: the numbered ticket that opens the section. */
  index: number;
  title: string;
  /** Small note at the reading end («2 items»). */
  note?: string;
  children: React.ReactNode;
}

/** A numbered section of the creator's campaign page: a teal number, the title, then its cards. */
const CampaignPageSectionComponent: React.FC<CampaignPageSectionProps> = ({ index, title, note, children }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    (): Record<'badge', ViewStyle> => ({
      badge: {
        width: BADGE,
        height: BADGE,
        borderRadius: BADGE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors.interactive.soft],
  );
  return (
    <Box gap="md">
      <Box row align="center" gap="sm">
        <Box style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text variant="label" color={colors.interactive.text}>
            {formatNumber(index)}
          </Text>
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} accessibilityRole="header">
            {title}
          </Text>
        </Box>
        {note ? (
          <Text variant="caption" color={colors.text.secondary}>
            {note}
          </Text>
        ) : null}
      </Box>
      {children}
    </Box>
  );
};

export const CampaignPageSection = memo(CampaignPageSectionComponent);
