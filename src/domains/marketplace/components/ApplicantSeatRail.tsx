import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Wallet } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import { APPLICANT_MAX_SEAT_SOCKETS } from '../constants/applicants';
import type { SeatFace } from '../utils/applicants';
import { ApplicantFace } from './ApplicantFace';
import { SeatPips } from './SeatPips';

const SOCKET = moderateScale(42);

export interface ApplicantSeatRailProps {
  total: number;
  occupied: number;
  faces: readonly SeatFace[];
  /** The brand's wallet balance (from the recruiting summary); the pill opens the wallet. */
  balance: Money | null;
  onWallet: () => void;
}

/**
 * The table's seats: a circle per seat that fills with the chosen creator's face (dashed + while
 * free), what is left, and the wallet that pays for the next pick. Past a handful of seats the
 * circles become the campaign's usual pips.
 */
const ApplicantSeatRailComponent: React.FC<ApplicantSeatRailProps> = ({ total, occupied, faces, balance, onWallet }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'socket' | 'free' | 'taken', ViewStyle> => ({
      socket: { width: SOCKET, height: SOCKET, borderRadius: SOCKET / 2, alignItems: 'center', justifyContent: 'center' },
      free: { borderWidth: borderWidths.md, borderStyle: 'dashed', borderColor: colors.border.strong },
      taken: { borderWidth: borderWidths.lg, borderColor: colors.interactive.main, overflow: 'hidden' },
    }),
    [colors.border.strong, colors.interactive.main],
  );
  const free = Math.max(0, total - occupied);
  const sockets = useMemo(() => Array.from({ length: total }, (_, index) => faces[index] ?? null), [faces, total]);
  const label = t('marketplace.campaign.applicants.seatRail.a11y', { occupied, total });

  return (
    <Box row align="center" gap="md" px="xl" pt="sm" accessible accessibilityLabel={label}>
      {total > APPLICANT_MAX_SEAT_SOCKETS ? (
        <Box width={SOCKET * 3}>
          <SeatPips total={total} filled={occupied} />
        </Box>
      ) : (
        <Box row gap="sm">
          {sockets.map((face, index) =>
            index < occupied ? (
              <Box key={face?.id ?? `taken-${index}`} style={[styles.socket, styles.taken]}>
                {face ? <ApplicantFace name={face.name} avatarUrl={face.avatarUrl} size={SOCKET} /> : null}
              </Box>
            ) : (
              <Box key={`free-${index}`} style={[styles.socket, styles.free]}>
                <Plus size={sizes.icon.sm} color={colors.icon.secondary} strokeWidth={iconStroke.bold} />
              </Box>
            ),
          )}
        </Box>
      )}
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
          {t('marketplace.campaign.applicants.seatRail.free', { count: free })}
        </Text>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {t('marketplace.campaign.applicants.seatRail.ofTotal', { count: total })}
        </Text>
      </Box>
      {balance ? (
        <Pressable
          onPress={onWallet}
          row
          align="center"
          gap="xs"
          px="md"
          minHeight={sizes.button.md}
          borderRadius="full"
          bg={colors.money.soft}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.campaign.applicants.seatRail.wallet')}
        >
          <Wallet size={sizes.icon.xs} color={colors.money.text} strokeWidth={iconStroke.bold} />
          <MoneyText value={balance} size="sm" tone="money" rounding="down" />
        </Pressable>
      ) : null}
    </Box>
  );
};

export const ApplicantSeatRail = memo(ApplicantSeatRailComponent);
