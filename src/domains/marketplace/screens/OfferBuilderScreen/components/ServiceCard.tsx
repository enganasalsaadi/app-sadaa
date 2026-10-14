import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, Clock, MapPin, Plus, RotateCcw, Timer } from 'lucide-react-native';
import type { AddonType } from '@/core/api';
import type { Money } from '@/core/money';
import { useStyles, useTheme } from '@/core/theme';
import { ADDON_ICONS } from '@/domains/identity';
import { isSocialPlatform } from '@/shared/utils';
import { Box, MoneyText, NumberStepper, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import { DEAL_OFFER_LIMITS } from '../../../constants/dealOffer';
import type { OfferLineValue } from '../../../utils/offerForm';
import type { OfferAddon, OfferService } from '../../../utils/offerServices';
import { formatDuration, formatDays } from '../../../utils/offerDuration';

interface AddonChipProps {
  addon: OfferAddon;
  on: boolean;
  onPress: (type: AddonType) => void;
}

const AddonChip = memo<AddonChipProps>(({ addon, on, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = ADDON_ICONS[addon.type];
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'chip', ViewStyle> => ({
      chip: {
        flexBasis: '47%',
        flexGrow: 1,
        minHeight: sizes.button.xl + spacing.lg,
        padding: spacing.md,
        gap: spacing.xs,
        borderRadius: radii.md,
        borderWidth: borderWidths.md,
        borderColor: on ? colors.interactive.main : colors.border.default,
        backgroundColor: on ? colors.interactive.soft : colors.surface.main,
      },
    }),
    [colors, on, sizes.button.xl],
  );
  const detail = addon.detail
    ? addon.detail.unit === 'hours'
      ? formatDuration(t, addon.detail.count)
      : formatDays(t, addon.detail.count)
    : null;
  return (
    <Pressable
      style={styles.chip}
      scaleOnPress
      onPress={() => onPress(addon.type)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={addon.label}
    >
      <Box row align="center" justify="space-between">
        <Icon size={sizes.icon.sm} color={colors.interactive.main} />
        {on ? (
          <Box width={sizes.icon.sm} height={sizes.icon.sm} borderRadius="full" bg={colors.interactive.main} align="center" justify="center">
            <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={3} />
          </Box>
        ) : null}
      </Box>
      <Text variant="bodySmall" color={colors.text.primary} numberOfLines={2}>
        {addon.label}
      </Text>
      <Box row align="center" justify="space-between" gap="xs">
        {detail ? (
          <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
            {detail}
          </Text>
        ) : (
          <Box />
        )}
        <MoneyText value={addon.price} size="sm" showSign tone={on ? 'default' : 'muted'} />
      </Box>
    </Pressable>
  );
});

export interface ServiceCardProps {
  service: OfferService;
  line: OfferLineValue | undefined;
  /** Server total of this line; `null` before the quote lands. */
  lineTotal: Money | null;
  maxQuantity: number;
  onToggle: (rateCardId: string) => void;
  onQuantity: (rateCardId: string, quantity: number) => void;
  onToggleAddon: (rateCardId: string, type: AddonType) => void;
}

/**
 * One rate card as a pickable ticket: the platform mark, title, the card's real facts (time,
 * revisions, retention) and the fixed price. Picking it opens its quantity and add-ons in place
 * (no accordion), with the server's line total once priced.
 */
const ServiceCardComponent: React.FC<ServiceCardProps> = ({
  service,
  line,
  lineTotal,
  maxQuantity,
  onToggle,
  onQuantity,
  onToggleAddon,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const picked = line !== undefined;
  const { rateCardId } = service;

  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'card' | 'mark' | 'pick' | 'body', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.md,
        borderColor: picked ? colors.interactive.main : colors.border.card,
        ...(picked ? shadows.lg : shadows.card),
      },
      mark: {
        width: sizes.avatar.md,
        height: sizes.avatar.md,
        borderRadius: radii.md,
        backgroundColor: colors.interactive.soft,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pick: {
        width: sizes.button.md,
        height: sizes.button.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: picked ? 0 : borderWidths.md,
        borderColor: colors.border.default,
        backgroundColor: picked ? colors.interactive.main : colors.surface.main,
      },
      body: {
        marginHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
        borderTopWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
    }),
    [colors, picked, sizes.avatar.md, sizes.button.md],
  );

  const toggle = useCallback(() => onToggle(rateCardId), [onToggle, rateCardId]);
  const changeQuantity = useCallback((value: number) => onQuantity(rateCardId, value), [onQuantity, rateCardId]);
  const pressAddon = useCallback((type: AddonType) => onToggleAddon(rateCardId, type), [onToggleAddon, rateCardId]);
  const pickLabel = picked
    ? t('marketplace.offer.services.unpick', { title: service.title })
    : t('marketplace.offer.services.pick', { title: service.title });

  return (
    <Animated.View layout={reduceMotion ? undefined : LinearTransition.springify()} style={styles.card}>
      <Pressable onPress={toggle} accessibilityRole="checkbox" accessibilityState={{ checked: picked }} accessibilityLabel={pickLabel}>
        <Box row align="flex-start" gap="md" pt="lg" px="lg">
          <Box style={styles.mark}>
            {service.platform && isSocialPlatform(service.platform) ? (
              <SocialPlatformIcon platform={service.platform} size={sizes.icon.md} color={colors.text.primary} />
            ) : (
              <MapPin size={sizes.icon.md} color={colors.interactive.main} />
            )}
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="overline" color={colors.text.tertiary} numberOfLines={1}>
              {service.platformLabel ?? t('marketplace.offer.services.inPerson')}
            </Text>
            <Box row align="center" gap="sm">
              <Box flex={1}>
                <Text variant="title" color={colors.text.primary} numberOfLines={2}>
                  {service.title}
                </Text>
              </Box>
              {line && line.quantity > 1 ? (
                <Box px="sm" borderRadius="full" bg={colors.interactive.main}>
                  <Text variant="buttonSmall" color={colors.text.onAccent}>
                    {`×${line.quantity}`}
                  </Text>
                </Box>
              ) : null}
            </Box>
            {service.summary ? (
              <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
                {service.summary}
              </Text>
            ) : null}
          </Box>
          <Box style={styles.pick}>
            {picked ? (
              <Check size={sizes.icon.sm} color={colors.text.onAccent} strokeWidth={3} />
            ) : (
              <Plus size={sizes.icon.sm} color={colors.text.primary} />
            )}
          </Box>
        </Box>
        <Box row align="flex-end" justify="space-between" gap="sm" px="lg" pt="md" pb="lg">
          <Box flex={1} row wrap columnGap="md" rowGap="xs">
            <Box row align="center" gap="xs">
              <Clock size={sizes.icon.xs} color={colors.text.tertiary} />
              <Text variant="caption" color={colors.text.secondary}>
                {formatDays(t, service.deliveryDays)}
              </Text>
            </Box>
            <Box row align="center" gap="xs">
              <RotateCcw size={sizes.icon.xs} color={colors.text.tertiary} />
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.offer.units.revisions', { count: service.revisions })}
              </Text>
            </Box>
            {service.retentionLabel ? (
              <Box row align="center" gap="xs">
                <Timer size={sizes.icon.xs} color={colors.text.tertiary} />
                <Text variant="caption" color={colors.text.secondary}>
                  {service.retentionLabel}
                </Text>
              </Box>
            ) : null}
          </Box>
          <Box align="flex-end">
            <MoneyText value={service.price} size="title" />
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.offer.services.perUnit')}
            </Text>
          </Box>
        </Box>
      </Pressable>
      {line ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn}
          exiting={reduceMotion ? undefined : FadeOut}
          style={styles.body}
        >
          <Box row align="center" justify="space-between" gap="md">
            <Box flex={1}>
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t('marketplace.offer.services.quantity')}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.offer.services.quantityHint', { max: DEAL_OFFER_LIMITS.maxQuantityPerLine })}
              </Text>
            </Box>
            <NumberStepper
              value={line.quantity}
              onChange={changeQuantity}
              min={1}
              max={Math.max(maxQuantity, line.quantity)}
              accessibilityLabel={t('marketplace.offer.services.quantity')}
            />
          </Box>
          {service.addons.length > 0 ? (
            <Box gap="sm">
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.offer.services.addTo', { title: service.title })}
              </Text>
              <Box row wrap gap="sm">
                {service.addons.map(addon => (
                  <AddonChip key={addon.type} addon={addon} on={line.addons.includes(addon.type)} onPress={pressAddon} />
                ))}
              </Box>
            </Box>
          ) : null}
          <Box row align="center" justify="space-between">
            <Text variant="bodySmall" color={colors.text.secondary}>
              {line.quantity > 1
                ? t('marketplace.offer.services.lineTotalQty', { count: line.quantity })
                : t('marketplace.offer.services.lineTotal')}
            </Text>
            {lineTotal ? (
              <MoneyText value={lineTotal} size="md" animated />
            ) : (
              <Text variant="bodySmall" color={colors.text.tertiary}>
                {t('marketplace.offer.dock.pricing')}
              </Text>
            )}
          </Box>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

export const ServiceCard = memo(ServiceCardComponent);
