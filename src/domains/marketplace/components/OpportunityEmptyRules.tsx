import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';

const RULES = [
  'marketplace.campaign.feed.empty.rules.platform',
  'marketplace.campaign.feed.empty.rules.followers',
  'marketplace.campaign.feed.empty.rules.gender',
] as const;

/** Why the feed can be empty: the three things a campaign checks about the creator before it shows (contract §4.1). */
const OpportunityEmptyRulesComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Card p="lg">
      <Box gap="md">
        {RULES.map(rule => (
          <Box key={rule} row align="center" gap="md">
            <Check
              size={sizes.icon.sm}
              color={colors.interactive.main}
              strokeWidth={iconStroke.bold}
            />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.primary}>
                {t(rule)}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export const OpportunityEmptyRules = memo(OpportunityEmptyRulesComponent);
