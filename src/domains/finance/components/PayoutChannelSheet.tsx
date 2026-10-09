import React, { memo, useCallback, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, Box, ListGroup, ListRow, Text } from '@/shared/ui';
import { channelCurrenciesKey, PAYMENT_CHANNEL_DEF, PAYMENT_GROUP_LABEL } from '../constants/paymentChannels';
import { PAYOUT_GROUP_DEF } from '../constants/payoutMethods';
import { PAYMENT_CHANNEL_GROUPS, PAYMENT_CHANNELS } from '../types';
import type { PaymentChannel } from '../types';

export interface PayoutChannelSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called once the sheet is gone, so the next screen never races its dismissal. */
  onPick: (channel: PaymentChannel) => void;
  /** Changing the channel of a new method: its row shows as the picked option. */
  selected?: PaymentChannel;
}

interface ChannelOptionProps {
  channel: PaymentChannel;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  selected: boolean | undefined;
  onChoose: (channel: PaymentChannel) => void;
}

const ChannelOption = memo<ChannelOptionProps>(({ channel, icon, title, subtitle, selected, onChoose }) => {
  const press = useCallback(() => onChoose(channel), [channel, onChoose]);
  return <ListRow icon={icon} title={title} subtitle={subtitle} onPress={press} selected={selected} />;
});

/** Where a new payout method sends money: offices, e-wallets, banks (handoff §7). */
const PayoutChannelSheetComponent: React.FC<PayoutChannelSheetProps> = ({ visible, onClose, onPick, selected }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  }));
  const picked = useRef<PaymentChannel | null>(null);

  const groups = useMemo(
    () =>
      PAYMENT_CHANNEL_GROUPS.map(group => ({
        group,
        title: t(PAYMENT_GROUP_LABEL[group]),
        rows: PAYMENT_CHANNELS.filter(channel => PAYMENT_CHANNEL_DEF[channel].group === group).map(channel => {
          const def = PAYMENT_CHANNEL_DEF[channel];
          return {
            channel,
            icon: def.icon,
            title: t(def.labelKey),
            subtitle: `${t(PAYOUT_GROUP_DEF[group].captionKey)} · ${t(channelCurrenciesKey(def.currencies))}`,
          };
        }),
      })),
    [t],
  );

  const choose = useCallback(
    (channel: PaymentChannel) => {
      picked.current = channel;
      onClose();
    },
    [onClose],
  );

  const onDismissed = useCallback(() => {
    const channel = picked.current;
    picked.current = null;
    if (channel) onPick(channel);
  }, [onPick]);

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Box gap="xs">
          <Text variant="h4" accessibilityRole="header">
            {t('finance.payouts.channelSheet.title')}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('finance.payouts.channelSheet.subtitle')}
          </Text>
        </Box>
        {groups.map(({ group, title, rows }) => (
          <ListGroup key={group} title={title}>
            {rows.map(row => (
              <ChannelOption
                key={row.channel}
                {...row}
                selected={selected ? selected === row.channel : undefined}
                onChoose={choose}
              />
            ))}
          </ListGroup>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

export const PayoutChannelSheet = memo(PayoutChannelSheetComponent);
