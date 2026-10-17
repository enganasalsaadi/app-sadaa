import React, { memo } from 'react';
import { Package } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';

export interface CreatorConditionsShipping {
  title: string;
  body: string;
}

export interface CreatorConditionsCardProps {
  /** Who the campaign is for, as short chips (gender, followers, cities, niches). */
  chips: string[];
  /** The brand's public description of what it looks for. */
  teaser: string | null;
  shipping: CreatorConditionsShipping | null;
  /** Said when nothing narrows the audience. */
  anyoneLabel: string;
}

/** The public terms: who the campaign targets, the brand's own words, and how a product would reach the creator. */
const CreatorConditionsCardComponent: React.FC<CreatorConditionsCardProps> = ({
  chips,
  teaser,
  shipping,
  anyoneLabel,
}) => {
  const { colors, sizes } = useTheme();
  return (
    <Card p="lg">
      <Box gap="md">
        <Box row wrap gap="sm">
          {(chips.length > 0 ? chips : [anyoneLabel]).map(chip => (
            <Box
              key={chip}
              px="md"
              py="xs"
              borderRadius="full"
              bg={colors.interactive.soft}
            >
              <Text variant="label" color={colors.interactive.text}>
                {chip}
              </Text>
            </Box>
          ))}
        </Box>
        {teaser ? (
          <Text variant="body" color={colors.text.primary}>
            {teaser}
          </Text>
        ) : null}
        {shipping ? (
          <Box
            row
            align="center"
            gap="md"
            p="md"
            borderRadius="lg"
            bg={colors.surface.elevated}
          >
            <Package
              size={sizes.icon.md}
              color={colors.icon.secondary}
              strokeWidth={iconStroke.regular}
            />
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" color={colors.text.primary}>
                {shipping.title}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {shipping.body}
              </Text>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const CreatorConditionsCard = memo(CreatorConditionsCardComponent);
