import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import type { ApplicantCard } from '../../../types/campaign';
import { firstNameOf } from '../../../utils/creatorText';

export interface CompareDockProps {
  cards: readonly ApplicantCard[];
  onSelect: (card: ApplicantCard) => void;
}

const DockSlot = memo<{ card: ApplicantCard; onSelect: (card: ApplicantCard) => void }>(({ card, onSelect }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const press = useCallback(() => onSelect(card), [onSelect, card]);
  const name = card.creator.displayName;
  return (
    <Box flex={1} align="center" justify="center">
      {card.actions.canSelect ? (
        <CustomButton
          title={t('marketplace.campaign.applicants.compare.result.select', { name: firstNameOf(name) })}
          size="sm"
          fullWidth
          accessibilityLabel={t('marketplace.campaign.applicants.compare.result.select', { name })}
          onPress={press}
        />
      ) : (
        <Text variant="caption" color={colors.text.secondary} align="center">
          {t('marketplace.campaign.applicants.compare.result.cantSelect')}
        </Text>
      )}
    </Box>
  );
});

/**
 * One «select» under each column (PC3.4): the same hold-to-sign sheet as the applicant's page. A
 * column the server won't let the brand select (`can_select` false) says so instead of a dead button.
 */
const CompareDockComponent: React.FC<CompareDockProps> = ({ cards, onSelect }) => (
  <Box row gap="sm" px="xl" py="md">
    {cards.map(card => (
      <DockSlot key={card.id} card={card} onSelect={onSelect} />
    ))}
  </Box>
);

export const CompareDock = memo(CompareDockComponent);
