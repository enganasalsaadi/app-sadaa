import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomInput, Pressable, Text } from '@/shared/ui';

interface LockedPhoneFieldProps {
  /** Already formatted for display. */
  phone: string;
  onContactSupport: () => void;
}

/**
 * The phone is the account identity and has no edit endpoint: shown read-only,
 * with a way out through support instead of a dead field.
 */
const LockedPhoneFieldComponent: React.FC<LockedPhoneFieldProps> = ({ phone, onContactSupport }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="xs">
      <CustomInput
        label={t('account.phoneLocked.label')}
        value={phone}
        editable={false}
        rightIcon={<Lock />}
        accessibilityHint={t('account.phoneLocked.hint')}
      />
      <Text variant="caption" color={colors.text.secondary}>
        {t('account.phoneLocked.hint')}
      </Text>
      <Pressable
        onPress={onContactSupport}
        row
        align="center"
        gap="xs"
        minHeight={sizes.button.md}
        accessibilityRole="link"
        accessibilityLabel={t('account.phoneLocked.contactSupport')}
      >
        <MessageCircle size={sizes.icon.sm} color={colors.interactive.main} />
        <Text variant="bodyMedium" color={colors.interactive.text}>
          {t('account.phoneLocked.contactSupport')}
        </Text>
      </Pressable>
    </Box>
  );
};

export const LockedPhoneField = memo(LockedPhoneFieldComponent);
