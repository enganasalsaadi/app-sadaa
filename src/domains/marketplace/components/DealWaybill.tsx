import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink, Package, Pencil, Truck, type LucideIcon } from 'lucide-react-native';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealParty, DealRole, DealShipment } from '../types';
import { monogramOf } from '../utils/creatorText';
import { DealShippingStamp } from './DealShippingStamp';
import { DealWaybillBarcode } from './DealWaybillBarcode';

const MARK = moderateScale(34);
const BADGE = moderateScale(40);
const NOTCH = moderateScale(20);
const ARROW = moderateScale(28);
/** How far the earlier waybill peeks out above this one. */
const PEEK = moderateScale(16);
const BEHIND_HEIGHT = moderateScale(96);
const BEHIND_TILT = -2.2;
const SHIPPED_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export interface DealWaybillProps {
  /** `null`: nothing shipped yet, a blank waybill waiting for its number. */
  shipment: DealShipment | null;
  /** The shipment before this one (a re-ship): its label peeks out from behind. */
  previous: DealShipment | null;
  role: DealRole;
  brand: DealParty;
  creator: DealParty;
  /** Under the tracking number: the day meter, or the ship-by line on a blank waybill. */
  footer: React.ReactNode;
  onCopy?: () => void;
  /** Only when the link is a safe https link. */
  onTrack?: (() => void) | null;
  /** Brand, while the shipment can still change. */
  onEdit?: () => void;
}

/** A sender / receiver on the route: photo, else the first letter on a soft tint. */
const PartyMark = memo<{ party: DealParty; tone: 'brand' | 'interactive' }>(({ party, tone }) => {
  const { colors } = useTheme();
  if (party.avatarUrl) return <Image uri={party.avatarUrl} size={MARK} circle />;
  return (
    <Box
      width={MARK}
      height={MARK}
      borderRadius="full"
      bg={colors[tone].soft}
      align="center"
      justify="center"
    >
      <Text variant="buttonSmall" color={colors[tone].text}>
        {monogramOf(party.name ?? '')}
      </Text>
    </Box>
  );
});

