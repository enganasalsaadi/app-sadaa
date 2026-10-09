import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, Skeleton, Tag, Text } from '@/shared/ui';

interface NichesCardProps {
  labels: string[];
  isLoading: boolean;
  onPress: () => void;
}

const NichesCardComponent: React.FC<NichesCardProps> = ({ labels, isLoading, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card
      p="lg"
      onPress={onPress}
      accessibilityLabel={t('account.profile.niches.title')}
    >
      <Box gap="md">
        <Box row align="center" gap="sm">
          <Box flex={1}>
            <Text variant="title">{t('account.profile.niches.title')}</Text>
          </Box>
          <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
        </Box>
        {isLoading ? (
          <Skeleton width="70%" height={sizes.icon.md} borderRadius="md" />
        ) : labels.length > 0 ? (
          <Box row wrap gap="sm">
            {labels.map(label => (
              <Tag key={label} label={label} tone="brand" />
            ))}
          </Box>
        ) : (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('account.profile.niches.empty')}
          </Text>
        )}
      </Box>
    </Card>
  );
};

export const NichesCard = memo(NichesCardComponent);
