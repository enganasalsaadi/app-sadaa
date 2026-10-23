import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCheck, Gift, Info, Lock, LockOpen, Package, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, ProgressBar, StatusPill, Text } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { Deal, DealRole } from '../types';
import { DealReturnBrandBody } from './DealReturnBrandBody';
import { ReturnLine, ReturnNote, ReturnPhotos, ReturnWaybill, useReturnDate } from './DealReturnParts';
import { ReturnRoute, type ReturnRouteMode } from './ReturnRoute';

const NOTCH = moderateScale(18);

export interface DealReturnCardProps {
  deal: Deal;
  role: DealRole;
  ret: DealReturnModel;
  /** The brand's answers; only read for `role` brand. */
  answer: DealReturnAnswerModel;
}

const routeMode = (key: string | null, moving: boolean): ReturnRouteMode => {
  if (moving) return 'moving';
  switch (key) {
    case 'awaiting_waybill':
      return 'waiting';
    case 'received':
      return 'arrived';
    case 'waived':
      return 'kept';
    default:
      return 'problem';
  }
};

/**
 * The return ticket (PC9.0 frames 1 · 5, both roles): a coloured head — the server's status as the
 * title and the sample's road back — a perforation, and what this side needs now. Creator: the
 * clock and the way to enter the waybill while it is owed; the waybill, the brand's silence clock
 * and the open lock once it is on its way; the facts and a closing line when done or let go; the
 * brand's note and photos, read-only, after a reported problem. Brand: `DealReturnBrandBody`.
 */
const DealReturnCardComponent: React.FC<DealReturnCardProps> = ({ deal, role, ret, answer }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const date = useReturnDate();
  const { ship, view } = ret;
  const hue = resolveHue(colors, view?.tone ?? 'neutral');
  const styles = useStyles(
    ({ radii, spacing }): Record<'card' | 'head' | 'perf' | 'notchStart' | 'notchEnd' | 'dash', ViewStyle> => ({
      card: { overflow: 'hidden', borderRadius: radii.xl, backgroundColor: colors.surface.main },
      head: { padding: spacing.lg, gap: spacing.md, backgroundColor: hue.soft },
      perf: { height: NOTCH, justifyContent: 'center' },
      dash: {
        marginHorizontal: NOTCH,
        borderTopWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
      },
      notchStart: {
        position: 'absolute',
        start: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: colors.layout.base,
      },
      notchEnd: {
        position: 'absolute',
        end: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.border.strong, colors.layout.base, colors.surface.main, hue.soft],
  );
  if (!ship || !view) return null;

  const key = ship.status.key;
  const brand = role === 'brand';
  const party = isolateText((brand ? deal.creator.name : deal.brand.name) ?? '');
  const waybill = <ReturnWaybill ship={ship} onCopyTracking={ret.copyTracking} onCopyLink={ret.copyLink} />;

  const creatorBody = (() => {
    if (key === 'awaiting_waybill') {
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
          <ReturnLine
            icon={view.late ? TriangleAlert : Lock}
            tone={view.late ? 'danger' : 'warning'}
            text={t(view.late ? 'marketplace.deals.return.card.lockLate' : 'marketplace.deals.return.card.lockOwed')}
          />
          <CustomButton
            title={t('marketplace.deals.return.card.enter')}
            size="lg"
            fullWidth
            leftIcon={<Package />}
            onPress={ret.open}
          />
        </>
      );
    }
    if (key === 'shipped') {
      return (
        <>
          {waybill}
          {ret.autoConfirm ? (
            <ProgressBar
              value={ret.autoConfirm.share}
              tone="interactive"
              accessibilityLabel={t('marketplace.deals.return.card.autoLabel')}
              label={t('marketplace.deals.return.card.autoLabel')}
              valueLabel={ret.autoConfirm.text}
            />
          ) : null}
          {ret.autoConfirm ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.return.card.autoBy', { date: date(ret.autoConfirm.at) })}
            </Text>
          ) : null}
          <ReturnLine icon={LockOpen} tone="success" text={t('marketplace.deals.return.card.unlocked')} />
          <CustomButton
            title={t('marketplace.deals.return.card.edit')}
            variant="outline"
            size="md"
            fullWidth
            onPress={ret.open}
          />
        </>
      );
    }
    if (key === 'received') {
      return (
        <>
          {waybill}
          <ReturnLine
            icon={CheckCheck}
            tone="success"
            text={t(
              ship.autoReceived
                ? 'marketplace.deals.return.card.autoReceived'
                : 'marketplace.deals.return.card.received',
              { date: date(ship.receivedAt) },
            )}
          />
        </>
      );
    }
    if (key === 'issue_reported') {
      return (
        <>
          {ship.issue ? (
            <ReturnNote
              label={t('marketplace.deals.return.card.noteLabel', { date: date(ship.issue.reportedAt) })}
              text={ship.issue.note}
            />
          ) : null}
          <ReturnPhotos ship={ship} role={role} dealId={deal.id} />
          <ReturnLine icon={ShieldCheck} tone="warning" text={t('marketplace.deals.return.card.issueLine')} />
        </>
      );
    }
    if (key === 'waived') {
      return (
        <>
          {ship.waiveNote ? (
            <ReturnNote
              label={t('marketplace.deals.return.card.waiveLabel', { date: date(ship.waivedAt) })}
              text={ship.waiveNote}
            />
          ) : null}
          <ReturnLine icon={Gift} tone="neutral" text={t('marketplace.deals.return.card.waivedLine')} />
        </>
      );
    }
    // A status this build doesn't know: the title says it, the waybill (if any) is still the creator's.
    return ship.trackingNo || ship.courier ? waybill : <ReturnLine icon={Info} tone="neutral" text={ship.status.label} />;
  })();

  return (
    <Box style={styles.card} accessible={false}>
      <Box style={styles.head}>
        <Box row align="center" justify="space-between" gap="md">
          <StatusPill label={ship.status.label} tone={view.tone} />
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t(brand ? 'marketplace.deals.return.card.from' : 'marketplace.deals.return.card.to', { name: party })}
          </Text>
        </Box>
        <ReturnRoute
          mode={routeMode(key, view.moving)}
          tone={view.tone}
          progress={view.progress}
          fromLabel={t(brand ? 'marketplace.deals.return.card.creator' : 'marketplace.deals.return.card.you')}
          toLabel={t(brand ? 'marketplace.deals.return.card.you' : 'marketplace.deals.return.card.brand')}
        />
      </Box>
      <Box style={styles.perf}>
        <Box style={styles.dash} />
        <Box style={styles.notchStart} />
        <Box style={styles.notchEnd} />
      </Box>
      <Box px="lg" pb="lg" gap="md">
        {brand ? <DealReturnBrandBody deal={deal} ret={ret} answer={answer} /> : creatorBody}
      </Box>
    </Box>
  );
};

export const DealReturnCard = memo(DealReturnCardComponent);