const Chip = memo<{ icon: LucideIcon; label: string; onPress: () => void; accent?: boolean }>(
  ({ icon: Icon, label, onPress, accent = false }) => {
    const { colors, sizes } = useTheme();
    const ink = accent ? colors.interactive.text : colors.text.primary;
    return (
      <Pressable
        row
        align="center"
        gap="xs"
        px="md"
        height={sizes.button.md}
        borderRadius="sm"
        bg={accent ? colors.interactive.soft : colors.surface.elevated}
        scaleOnPress
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Icon size={sizes.icon.xs} color={accent ? colors.interactive.main : ink} />
        <Text variant="buttonSmall" color={ink} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

/**
 * «The waybill» (approved 2026-10-15, direction A): a real courier label. Navy courier band,
 * the route from brand to creator, a perforated tear line, the tracking number large beside its
 * barcode, quick chips (copy · track · edit), then the day meter. A reported problem is stamped
 * on it in amber; after a re-ship the earlier label peeks out from behind.
 */
const DealWaybillComponent: React.FC<DealWaybillProps> = ({
  shipment,
  previous,
  role,
  brand,
  creator,
  footer,
  onCopy,
  onTrack,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<
      | 'wrap'
      | 'behind'
      | 'card'
      | 'head'
      | 'badge'
      | 'seq'
      | 'route'
      | 'perf'
      | 'arrow'
      | 'notchStart'
      | 'notchEnd'
      | 'blank'
      | 'stamp'
      | 'number',
      ViewStyle
    > => {
      const notch: ViewStyle = {
        position: 'absolute',
        top: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: colors.layout.base,
      };
      return {
        wrap: { paddingTop: previous ? PEEK : 0 },
        behind: {
          position: 'absolute',
          top: 0,
          start: spacing.lg,
          end: spacing.lg,
          height: BEHIND_HEIGHT,
          borderRadius: radii.lg,
          overflow: 'hidden',
          backgroundColor: colors.surface.main,
          transform: [{ rotate: `${BEHIND_TILT}deg` }],
          ...shadows.sm,
        },
        card: {
          borderRadius: radii.lg,
          overflow: 'hidden',
          backgroundColor: colors.surface.main,
          borderWidth: borderWidths.hairline,
          borderColor: colors.border.card,
          ...shadows.lg,
        },
        head: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.brand.main,
        },
        badge: {
          width: BADGE,
          height: BADGE,
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.glass.badge,
          borderWidth: borderWidths.thin,
          borderColor: colors.glass.border,
        },
        seq: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: radii.full,
          backgroundColor: colors.glass.badge,
          borderWidth: borderWidths.thin,
          borderColor: colors.glass.border,
        },
        route: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        },
        perf: {
          marginVertical: spacing.lg,
          borderTopWidth: borderWidths.md,
          borderStyle: 'dashed',
          borderColor: colors.border.default,
        },
        arrow: {
          width: ARROW,
          borderTopWidth: borderWidths.md,
          borderStyle: 'dashed',
          borderColor: colors.border.strong,
        },
        notchStart: { ...notch, start: -NOTCH / 2 },
        notchEnd: { ...notch, end: -NOTCH / 2 },
        blank: {
          flex: 1,
          minHeight: moderateScale(48),
          borderRadius: radii.sm,
          borderWidth: borderWidths.sm,
          borderStyle: 'dashed',
          borderColor: colors.border.strong,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.md,
        },
        stamp: { position: 'absolute', top: -spacing.sm, end: spacing.lg },
        // A tracking number reads left to right in either language.
        number: { direction: 'ltr' },
      };
    },
    [colors, previous],
  );

  const sequence = shipment?.sequence ?? (previous?.sequence ?? 0) + 1;
  const receiver = role === 'creator' ? t('marketplace.deals.shipping.waybill.you') : creator.name ?? '';
  const sender = role === 'brand' ? t('marketplace.deals.shipping.waybill.you') : brand.name ?? '';
  const BadgeIcon = shipment ? Truck : Package;

  return (
    <Box style={styles.wrap}>
      {previous ? (
        <Box style={styles.behind} accessible={false} importantForAccessibility="no-hide-descendants">
          <Box row justify="space-between" px="lg" py="sm" bg={colors.surface.elevated}>
            <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
              {t('marketplace.deals.shipping.waybill.sequence', {
                number: formatNumber(previous.sequence, {}, i18n.language),
              })}
            </Text>
            <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
              {previous.issue?.reason.label ?? previous.courier}
            </Text>
          </Box>
        </Box>
      ) : null}
      <Box style={styles.card}>
        <Box style={styles.head}>
          <Box style={styles.badge}>
            <BadgeIcon size={sizes.icon.sm} color={colors.text.onBrand} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
              {shipment ? shipment.courier : t('marketplace.deals.shipping.waybill.blankTitle')}
            </Text>
            <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
              {shipment
                ? t('marketplace.deals.shipping.waybill.shippedOn', {
                    date: formatDate(shipment.shippedAt, SHIPPED_FORMAT, i18n.language),
                  })
                : t('marketplace.deals.shipping.waybill.blankBody')}
            </Text>
          </Box>
          <Box style={styles.seq}>
            <Text variant="caption" color={colors.text.onBrand}>
              {t('marketplace.deals.shipping.waybill.sequence', {
                number: formatNumber(sequence, {}, i18n.language),
              })}
            </Text>
          </Box>
        </Box>

        <Box style={styles.route}>
          <Box row align="center" gap="sm" flex={1}>
            <PartyMark party={brand} tone="brand" />
            <Box flex={1}>
              <Text variant="buttonSmall" color={colors.text.primary} numberOfLines={1}>
                {sender}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.shipping.waybill.from')}
              </Text>
            </Box>
          </Box>
          <Box style={styles.arrow} />
          <Box row align="center" gap="sm" flex={1}>
            <PartyMark party={creator} tone="interactive" />
            <Box flex={1}>
              <Text variant="buttonSmall" color={colors.text.primary} numberOfLines={1}>
                {receiver}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.shipping.waybill.to')}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box style={styles.perf}>
          <Box style={styles.notchStart} />
          <Box style={styles.notchEnd} />
        </Box>

        <Box px="lg" gap="md">
          {shipment ? (
            <Box row align="flex-end" gap="md">
              <Box gap="xs" accessible>
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.deals.shipping.waybill.trackingNo')}
                </Text>
                <Text
                  variant="amountTitle"
                  color={colors.text.primary}
                  numberOfLines={1}
                  style={styles.number}
                  selectable
                >
                  {isolateLtr(shipment.trackingNo)}
                </Text>
              </Box>
              <Box flex={1}>
                <DealWaybillBarcode value={shipment.trackingNo} />
              </Box>
              {shipment.issue ? (
                <Box style={styles.stamp}>
                  <DealShippingStamp label={shipment.issue.reason.label} tone="warning" />
                </Box>
              ) : null}
            </Box>
          ) : (
            <Box style={styles.blank}>
              <Text variant="caption" color={colors.text.tertiary} align="center">
                {t('marketplace.deals.shipping.waybill.blankNumber')}
              </Text>
            </Box>
          )}
          {shipment && (onCopy || onTrack || onEdit) ? (
            <Box row gap="sm" wrap>
              {onCopy ? (
                <Chip icon={Copy} label={t('marketplace.deals.shipping.waybill.copy')} onPress={onCopy} />
              ) : null}
              {onTrack ? (
                <Chip
                  icon={ExternalLink}
                  label={t('marketplace.deals.shipping.waybill.track')}
                  onPress={onTrack}
                  accent
                />
              ) : null}
              {onEdit ? (
                <Chip icon={Pencil} label={t('marketplace.deals.shipping.waybill.edit')} onPress={onEdit} />
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box px="lg" pt="lg" pb="lg">
          {footer}
        </Box>
      </Box>
    </Box>
  );
};

export const DealWaybill = memo(DealWaybillComponent);
