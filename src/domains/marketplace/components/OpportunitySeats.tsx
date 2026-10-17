import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/** Past this many seats the dots stop reading as a count, so only the words remain. */
const MAX_DOTS = 8;

export interface OpportunitySeatsProps {
  total: number;
  free: number;
}

/** «3 of 5 free»: a teal dot per free seat, a pale one per taken seat. Never says who took them. */
const OpportunitySeatsComponent: React.FC<OpportunitySeatsProps> = ({ total, free }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const slots = useMemo(() => Array.from({ length: Math.min(total, MAX_DOTS) }, (_, index) => index), [total]);
  const label = t('marketplace.campaign.feed.card.seats', { free, total });

  return (
    <Box gap="xs" accessible accessibilityLabel={t('marketplace.campaign.feed.card.seatsA11y', { free, total })}>
      {total <= MAX_DOTS ? (
        <Box row gap="xs">
          {slots.map(index => (
            <Box
              key={index}
              width={sizes.dot.md}
              height={sizes.dot.md}
              borderRadius="full"
              bg={index < free ? colors.interactive.main : colors.border.strong}
            />
          ))}
        </Box>
      ) : null}
      <Text variant="caption" color={colors.text.secondary}>
        {label}
      </Text>
    </Box>
  );
};

export const OpportunitySeats = memo(OpportunitySeatsComponent);
