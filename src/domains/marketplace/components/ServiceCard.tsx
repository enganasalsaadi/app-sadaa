import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, MapPin, Plus } from 'lucide-react-native';
import type { AddonType } from '@/core/api';
import type { Money } from '@/core/money';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, MoneyText, NumberStepper, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import type { OfferLineValue } from '../utils/offerForm';
import type { OfferService } from '../utils/offerServices';
import { formatDays } from '../utils/offerDuration';
import { AddonRow } from './AddonRow';
import { PickBurst } from './PickBurst';
import { ServiceCardDecor } from './ServiceCardDecor';

const PAD = moderateScale(14);

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
 * One rate card as a compact pickable ticket: the platform's own mark (+/✓ on its corner), title,
 * the card's real facts on one line and the fixed unit price, over faint drifting platform
 * glyphs. Picking it opens its add-ons as full-width rows and a footer strip: quantity on the
 * start side, the server's line total on the end side.
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
  const platform = service.platform && isSocialPlatform(service.platform) ? service.platform : null;

  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<
      'card' | 'clip' | 'head' | 'mark' | 'pick' | 'title' | 'body' | 'foot',
      ViewStyle
    > => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        ...(picked ? shadows.lg : shadows.card),
      },
      clip: {
        borderRadius: radii.xl,
        overflow: 'hidden',
        borderWidth: borderWidths.md,
        borderColor: picked ? colors.interactive.main : colors.border.card,
      },
      head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: PAD },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        backgroundColor: colors.layout.base,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pick: {
        position: 'absolute',
        top: -spacing.xs,
        end: -spacing.xs,
        width: sizes.control.md,
        height: sizes.control.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: borderWidths.sm,
        borderColor: picked ? colors.surface.main : colors.border.default,
        backgroundColor: picked ? colors.interactive.main : colors.surface.main,
      },
      title: { flexShrink: 1 },
      body: {
        padding: PAD,
        gap: spacing.sm,
        borderTopWidth: borderWidths.thin,
        borderColor: colors.surface.elevated,
      },
      foot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: PAD,
        paddingVertical: spacing.sm,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors, picked, sizes.control.md, sizes.icon.xl],
  );

  const toggle = useCallback(() => onToggle(rateCardId), [onToggle, rateCardId]);
  const changeQuantity = useCallback((value: number) => onQuantity(rateCardId, value), [onQuantity, rateCardId]);
  const pressAddon = useCallback((type: AddonType) => onToggleAddon(rateCardId, type), [onToggleAddon, rateCardId]);
  const pickLabel = picked
    ? t('marketplace.offer.services.unpick', { title: service.title })
    : t('marketplace.offer.services.pick', { title: service.title });
  const facts = [
    formatDays(t, service.deliveryDays),
    t('marketplace.offer.units.revisions', { count: service.revisions }),
    service.retentionLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Animated.View layout={reduceMotion ? undefined : LinearTransition.springify()} style={styles.card}>
      <Box style={styles.clip}>
        <ServiceCardDecor kind={platform ?? 'inPerson'} active={picked} />
        <Pressable
          style={styles.head}
          onPress={toggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: picked }}
          accessibilityLabel={pickLabel}
        >
          <Box style={styles.mark}>
            {platform ? (
              <SocialPlatformIcon platform={platform} size={sizes.icon.md} color={colors.text.primary} />
            ) : (
              <MapPin size={sizes.icon.md} color={colors.interactive.main} />
            )}
            <Box style={styles.pick}>
              {picked ? (
                <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={3} />
              ) : (
                <Plus size={sizes.icon.xs} color={colors.text.secondary} strokeWidth={3} />
              )}
            </Box>
            <PickBurst picked={picked} />
          </Box>
          <Box flex={1} gap="xs">
            <Box row align="center" gap="xs">
              <Box style={styles.title}>
                <Text variant="button" color={colors.text.primary} numberOfLines={1}>
                  {service.title}
                </Text>
              </Box>
              {line && line.quantity > 1 ? (
                <Box px="sm" borderRadius="full" bg={colors.interactive.main}>
                  <Text variant="caption" color={colors.text.onAccent}>
                    {`×${line.quantity}`}
                  </Text>
                </Box>
              ) : null}
            </Box>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {facts}
            </Text>
          </Box>
          <Box align="flex-end">
            <MoneyText value={service.price} size="md" />
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.offer.services.perUnit')}
            </Text>
          </Box>
        </Pressable>
        {line ? (
          <Animated.View entering={reduceMotion ? undefined : FadeIn} exiting={reduceMotion ? undefined : FadeOut}>
            {service.addons.length > 0 ? (
              <Box style={styles.body}>
                <Text variant="caption" color={colors.text.secondary}>
                  {t('marketplace.offer.services.addTo', { title: service.title })}
                </Text>
                {service.addons.map(addon => (
                  <AddonRow key={addon.type} addon={addon} on={line.addons.includes(addon.type)} onPress={pressAddon} />
                ))}
              </Box>
            ) : null}
            <Box style={styles.foot}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.offer.services.quantity')}
              </Text>
              <NumberStepper
                value={line.quantity}
                onChange={changeQuantity}
                min={1}
                max={Math.max(maxQuantity, line.quantity)}
                accessibilityLabel={t('marketplace.offer.services.quantity')}
              />
              <Box flex={1} align="flex-end">
                <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
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
            </Box>
          </Animated.View>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const ServiceCard = memo(ServiceCardComponent);
