import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Sparkles, Users } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Text, Pressable, BottomSheet } from '@/shared/ui';

export type AccountType = 'brand' | 'influencer';

interface AccountTypeSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: AccountType) => void;
}

export const AccountTypeSheet: React.FC<AccountTypeSheetProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const renderOption = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress?: () => void,
    disabled = false,
  ) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      row
      align="center"
      gap="lg"
      p="lg"
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.border.default}
      bg={colors.surface.main}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Box
        width={44}
        height={44}
        borderRadius="md"
        bg={colors.interactive.soft}
        align="center"
        justify="center"
      >
        {icon}
      </Box>
      <Box flex={1} gap="xs">
        <Box row align="center" gap="sm">
          <Text variant="body" color={colors.text.primary}>
            {title}
          </Text>
          {disabled && (
            <Box
              px="sm"
              py="xs"
              borderRadius="full"
              bg={colors.status.neutral.soft}
            >
              <Text variant="caption" color={colors.status.neutral.text}>
                {t('auth.accountType.comingSoon')}
              </Text>
            </Box>
          )}
        </Box>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {subtitle}
        </Text>
      </Box>
    </Pressable>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Box gap="lg" px="2xl" pb="2xl">
        <Text variant="h4" align="center">
          {t('auth.accountType.title')}
        </Text>

        {renderOption(
          <Building2 size={22} color={colors.interactive.main} />,
          t('auth.accountType.brand'),
          t('auth.accountType.brandSubtitle'),
          () => onSelect('brand'),
        )}
        {renderOption(
          <Users size={22} color={colors.interactive.main} />,
          t('auth.accountType.influencer'),
          t('auth.accountType.influencerSubtitle'),
          () => onSelect('influencer'),
        )}
        {renderOption(
          <Sparkles size={22} color={colors.icon.disabled} />,
          t('auth.accountType.agency'),
          t('auth.accountType.agencySubtitle'),
          undefined,
          true,
        )}
      </Box>
    </BottomSheet>
  );
};
