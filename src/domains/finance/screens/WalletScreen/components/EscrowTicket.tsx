import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Lock, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box, Image, MoneyText, StatusPill, Text } from '@/shared/ui';
import type { WalletEscrow, WalletEscrowStatus } from '../../../types';
import { MoneyRise } from './MoneyRise';

export const TICKET_WIDTH = moderateScale(262);
export const TICKET_HEIGHT = moderateScale(196);
/** Where the ticket tears: the notches and the dashed line. */
const TEAR_Y = moderateScale(118);
const NOTCH = moderateScale(12);
const AVATAR = moderateScale(44);
const TEAR_DASH = [6, 5];
const TEAR_STROKE = 2;

const ESCROW_PILL = {
  held: { tone: 'info', icon: Lock },
  disputed: { tone: 'danger', icon: TriangleAlert },
} as const satisfies Record<WalletEscrowStatus, { tone: HueTone; icon: LucideIcon }>;

interface EscrowTicketProps {
  escrow: WalletEscrow;
  /** Creator: money coming in (mint) · brand: money held for the creator (neutral). */
  incoming: boolean;
  hidden: boolean;
  /** The rail is on screen: the rising chevrons run. */
  active: boolean;
}

/**
 * One held deal as a boarding ticket: who it is with, the deal, where the deal stands (the
 * escrow status for a hold with no deal; the hold's tone either way), then —
 * past the tear — the amount with the rising chevrons and what releases it.
 */
const EscrowTicketComponent: React.FC<EscrowTicketProps> = ({ escrow, incoming, hidden, active }) => {
  const { colors, spacing } = useTheme();
  const name = escrow.counterparty?.name ?? escrow.deal_title ?? '';
  const subtitle = escrow.counterparty ? escrow.deal_title : null;
  const pill = escrow.status ? ESCROW_PILL[escrow.status] : null;

  const styles = useStyles(
    (): Record<'ticket' | 'top' | 'tear' | 'notchStart' | 'notchEnd', ViewStyle> => {
      const notch: ViewStyle = {
        position: 'absolute',
        top: TEAR_Y - NOTCH,
        width: NOTCH * 2,
        height: NOTCH * 2,
        borderRadius: NOTCH,
        backgroundColor: colors.layout.base,
      };
      return {
        ticket: { width: TICKET_WIDTH, height: TICKET_HEIGHT },
        top: { height: TEAR_Y },
        tear: { position: 'absolute', top: TEAR_Y - TEAR_STROKE / 2, start: spacing.xl, end: spacing.xl },
        notchStart: { ...notch, start: -NOTCH },
        notchEnd: { ...notch, end: -NOTCH },
      };
    },
    [colors.layout.base, spacing.xl],
  );

  return (
    <Box
      style={styles.ticket}
      bg={colors.surface.main}
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.border.card}
      shadow="card"
    >
      <Box style={styles.top} p="lg" gap="md">
        <Box row align="center" gap="md">
          {escrow.counterparty?.avatar_url ? (
            <Image uri={escrow.counterparty.avatar_url} size={AVATAR} borderRadius="md" />
          ) : (
            <Box width={AVATAR} height={AVATAR} borderRadius="md" bg={colors.brand.soft} align="center" justify="center">
              <Text variant="title" color={colors.brand.text}>
                {Array.from(name.trim())[0] ?? ''}
              </Text>
            </Box>
          )}
          <Box flex={1}>
            <Text variant="bodyMedium" numberOfLines={1}>
              {name}
            </Text>
            {subtitle ? (
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
        </Box>
        <Box alignSelf="flex-start">
          <StatusPill label={escrow.stage_label ?? escrow.status_label} tone={pill?.tone ?? 'neutral'} icon={pill?.icon} size="sm" />
        </Box>
      </Box>

      <Box style={styles.tear} pointerEvents="none">
        <Svg height={TEAR_STROKE} width="100%">
          <Line
            x1="0"
            y1={TEAR_STROKE / 2}
            x2="100%"
            y2={TEAR_STROKE / 2}
            stroke={colors.border.default}
            strokeWidth={TEAR_STROKE}
            strokeDasharray={TEAR_DASH}
          />
        </Svg>
      </Box>
      <Box style={styles.notchStart} pointerEvents="none" />
      <Box style={styles.notchEnd} pointerEvents="none" />

      <Box flex={1} px="lg" pb="lg" justify="center" gap="xs">
        <Box row align="center" justify="space-between" gap="sm">
          <MoneyText value={escrow.amount} size="title" tone={incoming ? 'money' : 'default'} hidden={hidden} />
          <MoneyRise tone={incoming ? 'money' : 'neutral'} active={active} />
        </Box>
        {escrow.release_hint ? (
          <Text variant="caption" color={colors.text.tertiary} numberOfLines={2}>
            {escrow.release_hint}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export const EscrowTicket = memo(EscrowTicketComponent);
