import React, { memo } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Plus, type LucideIcon } from 'lucide-react-native';
import { iconStroke, moderateScale, motion, useTheme } from '@/core/theme';
import { Box, GradientSurface, MoneyText, Pressable, Skeleton, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const NO_VALUE = '—';
const SKELETON_BALANCE_WIDTH = moderateScale(96);

type Hero = BrandHomeScreenModel['hero'];

interface WalletStripProps {
  hero: Hero;
  hidden: boolean;
  onToggleHidden: () => void;
  onOpenWallet: () => void;
  onTopUp: () => void;
}

const Balance = memo<{ hero: Hero; hidden: boolean }>(({ hero, hidden }) => {
  const { colors, typography } = useTheme();
  if (hero.wallet) {
    return (
      <MoneyText
        value={hero.wallet.available}
        size="title"
        tone="onBrand"
        splitFraction
        rounding="down"
        animated
        hidden={hidden}
      />
    );
  }
  return hero.status === 'error' ? (
    <Text variant="title" color={colors.text.onBrand}>
      {NO_VALUE}
    </Text>
  ) : (
    <Skeleton
      width={SKELETON_BALANCE_WIDTH}
      height={typography.title.lineHeight}
      borderRadius="xs"
      surface="brand"
    />
  );
});

/** Round 36pt button on the strip; the hit slop brings it to 44pt. */
const PillButton = memo<{
  icon: LucideIcon;
  filled: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}>(({ icon: Icon, filled, onPress, accessibilityLabel }) => {
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      width={sizes.iconButton.sm}
      height={sizes.iconButton.sm}
      borderRadius="full"
      align="center"
      justify="center"
      bg={filled ? colors.button.onBrand.bg : colors.layout.transparent}
      hitSlop={sizes.hitSlop.sm}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon
        size={sizes.icon.sm}
        color={filled ? colors.button.onBrand.text : colors.text.onBrand}
        strokeWidth={filled ? iconStroke.bold : iconStroke.regular}
      />
    </Pressable>
  );
});

/**
 * Wallet between the Home rails (discover home, rule 09): the body's one navy highlight card.
 * Balance with its mint dot opens the wallet tab; the eye (pops in on every flip, shared with
 * the wallet tab) and ＋ for a top-up when `/me` allows it. Three buttons, so screen readers
 * reach each one. Kept slim: money never outweighs the creators on this screen.
 */
const WalletStripComponent: React.FC<WalletStripProps> = ({
  hero,
  hidden,
  onToggleHidden,
  onOpenWallet,
  onTopUp,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <GradientSurface variant="brand" row align="center" gap="sm" px="lg" py="md" borderRadius="lg" overflow="hidden">
      <Pressable
        flex={1}
        gap="xs"
        onPress={onOpenWallet}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.wallet.open')}
      >
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {t('finance.wallet.available')}
        </Text>
        <Box row align="center" gap="sm">
          <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.glass.iconMoney} />
          <Balance hero={hero} hidden={hidden} />
        </Box>
      </Pressable>
      <Animated.View key={hidden ? 'hidden' : 'shown'} entering={ZoomIn.duration(motion.duration.base)}>
        <PillButton
          icon={hidden ? EyeOff : Eye}
          filled={false}
          onPress={onToggleHidden}
          accessibilityLabel={t(hidden ? 'finance.wallet.showAmounts' : 'finance.wallet.hideAmounts')}
        />
      </Animated.View>
      {hero.canTopUp ? (
        <PillButton
          icon={Plus}
          filled
          onPress={onTopUp}
          accessibilityLabel={t('finance.wallet.deposit')}
        />
      ) : null}
    </GradientSurface>
  );
};

export const WalletStrip = memo(WalletStripComponent);
