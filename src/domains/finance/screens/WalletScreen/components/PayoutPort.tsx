import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, RefreshCw, WalletCards, type LucideIcon } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Skeleton, Text } from '@/shared/ui';
import type { WalletPayouts } from '../hooks/useWalletPayouts';

const PORT_HEIGHT = moderateScale(72);
const PORT_ICON = moderateScale(52);

interface PortProps {
  icon: LucideIcon;
  caption: string;
  title: string;
  action?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

const Port = memo<PortProps>(({ icon: Icon, caption, title, action, onPress, accessibilityLabel }) => {
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      row
      align="center"
      gap="md"
      ps="sm"
      pe="xl"
      minHeight={PORT_HEIGHT}
      borderRadius="full"
      bg={colors.surface.main}
      borderWidth="thin"
      borderColor={colors.border.card}
      shadow="card"
      onPress={onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Box width={PORT_ICON} height={PORT_ICON} borderRadius="full" bg={colors.interactive.soft} align="center" justify="center">
        <Icon size={sizes.icon.md} color={colors.interactive.main} />
      </Box>
      <Box flex={1}>
        <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
          {caption}
        </Text>
        <Text variant="bodyMedium" numberOfLines={1}>
          {title}
        </Text>
      </Box>
      <Box row align="center" gap="xs">
        {action ? (
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {action}
          </Text>
        ) : null}
        <Chevron size={sizes.icon.sm} color={colors.interactive.main} />
      </Box>
    </Pressable>
  );
});

/** Creator only: where withdrawals land, as one docking pill (primary method + "Manage"), or an add nudge. */
const PayoutPortComponent: React.FC<{ payouts: WalletPayouts }> = ({ payouts }) => {
  const { t } = useTranslation();

  if (payouts.isLoading) return <Skeleton width="100%" height={PORT_HEIGHT} borderRadius="full" />;

  if (payouts.isError) {
    const title = t('finance.payouts.walletCard.loadFailed');
    return (
      <Port
        icon={RefreshCw}
        caption={t('finance.payouts.walletCard.retry')}
        title={title}
        onPress={payouts.retry}
        accessibilityLabel={title}
      />
    );
  }

  if (!payouts.primary) {
    const title = t('finance.payouts.walletCard.addTitle');
    return (
      <Port
        icon={WalletCards}
        caption={t('finance.payouts.walletCard.addMessage')}
        title={title}
        onPress={payouts.openManage}
        accessibilityLabel={title}
      />
    );
  }

  const { primary } = payouts;
  const caption = t('finance.payouts.walletCard.sendsTo');
  const title = primary.meta ? `${primary.title} · ${primary.meta}` : primary.title;
  return (
    <Port
      icon={primary.icon}
      caption={caption}
      title={title}
      action={t('finance.payouts.walletCard.manage')}
      onPress={payouts.openManage}
      accessibilityLabel={`${caption} ${title}`}
    />
  );
};

export const PayoutPort = memo(PayoutPortComponent);
