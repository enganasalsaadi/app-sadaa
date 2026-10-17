import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Text, TierBadge } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import type { ApplicantCard } from '../../../types/campaign';
import { applicantTier } from '../../../utils/applicants';

const FACE = moderateScale(76);

export interface CompareFacesProps {
  cards: readonly ApplicantCard[];
  onOpen: (applicationId: string) => void;
}

const CompareFace = memo<{ card: ApplicantCard; onOpen: (applicationId: string) => void }>(({ card, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { creator } = card;
  const tier = applicantTier(creator.tier);
  const open = useCallback(() => onOpen(card.id), [onOpen, card.id]);
  return (
    <Pressable
      flex={1}
      align="center"
      gap="xs"
      pt="xs"
      scaleOnPress
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.campaign.applicants.compare.result.openA11y', { name: creator.displayName })}
    >
      <Box shadow="card" borderRadius="full">
        <ApplicantFace name={creator.displayName} avatarUrl={creator.avatarUrl} size={FACE} large />
      </Box>
      <Text variant="bodyMedium" color={colors.text.primary} align="center" numberOfLines={2}>
        {creator.displayName}
      </Text>
      {tier ? <TierBadge tier={tier} size="sm" interactive={false} /> : null}
    </Pressable>
  );
});

/** The columns' heads: each picked creator's face and name, pinned under the header while the rows scroll. A tap opens them. */
const CompareFacesComponent: React.FC<CompareFacesProps> = ({ cards, onOpen }) => {
  const { colors } = useTheme();
  return (
    <Box row gap="sm" px="xl" py="sm" bg={colors.layout.base}>
      {cards.map(card => (
        <CompareFace key={card.id} card={card} onOpen={onOpen} />
      ))}
    </Box>
  );
};

export const CompareFaces = memo(CompareFacesComponent);
