import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import type { ViewStyle } from 'react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';

const LINE_HEIGHT = moderateScale(10);
/** Widths of the stand-in lines, as a share of the card: they only suggest text, nothing real is behind them. */
const LINES = [0.92, 0.7, 0.84] as const;

export interface CampaignBriefLockProps {
  /** The reason it is shut, when the campaign page's own wording doesn't fit (the deal's file says its own). */
  body?: string;
}

/**
 * The brand's private brief as a sealed block: grey bars where text would be and the reason it is shut.
 * The brief reaches a creator only after the brand funds their deal (contract §4.1), so nothing here is real content.
 */
const CampaignBriefLockComponent: React.FC<CampaignBriefLockProps> = ({ body }) => {
  const { t } = useTranslation();
  const reason = body ?? t('marketplace.campaign.opportunity.brief.body');
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'bar', ViewStyle> => ({
      bar: {
        height: LINE_HEIGHT,
        borderRadius: radii.full,
        backgroundColor: colors.border.strong,
      },
    }),
    [colors.border.strong],
  );
  return (
    <Card p="lg">
      <Box
        gap="md"
        accessible
        accessibilityLabel={`${t('marketplace.campaign.opportunity.brief.title')}. ${reason}`}
      >
        <Box
          gap="sm"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {LINES.map(share => (
            <Box
              key={share}
              style={[styles.bar, { width: `${share * 100}%` }]}
            />
          ))}
        </Box>
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="full"
            align="center"
            justify="center"
            bg={colors.surface.elevated}
          >
            <Lock
              size={sizes.icon.sm}
              color={colors.icon.secondary}
              strokeWidth={iconStroke.bold}
            />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" color={colors.text.primary}>
              {t('marketplace.campaign.opportunity.brief.title')}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {reason}
            </Text>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export const CampaignBriefLock = memo(CampaignBriefLockComponent);
