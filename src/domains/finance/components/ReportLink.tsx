import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface ReportLinkProps {
  onPress: () => void;
}

/** "Report a problem" teal link under a read-only money record (receipt, top-up). */
const ReportLinkComponent: React.FC<ReportLinkProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box align="center">
      <Pressable
        onPress={onPress}
        row
        align="center"
        gap="xs"
        minHeight={sizes.button.md}
        accessibilityRole="link"
        accessibilityLabel={t('finance.receipt.report')}
      >
        <CircleAlert size={sizes.icon.xs} color={colors.interactive.main} />
        <Text variant="bodyMedium" color={colors.interactive.text}>
          {t('finance.receipt.report')}
        </Text>
      </Pressable>
    </Box>
  );
};

export const ReportLink = memo(ReportLinkComponent);
