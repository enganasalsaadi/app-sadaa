import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import type { CreatorCampaignDeliverable } from '../types/campaign';

export interface CreatorAskCardProps {
  deliverable: CreatorCampaignDeliverable;
}

/** One thing the brand asks for: the platform, the service, how many, then its small print (revisions, add-ons). */
const CreatorAskCardComponent: React.FC<CreatorAskCardProps> = ({
  deliverable,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { platform, service, count, revisions, addons } = deliverable;
  const facts = [
    revisions > 0
      ? t('marketplace.campaign.opportunity.asks.revisions', {
          count: revisions,
        })
      : null,
    ...addons,
  ].filter((fact): fact is string => !!fact);

  return (
    <Card p="lg">
      <Box gap="sm">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="full"
            align="center"
            justify="center"
            bg={colors.surface.elevated}
          >
            {isSocialPlatform(platform.key) ? (
              <SocialPlatformIcon
                platform={platform.key}
                size={sizes.icon.sm}
                color={colors.text.primary}
              />
            ) : (
              <Text variant="label" color={colors.text.secondary}>
                {platform.label.slice(0, 2)}
              </Text>
            )}
          </Box>
          <Box flex={1}>
            <Text
              variant="bodyMedium"
              color={colors.text.primary}
              numberOfLines={1}
            >
              {service.label}
            </Text>
            <Text
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={1}
            >
              {platform.label}
            </Text>
          </Box>
          <Text variant="title" color={colors.text.primary}>
            {`×${formatNumber(count)}`}
          </Text>
        </Box>
        {facts.length > 0 ? (
          <Box row wrap gap="sm">
            {facts.map(fact => (
              <Box
                key={fact}
                px="md"
                py="xs"
                borderRadius="full"
                bg={colors.surface.elevated}
              >
                <Text variant="label" color={colors.text.secondary}>
                  {fact}
                </Text>
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const CreatorAskCard = memo(CreatorAskCardComponent);
