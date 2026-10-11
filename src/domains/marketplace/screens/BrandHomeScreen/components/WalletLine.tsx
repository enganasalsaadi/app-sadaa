import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Skeleton, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const NO_VALUE = '—';
const SKELETON_WIDTH = moderateScale(140);

interface WalletLineProps {
  hero: BrandHomeScreenModel['hero'];
  hidden: boolean;
  onOpenWallet: () => void;
  onTopUp: () => void;
}

/**
 * Money as one quiet line under the greeting: mint dot, balance, "available in your wallet"
 * (opens the wallet tab) and a "Top up" link when `/me` allows it. Honours the wallet's eye.
 */
const WalletLineComponent: React.FC<WalletLineProps> = ({ hero, hidden, onOpenWallet, onTopUp }) => {
  const { t } = useTranslation();
  const { colors, sizes, typography } = useTheme();

  return (
    <Box row align="center" gap="md" px="xl">
      <Pressable
        flex={1}
        row
        align="center"
        gap="sm"
        minHeight={sizes.button.md}
        onPress={onOpenWallet}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.wallet.open')}
      >
        <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.money.main} />
        {hero.wallet ? (
          <MoneyText value={hero.wallet.available} size="md" rounding="down" hidden={hidden} />
        ) : hero.status === 'error' ? (
          <Text variant="amount">{NO_VALUE}</Text>
        ) : (
          <Skeleton width={SKELETON_WIDTH} height={typography.amount.lineHeight} borderRadius="xs" />
        )}
        {hero.wallet ? (
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
              {t('marketplace.brandHome.walletLine.available')}
            </Text>
          </Box>
        ) : null}
      </Pressable>
      {hero.canTopUp ? (
        <Pressable
          minHeight={sizes.button.md}
          justify="center"
          onPress={onTopUp}
          hitSlop={sizes.hitSlop.sm}
          accessibilityRole="button"
          accessibilityLabel={t('finance.wallet.deposit')}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.brandHome.walletLine.topUp')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const WalletLine = memo(WalletLineComponent);
