import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronLeft, ChevronRight, Sparkles, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { useTheme } from '@/core/theme';
import { Box, Text, Pressable, BottomSheet } from '@/shared/ui';

export type AccountType = 'brand' | 'influencer' | 'agency';

interface AccountTypeOptionDef {
  type: AccountType;
  icon: LucideIcon;
  titleKey: ParseKeys;
  subtitleKey: ParseKeys;
  available: boolean;
}

// Flip `available` as each registration wizard ships.
const OPTIONS: readonly AccountTypeOptionDef[] = [
  {
    type: 'brand',
    icon: Building2,
    titleKey: 'auth.accountType.brand',
    subtitleKey: 'auth.accountType.brandSubtitle',
    available: true,
  },
  {
    type: 'influencer',
    icon: Users,
    titleKey: 'auth.accountType.influencer',
    subtitleKey: 'auth.accountType.influencerSubtitle',
    available: false,
  },
  {
    type: 'agency',
    icon: Sparkles,
    titleKey: 'auth.accountType.agency',
    subtitleKey: 'auth.accountType.agencySubtitle',
    available: false,
  },
];

interface AccountTypeOptionProps {
  option: AccountTypeOptionDef;
  onSelect: (type: AccountType) => void;
}

const AccountTypeOption: React.FC<AccountTypeOptionProps> = memo(({ option, onSelect }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Icon = option.icon;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const disabled = !option.available;
  const title = t(option.titleKey);

  return (
    <Pressable
      onPress={() => onSelect(option.type)}
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
        width={sizes.button.md}
        height={sizes.button.md}
        borderRadius="md"
        bg={disabled ? colors.surface.elevated : colors.interactive.soft}
        align="center"
        justify="center"
      >
        <Icon
          size={sizes.icon.md}
          color={disabled ? colors.icon.disabled : colors.interactive.main}
        />
      </Box>
      <Box flex={1} gap="xs">
        <Box row align="center" gap="sm">
          <Text variant="bodyMedium" color={disabled ? colors.text.secondary : colors.text.primary}>
            {title}
          </Text>
          {disabled ? (
            <Box px="sm" py="xs" borderRadius="full" bg={colors.status.neutral.soft}>
              <Text variant="caption" color={colors.status.neutral.text}>
                {t('auth.accountType.comingSoon')}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t(option.subtitleKey)}
        </Text>
      </Box>
      {disabled ? null : <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />}
    </Pressable>
  );
});

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

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Box gap="lg" px="2xl" pb="2xl">
        <Text variant="h4" align="center">
          {t('auth.accountType.title')}
        </Text>
        {OPTIONS.map(option => (
          <AccountTypeOption key={option.type} option={option} onSelect={onSelect} />
        ))}
      </Box>
    </BottomSheet>
  );
};
