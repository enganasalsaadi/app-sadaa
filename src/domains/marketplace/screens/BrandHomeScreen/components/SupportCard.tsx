import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Text } from '@/shared/ui';

interface SupportCardProps {
  onContact: () => void;
}

/** General help at the foot of Home only, never inside a deal (rule 06: deals stay in-app). */
const SupportCardComponent: React.FC<SupportCardProps> = ({ onContact }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Card p="lg">
      <Box gap="md">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <MessageCircle size={sizes.icon.sm} color={colors.interactive.main} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title">{t('marketplace.brandHome.support.title')}</Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.brandHome.support.body')}
            </Text>
          </Box>
        </Box>
        <CustomButton
          title={t('marketplace.brandHome.support.action')}
          variant="secondary"
          size="md"
          onPress={onContact}
          fullWidth
        />
      </Box>
    </Card>
  );
};

export const SupportCard = memo(SupportCardComponent);
