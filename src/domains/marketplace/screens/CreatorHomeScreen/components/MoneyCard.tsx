import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import type { WalletGlance } from '@/domains/finance';
import { Box, MoneyFlow, MoneyText, Pressable, SectionHeader, Skeleton, Text } from '@/shared/ui';

const MARK = moderateScale(44);
const NODE_HEIGHT = moderateScale(34);
const SKELETON_HEIGHT = moderateScale(156);

/** One end of the escrow's road: the deals it is held on, the wallet it lands in. */
const Node = memo<{ icon: LucideIcon; label: string; money?: boolean }>(({ icon: Icon, label, money = false }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="md"
      height={NODE_HEIGHT}
      borderRadius="md"
      bg={money ? colors.money.soft : colors.surface.elevated}
    >
      <Icon size={sizes.icon.xs} color={money ? colors.money.text : colors.text.secondary} />
      <Text variant="caption" color={money ? colors.money.text : colors.text.secondary} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
});

interface MoneyCardProps {
  glance: WalletGlance;
  /** The wallet's eye (rule 09b): amounts show as a mask. */
  hidden: boolean;
  onOpenWallet: () => void;
  onOpenKyc: () => void;
}

/**
 * «Your money»: what is held for the creator on active deals and the road it takes to the wallet,
 * or a calm card while nothing is held; under it the ID nudge when a balance waits on verification.
 */
const MoneyCardComponent: React.FC<MoneyCardProps> = ({ glance, hidden, onOpenWallet, onOpenKyc }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { loaded, escrow, kycNudge, available } = glance;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const nudge =
    available && !hidden
      ? t('marketplace.creatorHome.money.kycNudge', { amount: formatMoney(available) })
      : t('marketplace.creatorHome.money.kycNudgeHidden');

  const body = !loaded ? (
    <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="xl" />
  ) : (
    <Box p="lg" gap="lg" borderRadius="xl" bg={colors.surface.main} shadow="card">
      <Pressable
        gap="md"
        onPress={onOpenWallet}
        accessibilityRole="button"
        accessibilityLabel={
          escrow && !hidden
            ? t('marketplace.creatorHome.money.a11y', { amount: formatMoney(escrow) })
            : t('marketplace.creatorHome.money.wallet')
        }
      >
        {escrow ? (
          <>
            <Box gap="xs">
              <Box row align="center" gap="xs">
                <Lock size={sizes.icon.xs} color={colors.text.secondary} />
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {t('marketplace.creatorHome.money.held')}
                </Text>
              </Box>
              <MoneyText value={escrow} size="lg" tone="money" hidden={hidden} rounding="down" animated />
            </Box>
            <Box row align="center" gap="md" importantForAccessibility="no-hide-descendants">
              <Node icon={BriefcaseBusiness} label={t('marketplace.creatorHome.money.fromDeals')} />
              <Box flex={1} overflow="hidden">
                <MoneyFlow />
              </Box>
              <Node icon={Wallet} label={t('marketplace.creatorHome.money.toWallet')} money />
            </Box>
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.creatorHome.money.caption')}
            </Text>
          </>
        ) : (
          <Box row align="center" gap="md">
            <Box width={MARK} height={MARK} borderRadius="md" bg={colors.money.soft} align="center" justify="center">
              <Lock size={sizes.icon.md} color={colors.money.text} strokeWidth={iconStroke.regular} />
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium">{t('marketplace.creatorHome.money.emptyTitle')}</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.creatorHome.money.empty')}
              </Text>
            </Box>
          </Box>
        )}
      </Pressable>
      {kycNudge ? (
        <Pressable
          row
          align="center"
          gap="md"
          p="md"
          minHeight={sizes.button.lg}
          borderRadius="lg"
          bg={colors.status.warning.soft}
          onPress={onOpenKyc}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={nudge}
        >
          <ShieldCheck size={sizes.icon.md} color={colors.status.warning.main} />
          <Box flex={1}>
            <Text variant="buttonSmall" color={colors.status.warning.text}>
              {nudge}
            </Text>
          </Box>
          <Chevron size={sizes.icon.sm} color={colors.status.warning.text} />
        </Pressable>
      ) : null}
    </Box>
  );

  return (
    <Box px="xl" gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.money.title')}
        emphasis="strong"
        action={{ label: t('marketplace.creatorHome.money.wallet'), onPress: onOpenWallet }}
      />
      {body}
    </Box>
  );
};

export const MoneyCard = memo(MoneyCardComponent);
