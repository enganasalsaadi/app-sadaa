import React, { memo, useCallback, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, Gift, Info, Lock, LockOpen, Package, ShieldCheck, TriangleAlert, CheckCheck } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  CustomButton,
  GalleryModal,
  IconButton,
  Image,
  Pressable,
  ProgressBar,
  StatusPill,
  Text,
} from '@/shared/ui';
import { isolateLtr, isolateText } from '@/shared/utils';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { Deal } from '../types';
import { ReturnRoute, type ReturnRouteMode } from './ReturnRoute';

const NOTCH = moderateScale(18);
const THUMB = moderateScale(64);
const WHEN: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
const WHEN_TIME: Intl.DateTimeFormatOptions = { ...WHEN, hour: 'numeric', minute: '2-digit' };

export interface DealReturnCardProps {
  deal: Deal;
  ret: DealReturnModel;
}

/** A label over a value, the two halves of one detail row. */
const Fact = memo<{ label: string; value: string; mono?: boolean; onCopy?: () => void; copyLabel?: string }>(
  ({ label, value, mono = false, onCopy, copyLabel }) => {
    const { colors } = useTheme();
    return (
      <Box flex={1} gap="xs">
        <Text variant="caption" color={colors.text.tertiary}>
          {label}
        </Text>
        <Box row align="center" gap="xs">
          <Box flex={1}>
            <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
              {mono ? isolateLtr(value) : value}
            </Text>
          </Box>
          {onCopy && copyLabel ? (
            <IconButton icon={Copy} size="sm" variant="ghost" accessibilityLabel={copyLabel} onPress={onCopy} />
          ) : null}
        </Box>
      </Box>
    );
  },
);

/** One sentence with its icon, tinted by what it tells the creator. */
const Line = memo<{ icon: typeof Lock; tone: 'warning' | 'danger' | 'interactive' | 'success' | 'neutral'; text: string }>(
  ({ icon: Icon, tone, text }) => {
    const { colors, sizes } = useTheme();
    const hue = resolveHue(colors, tone);
    return (
      <Box row align="flex-start" gap="sm" p="md" borderRadius="md" bg={hue.soft}>
        <Icon size={sizes.icon.sm} color={hue.main} strokeWidth={iconStroke.bold} />
        <Box flex={1}>
          <Text variant="bodySmall" color={hue.text}>
            {text}
          </Text>
        </Box>
      </Box>
    );
  },
);

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
 * The creator's return ticket (PC9.0 frames 1 · 5): a ticket with a coloured head — the server's
 * status as the title and the sample's road back — a perforation, and what the creator needs now.
 * Owed: the clock, what stays locked and the way to enter the waybill. On its way: the waybill on
 * file, the brand's silence clock and the open lock. Done or let go: the facts and a closing line.
 * A reported problem shows the brand's note and photos, read-only.
 */
const DealReturnCardComponent: React.FC<DealReturnCardProps> = ({ deal, ret }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { ship, view } = ret;
  const [photo, setPhoto] = useState<number | null>(null);
  const closePhoto = useCallback(() => setPhoto(null), []);
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
  const brand = isolateText(deal.brand.name ?? '');
  const date = (at: number | null, withTime = false) =>
    at === null ? '' : formatDate(at, withTime ? WHEN_TIME : WHEN, i18n.language);
  const urls = (ship.issue?.photos ?? []).flatMap(item => (item.url ? [item.url] : []));

  const waybill =
    ship.trackingNo || ship.courier ? (
      <>
        <Box row gap="lg">
          <Fact label={t('marketplace.deals.return.card.courier')} value={ship.courier ?? '—'} />
          <Fact
            label={t('marketplace.deals.return.card.trackingNo')}
            value={ship.trackingNo ?? '—'}
            mono
            onCopy={ship.trackingNo ? ret.copyTracking : undefined}
            copyLabel={t('marketplace.deals.return.card.copyTrackingNo')}
          />
        </Box>
        {ship.handedAt !== null || ship.trackingUrl ? (
          <Box row gap="lg">
            {ship.handedAt !== null ? (
              <Fact label={t('marketplace.deals.return.card.handed')} value={date(ship.handedAt)} />
            ) : (
              <Box flex={1} />
            )}
            {ship.trackingUrl ? (
              <Fact
                label={t('marketplace.deals.return.card.link')}
                value={ship.trackingUrl.replace(/^https:\/\//, '')}
                mono
                onCopy={ret.copyLink}
                copyLabel={t('marketplace.deals.return.card.copyLink')}
              />
            ) : (
              <Box flex={1} />
            )}
          </Box>
        ) : null}
      </>
    ) : null;

  const body = (() => {
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
          <Line
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
          <Line icon={LockOpen} tone="success" text={t('marketplace.deals.return.card.unlocked')} />
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
          <Line
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
            <Box gap="sm" p="md" borderRadius="md" bg={colors.surface.elevated}>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.return.card.noteLabel', { date: date(ship.issue.reportedAt) })}
              </Text>
              <Text variant="bodySmall" color={colors.text.primary}>
                {ship.issue.note}
              </Text>
            </Box>
          ) : null}
          {urls.length > 0 ? (
            <Box row gap="sm" wrap>
              {urls.map((url, at) => (
                <Pressable
                  key={url}
                  scaleOnPress
                  onPress={() => setPhoto(at)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('marketplace.deals.return.card.photoA11y', { number: at + 1 })}
                >
                  <Image uri={url} width={THUMB} height={THUMB} borderRadius="md" resizeMode="cover" />
                </Pressable>
              ))}
            </Box>
          ) : null}
          <Line icon={ShieldCheck} tone="warning" text={t('marketplace.deals.return.card.issueLine')} />
        </>
      );
    }
    if (key === 'waived') {
      return (
        <>
          {ship.waiveNote ? (
            <Box gap="sm" p="md" borderRadius="md" bg={colors.surface.elevated}>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.return.card.waiveLabel', { date: date(ship.waivedAt) })}
              </Text>
              <Text variant="bodySmall" color={colors.text.primary}>
                {ship.waiveNote}
              </Text>
            </Box>
          ) : null}
          <Line icon={Gift} tone="neutral" text={t('marketplace.deals.return.card.waivedLine')} />
        </>
      );
    }
    // A status this build doesn't know: the title says it, the waybill (if any) is still the creator's.
    return waybill ?? <Line icon={Info} tone="neutral" text={ship.status.label} />;
  })();

  return (
    <Box style={styles.card} accessible={false}>
      <Box style={styles.head}>
        <Box row align="center" justify="space-between" gap="md">
          <StatusPill label={ship.status.label} tone={view.tone} />
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t('marketplace.deals.return.card.to', { name: brand })}
          </Text>
        </Box>
        <ReturnRoute
          mode={routeMode(key, view.moving)}
          tone={view.tone}
          progress={view.progress}
          fromLabel={t('marketplace.deals.return.card.you')}
          toLabel={t('marketplace.deals.return.card.brand')}
        />
      </Box>
      <Box style={styles.perf}>
        <Box style={styles.dash} />
        <Box style={styles.notchStart} />
        <Box style={styles.notchEnd} />
      </Box>
      <Box px="lg" pb="lg" gap="md">
        {body}
      </Box>
      <GalleryModal images={urls} visible={photo !== null} initialIndex={photo ?? 0} onClose={closePhoto} />
    </Box>
  );
};

export const DealReturnCard = memo(DealReturnCardComponent);
