import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import type { WalletGlance } from '@/domains/finance';
import { Box, MoneyText, Notice, Pressable, Text } from '@/shared/ui';

const MARK = moderateScale(40);

interface EscrowLineProps {
  glance: WalletGlance;
  /** The wallet's eye (rule 09b): amounts show as a mask. */
  hidden: boolean;
  onOpenWallet: () => void;
  onOpenKyc: () => void;
}

/**
 * Money held for the creator on active deals, one tap from the wallet, and a KYC nudge when
 * there is a balance to withdraw but no verified ID. Each shows only when it applies.
 */
const EscrowLineComponent: React.FC<EscrowLineProps> = ({ glance, hidden, onOpenWallet, onOpenKyc }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { escrow, kycNudge } = glance;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Box gap="md" px="xl">
      {escrow ? (
        <Pressable
          onPress={onOpenWallet}
          row
          align="center"
          gap="md"
          p="md"
          borderRadius="xl"
          bg={colors.surface.main}
          shadow="card"
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.escrow.label')}
        >
          <Box
            width={MARK}
            height={MARK}
            borderRadius="full"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <Lock size={sizes.icon.md} color={colors.interactive.text} strokeWidth={iconStroke.regular} />
          </Box>
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
              {t('marketplace.creatorHome.escrow.label')}
            </Text>
            <MoneyText value={escrow} size="title" hidden={hidden} rounding="down" />
          </Box>
          <Chevron size={sizes.icon.md} color={colors.text.tertiary} />
        </Pressable>
      ) : null}
      {kycNudge ? (
        <Notice
          tone="warning"
          title={t('finance.wallet.blocker.kycRequired.titleCreator')}
          message={t('finance.wallet.blocker.kycRequired.message')}
          action={{ label: t('marketplace.creatorHome.escrow.kycAction'), onPress: onOpenKyc }}
        />
      ) : null}
    </Box>
  );
};

export const EscrowLine = memo(EscrowLineComponent);
