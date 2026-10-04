import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';

interface AccountFooterProps {
  appVersion: string;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const AccountFooterComponent: React.FC<AccountFooterProps> = ({
  appVersion,
  onLogout,
  onDeleteAccount,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="md" align="center">
      <CustomButton
        title={t('account.profile.logout')}
        variant="secondary"
        fullWidth
        leftIcon={<LogOut />}
        onPress={onLogout}
      />
      <Pressable
        onPress={onDeleteAccount}
        minHeight={sizes.button.md}
        justify="center"
        px="lg"
        accessibilityRole="button"
        accessibilityLabel={t('auth.deleteAccount.entry')}
      >
        <Text variant="bodySmall" color={colors.status.danger.text}>
          {t('auth.deleteAccount.entry')}
        </Text>
      </Pressable>
      <Text variant="caption" color={colors.text.tertiary} align="center">
        {t('account.profile.footer', { tagline: t('common.tagline'), version: appVersion })}
      </Text>
    </Box>
  );
};

export const AccountFooter = memo(AccountFooterComponent);
