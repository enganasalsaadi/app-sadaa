import React, { memo } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, IconButton, MoneyText, Pressable, Skeleton, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const NO_VALUE = '—';
const SKELETON_BALANCE = '55%';

type Hero = BrandHomeScreenModel['hero'];

interface HeroWalletCardProps {
  hero: Hero;
  hidden: boolean;
  compact: boolean;
  onToggleHidden: () => void;
  onOpenWallet: () => void;
}

const Balance = memo<{ hero: Hero; hidden: boolean; compact: boolean }>(
  ({ hero, hidden, compact }) => {
    const { colors, typography } = useTheme();
    const variant = compact ? 'amountTitle' : 'amountLarge';
    if (hero.wallet) {
      return (
        <Box gap="xs">
          <MoneyText
            value={hero.wallet.available}
            size={compact ? 'title' : 'lg'}
            tone="onBrand"
            splitFraction
            rounding="down"
            animated
            hidden={hidden}
          />
          {/* Never a second masked line: hidden means one mask, not two. */}
          {hero.wallet.availableSypApprox && !hidden && !compact ? (
            <MoneyText value={hero.wallet.availableSypApprox} size="sm" tone="onBrand" estimate />
          ) : null}
        </Box>
      );
    }
    return hero.status === 'error' ? (
      <Text variant={variant} color={colors.text.onBrand}>
        {NO_VALUE}
      </Text>
    ) : (
      <Skeleton
        width={SKELETON_BALANCE}
        height={typography[variant].lineHeight}
        borderRadius="md"
        surface="brand"
      />
    );
  },
);

/**
 * Glass wallet strip in the hero: available balance (rolls up once) with ≈ SYP under it,
 * opening the wallet tab. The eye beside it is a separate button, so screen readers reach
 * both; it pops in on every flip and shares the wallet tab's remembered choice.
 */
const HeroWalletCardComponent: React.FC<HeroWalletCardProps> = ({
  hero,
  hidden,
  compact,
  onToggleHidden,
  onOpenWallet,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box
      row
      align="center"
      gap="sm"
      ps="lg"
      pe="sm"
      py={compact ? 'sm' : 'md'}
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.fill}
    >
      <Pressable
        flex={1}
        gap="xs"
        onPress={onOpenWallet}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.wallet.open')}
      >
        {compact ? null : (
          <Box row align="center" gap="sm">
            <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.glass.iconMoney} />
            <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
              {t('finance.wallet.available')}
            </Text>
          </Box>
        )}
        <Balance hero={hero} hidden={hidden} compact={compact} />
      </Pressable>
      <Animated.View key={hidden ? 'hidden' : 'shown'} entering={ZoomIn.duration(motion.duration.base)}>
        <IconButton
          icon={hidden ? EyeOff : Eye}
          variant="soft"
          tone="onBrand"
          onPress={onToggleHidden}
          accessibilityLabel={t(hidden ? 'finance.wallet.showAmounts' : 'finance.wallet.hideAmounts')}
        />
      </Animated.View>
    </Box>
  );
};

export const HeroWalletCard = memo(HeroWalletCardComponent);
