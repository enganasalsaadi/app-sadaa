import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Tag, Text } from '@/shared/ui';

interface CampaignFieldProps {
  label: string;
  /** Small muted words beside the label («image · up to 20MB»). */
  note?: string;
  /** Who sees this: a tag that makes the audience unmistakable. */
  tag?: string;
  children: React.ReactNode;
}

/** A labelled block of a wizard step: bold label, optional note / audience tag, then the control. */
const CampaignFieldComponent: React.FC<CampaignFieldProps> = ({ label, note, tag, children }) => {
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Box row align="center" wrap gap="sm">
        <Text variant="bodyMedium" color={colors.text.primary} accessibilityRole="header">
          {label}
        </Text>
        {tag ? <Tag label={tag} tone="brand" /> : null}
        {note ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {note}
          </Text>
        ) : null}
      </Box>
      {children}
    </Box>
  );
};

export const CampaignField = memo(CampaignFieldComponent);
