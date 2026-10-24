import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, Gift, Hourglass, Info, PackageCheck, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, ProgressBar, Text } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { Deal } from '../types';
import { DealHoldNote } from './DealHoldNote';
import { ReturnLine, ReturnNote, ReturnPhotos, ReturnWaybill, useReturnDate } from './DealReturnParts';

export interface DealReturnBrandBodyProps {
  deal: Deal;
  ret: DealReturnModel;
  answer: DealReturnAnswerModel;
}

/**
 * What the brand sees under the return ticket's head (PC9.0 frames 2 · 3). Owed: the creator's
 * clock and the way to let the sample go. On its way: the waybill, the brand's own silence clock
 * (14 days, then receipt confirms itself) and the three answers — confirm (the one big button),
 * report a problem, waive. Closed: the facts and a closing line; the brand's own report or reason
 * is shown back to it.
 */
const DealReturnBrandBodyComponent: React.FC<DealReturnBrandBodyProps> = ({ deal, ret, answer }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const date = useReturnDate();
  const { ship, view } = ret;
  if (!ship || !view) return null;
  const creator = isolateText(deal.creator.name ?? '');
  const waybill = <ReturnWaybill ship={ship} onCopyTracking={ret.copyTracking} onCopyLink={ret.copyLink} />;

  switch (ship.status.key) {
    case 'awaiting_waybill':
      return (
        <>
          {ret.due ? (
            <ProgressBar
              value={view.dueShare}
              tone={view.late ? 'danger' : 'warning'}
              accessibilityLabel={t('marketplace.deals.return.card.dueA11y')}
              label={view.late ? t('marketplace.deals.return.card.lateLabel') : t('marketplace.deals.return.card.dueLabel')}
              valueLabel={ret.due.text}
            />
          ) : null}
          {ret.due ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {t(view.late ? 'marketplace.deals.return.card.wasDue' : 'marketplace.deals.return.card.dueBy', {
                date: date(ret.due.at, true),
              })}
            </Text>
          ) : null}
          {ret.onHold ? <DealHoldNote /> : null}
          <ReturnLine
            icon={view.late ? TriangleAlert : Hourglass}
            tone={view.late ? 'danger' : 'warning'}
            text={t(view.late ? 'marketplace.deals.return.brand.late' : 'marketplace.deals.return.brand.waiting', {
              name: creator,
            })}
          />
          {answer.allowed.waive ? (
            <CustomButton
              title={t('marketplace.deals.return.brand.waive')}
              variant="outline"
              size="md"
              fullWidth
              onPress={answer.opens.waive}
            />
          ) : null}
        </>
      );
    case 'shipped':
      return (
        <>
          {waybill}
          {ret.autoConfirm ? (
            <ProgressBar
              value={ret.autoConfirm.share}
              tone="interactive"
              accessibilityLabel={t('marketplace.deals.return.brand.autoLabel')}
              label={t('marketplace.deals.return.brand.autoLabel')}
              valueLabel={ret.autoConfirm.text}
            />
          ) : null}
          {ret.autoConfirm ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.return.brand.autoBy', { date: date(ret.autoConfirm.at) })}
            </Text>
          ) : null}
          {answer.allowed.receive ? (
            <CustomButton
              title={t('marketplace.deals.return.brand.receive')}
              size="lg"
              fullWidth
              leftIcon={<PackageCheck />}
              onPress={answer.opens.receive}
            />
          ) : null}
          <Box row gap="sm">
            {answer.allowed.issue ? (
              <Box flex={1}>
                <CustomButton
                  title={t('marketplace.deals.return.brand.issue')}
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={answer.opens.issue}
                />
              </Box>
            ) : null}
            {answer.allowed.waive ? (
              <Box flex={1}>
                <CustomButton
                  title={t('marketplace.deals.return.brand.waiveShort')}
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={answer.opens.waive}
                />
              </Box>
            ) : null}
          </Box>
        </>
      );
    case 'received':
      return (
        <>
          {waybill}
          <ReturnLine
            icon={CheckCheck}
            tone="success"
            text={t(
              ship.autoReceived
                ? 'marketplace.deals.return.brand.autoReceived'
                : 'marketplace.deals.return.brand.received',
              { date: date(ship.receivedAt) },
            )}
          />
        </>
      );
    case 'issue_reported':
      return (
        <>
          {ship.issue ? (
            <ReturnNote
              label={t('marketplace.deals.return.brand.noteLabel', { date: date(ship.issue.reportedAt) })}
              text={ship.issue.note}
            />
          ) : null}
          <ReturnPhotos ship={ship} role="brand" dealId={deal.id} />
          <ReturnLine icon={ShieldCheck} tone="warning" text={t('marketplace.deals.return.brand.issueLine')} />
        </>
      );
    case 'waived':
      return (
        <>
          {ship.waiveNote ? (
            <ReturnNote
              label={t('marketplace.deals.return.brand.waiveLabel', { date: date(ship.waivedAt) })}
              text={ship.waiveNote}
            />
          ) : null}
          <ReturnLine icon={Gift} tone="neutral" text={t('marketplace.deals.return.brand.waivedLine', { name: creator })} />
        </>
      );
    default:
      // A status this build doesn't know: the title says it, the waybill (if any) is still shown.
      return ship.trackingNo || ship.courier ? (
        waybill
      ) : (
        <ReturnLine icon={Info} tone="neutral" text={ship.status.label} />
      );
  }
};

export const DealReturnBrandBody = memo(DealReturnBrandBodyComponent);
