import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface CampaignReviewNoteCardProps {
  note: string;
}

/** The team's note after changes were requested (or a rejection), lifted above the details as a quote. */
const CampaignReviewNoteCardComponent: React.FC<CampaignReviewNoteCardProps> = ({ note }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { warning } = colors.status;
  return (
    <Box p="lg" gap="sm" borderRadius="xl" bg={warning.soft} accessible>
      <Box row align="center" gap="sm">
        <ShieldAlert size={sizes.icon.sm} color={warning.main} strokeWidth={iconStroke.bold} />
        <Text variant="label" color={warning.text}>
          {t('marketplace.campaign.wizard.review.note.title')}
        </Text>
      </Box>
      <Text variant="body" color={colors.text.primary}>
        {note}
      </Text>
    </Box>
  );
};

export const CampaignReviewNoteCard = memo(CampaignReviewNoteCardComponent);
