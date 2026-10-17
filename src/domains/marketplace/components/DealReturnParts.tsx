import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, type LucideIcon } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { iconStroke, moderateScale, resolveHue, useTheme } from '@/core/theme';
import { Box, GalleryModal, IconButton, Image, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealReturnShipment } from '../types';

const THUMB = moderateScale(64);
const WHEN: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
const WHEN_TIME: Intl.DateTimeFormatOptions = { ...WHEN, hour: 'numeric', minute: '2-digit' };

/** «22 أكتوبر», or with the hour when `withTime`. Empty for a moment the server hasn't set. */
export const useReturnDate = () => {
  const { i18n } = useTranslation();
  return useCallback(
    (at: number | null, withTime = false) =>
      at === null ? '' : formatDate(at, withTime ? WHEN_TIME : WHEN, i18n.language),
    [i18n.language],
  );
};

/** A label over a value, the two halves of one detail row. */
export const ReturnFact = memo<{
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copyLabel?: string;
}>(({ label, value, mono = false, onCopy, copyLabel }) => {
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
});

/** One sentence with its icon, tinted by what it tells the reader. */
export const ReturnLine = memo<{
  icon: LucideIcon;
  tone: 'warning' | 'danger' | 'interactive' | 'success' | 'neutral';
  text: string;
}>(({ icon: Icon, tone, text }) => {
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
});

export interface ReturnWaybillProps {
  ship: DealReturnShipment;
  onCopyTracking: () => void;
  onCopyLink: () => void;
}

/** The waybill on file: courier + number, then the handover day and the link when there are any. */
export const ReturnWaybill = memo<ReturnWaybillProps>(({ ship, onCopyTracking, onCopyLink }) => {
  const { t } = useTranslation();
  const date = useReturnDate();
  if (!ship.trackingNo && !ship.courier) return null;
  return (
    <>
      <Box row gap="lg">
        <ReturnFact label={t('marketplace.deals.return.card.courier')} value={ship.courier ?? '—'} />
        <ReturnFact
          label={t('marketplace.deals.return.card.trackingNo')}
          value={ship.trackingNo ?? '—'}
          mono
          onCopy={ship.trackingNo ? onCopyTracking : undefined}
          copyLabel={t('marketplace.deals.return.card.copyTrackingNo')}
        />
      </Box>
      {ship.handedAt !== null || ship.trackingUrl ? (
        <Box row gap="lg">
          {ship.handedAt !== null ? (
            <ReturnFact label={t('marketplace.deals.return.card.handed')} value={date(ship.handedAt)} />
          ) : (
            <Box flex={1} />
          )}
          {ship.trackingUrl ? (
            <ReturnFact
              label={t('marketplace.deals.return.card.link')}
              value={ship.trackingUrl.replace(/^https:\/\//, '')}
              mono
              onCopy={onCopyLink}
              copyLabel={t('marketplace.deals.return.card.copyLink')}
            />
          ) : (
            <Box flex={1} />
          )}
        </Box>
      ) : null}
    </>
  );
});

/** A dated note (the brand's report or waive reason) on a sunken tile. */
export const ReturnNote = memo<{ label: string; text: string }>(({ label, text }) => {
  const { colors } = useTheme();
  return (
    <Box gap="sm" p="md" borderRadius="md" bg={colors.surface.elevated}>
      <Text variant="caption" color={colors.text.tertiary}>
        {label}
      </Text>
      <Text variant="bodySmall" color={colors.text.primary}>
        {text}
      </Text>
    </Box>
  );
});

/** The report's photos as thumbnails, opened in the gallery (read-only). */
export const ReturnPhotos = memo<{ urls: readonly string[] }>(({ urls }) => {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<number | null>(null);
  const closePhoto = useCallback(() => setPhoto(null), []);
  if (urls.length === 0) return null;
  return (
    <>
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
      <GalleryModal images={[...urls]} visible={photo !== null} initialIndex={photo ?? 0} onClose={closePhoto} />
    </>
  );
});
