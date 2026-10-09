import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, Pressable, Tag, Text } from '@/shared/ui';
import type { PayoutMethodFormScreenModel } from '../hooks/usePayoutMethodFormScreen';

interface PayoutChannelCardProps {
  channel: NonNullable<PayoutMethodFormScreenModel['channel']>;
  onChange: () => void;
}

/** The method's channel: changeable while adding, locked once saved (handoff §7). */
const PayoutChannelCardComponent: React.FC<PayoutChannelCardProps> = ({ channel, onChange }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = channel.icon;

  return (
    <Box gap="sm">
      <Card px="lg" py="md">
        <Box row align="center" gap="md">
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="md"
          bg={colors.brand.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.brand.text} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium">{channel.name}</Text>
          <Box row gap="xs">
            {channel.currencies.map(code => (
              <Tag key={code} label={code} />
            ))}
          </Box>
        </Box>
        {channel.canChange ? (
          <Pressable
            onPress={onChange}
            minHeight={sizes.button.md}
            justify="center"
            px="sm"
            accessibilityRole="button"
            accessibilityLabel={t('finance.payouts.form.changeChannelLabel')}
          >
            <Text variant="button" color={colors.interactive.text}>
              {t('finance.payouts.form.changeChannel')}
            </Text>
          </Pressable>
        ) : (
          <Lock size={sizes.icon.sm} color={colors.icon.secondary} accessibilityLabel={t('finance.payouts.form.lockedLabel')} />
        )}
        </Box>
      </Card>
      {channel.canChange ? null : (
        <Text variant="caption" color={colors.text.tertiary} mx="xs">
          {t('finance.payouts.form.lockedHint')}
        </Text>
      )}
    </Box>
  );
};

export const PayoutChannelCard = memo(PayoutChannelCardComponent);
