import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Hourglass, KeyRound, PenLine, Plus, Undo2, X, Zap } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import type { DealRespondModel } from '../hooks/useDealRespond';
import type { Deal } from '../types';
import type { RestrictionNotice } from '../utils/restrictions';
import { dealTimer } from '../utils/dealTimer';
import { DealDecisionDock, type DealDockClock } from './DealDecisionDock';
import { RestrictionDockTop } from './RestrictionDockTop';

export interface DealRespondDockProps {
  deal: Deal;
  respond: DealRespondModel;
  /** Creator: what stops them accepting a direct offer right now (PC9.1), `null` when nothing does. */
  restriction?: RestrictionNotice | null;
  /** Opens the deal that owes the waybill, or the strikes. */
  onRestriction?: () => void;
}

type TimedDock = 'creatorOffer' | 'brandOffer' | 'brandExtension';

/** What the time strip waits on, per timed dock. */
const CLOCK_LEAD = {
  creatorOffer: 'marketplace.deals.respond.dock.clock.offer',
  brandOffer: 'marketplace.deals.respond.dock.clock.waiting',
  brandExtension: 'marketplace.deals.respond.dock.clock.extension',
} as const satisfies Record<TimedDock, string>;

/**
 * The deal page's decision bar (P4) for the role and status. Positive actions are the one solid
 * button (accept and approve open the slip, where the signature is a hold); the rest step back:
 * more time / decline as halves of one outline row, withdraw as an outline with what it costs
 * (nothing yet), and a quiet link once the brand is funding. Every button is `md` to keep the bar
 * slim. Funding keeps its clock in the funding card.
 */
const DealRespondDockComponent: React.FC<DealRespondDockProps> = ({
  deal,
  respond,
  restriction = null,
  onRestriction,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'grow' | 'flip' | 'dot', ViewStyle> => ({
      // Paired buttons split the row evenly.
      grow: { flex: 1 },
      // «Undo» curls back toward the reading start.
      flip: { transform: [{ scaleX: isRTL ? -1 : 1 }] },
      dot: {
        width: sizes.control.dot,
        height: sizes.control.dot,
        borderRadius: radii.full,
        backgroundColor: colors.money.main,
      },
    }),
    [colors.money.main, isRTL, sizes.control.dot],
  );
  const { dock } = respond;
  if (!dock) return null;

  const timer = dealTimer(deal);
  const clock: DealDockClock | null =
    dock !== 'brandFunding' && timer.dueAt !== null
      ? {
          dueAt: timer.dueAt,
          windowHours: timer.windowHours,
          lead: t(CLOCK_LEAD[dock]),
        }
      : null;

  const body = (() => {
    switch (dock) {
      case 'creatorOffer':
        // A restricted creator can still say no: the accept and the extension are what the lock takes.
        if (restriction && onRestriction) {
          return (
            <>
              <RestrictionDockTop notice={restriction} scope="direct" onWhy={onRestriction} />
              {restriction.kind === 'return_pending' ? (
                <CustomButton
                  title={t('marketplace.restrictions.returnPending.dockAction')}
                  size="md"
                  fullWidth
                  leftIcon={<KeyRound />}
                  onPress={onRestriction}
                />
              ) : null}
              <CustomButton
                title={t('marketplace.deals.respond.dock.decline')}
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<X />}
                onPress={respond.opens.decline}
              />
            </>
          );
        }
        return (
          <>
            <CustomButton
              title={t('marketplace.deals.respond.dock.accept', {
                amount: formatMoney(deal.total, i18n.language),
              })}
              size="md"
              fullWidth
              leftIcon={<PenLine />}
              onPress={respond.opens.accept}
            />
            <Box row gap="sm">
              {respond.range ? (
                <CustomButton
                  title={t('marketplace.deals.respond.dock.extension')}
                  variant="outline"
                  size="md"
                  leftIcon={<Hourglass />}
                  style={styles.grow}
                  onPress={respond.opens.extension}
                />
              ) : null}
              <CustomButton
                title={t('marketplace.deals.respond.dock.decline')}
                variant="outline"
                size="md"
                leftIcon={<X />}
                style={styles.grow}
                onPress={respond.opens.decline}
              />
            </Box>
          </>
        );
      case 'brandOffer':
        return (
          <Box gap="xs">
            <CustomButton
              title={t('marketplace.deals.respond.dock.withdraw')}
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<Undo2 style={styles.flip} />}
              onPress={respond.opens.withdraw}
            />
            <Box row align="center" justify="center" gap="xs">
              <Box style={styles.dot} />
              <Text
                variant="caption"
                color={colors.text.tertiary}
                align="center"
                numberOfLines={1}
              >
                {t('marketplace.deals.respond.dock.withdrawFree')}
              </Text>
            </Box>
          </Box>
        );
      case 'brandExtension':
        return (
          <Box row gap="sm">
            <CustomButton
              title={t('marketplace.deals.respond.dock.reject')}
              variant="outline"
              size="md"
              style={styles.grow}
              onPress={respond.opens.rejectExtension}
            />
            <CustomButton
              title={t('marketplace.deals.respond.dock.approve')}
              size="md"
              leftIcon={<PenLine />}
              style={styles.grow}
              onPress={respond.opens.approveExtension}
            />
          </Box>
        );
      case 'brandFunding': {
        const missing = respond.funding?.missing ?? null;
        const topUp =
          respond.fundingState === 'short' &&
          respond.canTopUp &&
          missing !== null;
        return (
          <>
            {respond.fundingState === 'frozen' ? (
              <CustomButton
                title={t('marketplace.deals.respond.dock.support')}
                size="md"
                fullWidth
                onPress={respond.onSupport}
              />
            ) : topUp ? (
              <Box row gap="sm">
                <CustomButton
                  title={t('marketplace.deals.respond.dock.topUp', {
                    amount: formatMoney(missing, i18n.language),
                  })}
                  size="md"
                  leftIcon={<Plus />}
                  style={styles.grow}
                  onPress={respond.onTopUp}
                />
                <CustomButton
                  title={t('marketplace.deals.respond.dock.fundShort')}
                  variant="outline"
                  size="md"
                  leftIcon={<Zap />}
                  loading={respond.isFunding}
                  onPress={respond.onFund}
                />
              </Box>
            ) : (
              <CustomButton
                title={t('marketplace.deals.respond.dock.fund')}
                size="md"
                fullWidth
                leftIcon={<Zap />}
                loading={respond.isFunding}
                onPress={respond.onFund}
              />
            )}
            <CustomButton
              title={t('marketplace.deals.respond.dock.withdraw')}
              variant="ghost"
              size="sm"
              fullWidth
              onPress={respond.opens.withdraw}
            />
          </>
        );
      }
      default: {
        const _exhaustive: never = dock;
        return _exhaustive;
      }
    }
  })();

  return <DealDecisionDock clock={clock}>{body}</DealDecisionDock>;
};

export const DealRespondDock = memo(DealRespondDockComponent);
