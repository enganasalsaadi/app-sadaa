import React, { memo, useCallback, useState } from 'react';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronUp, Lock, Plus, Zap } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, MoneyText, Pressable, Text } from '@/shared/ui';
import type { ShowcaseService } from '../../utils/mediaKitShowcase';

interface MediaKitServiceCardProps {
  service: ShowcaseService;
  /** Brand viewer with prices visible: the card can be picked for an offer. */
  selectable: boolean;
  selected: boolean;
  onToggle: (key: string) => void;
}

const LockedPrice = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="sm"
      bg={colors.surface.elevated}
      accessible
      accessibilityLabel={t('account.mediaKit.publicScreen.lockedPriceA11y')}
    >
      <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
      <Text variant="bodySmall" color={colors.text.tertiary}>
        {t('account.mediaKit.publicScreen.lockedPrice')}
      </Text>
    </Box>
  );
});

/** What the package includes and its add-ons, shown only when the brand asks. */
const ServiceDetails = memo<{ service: ShowcaseService }>(({ service }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(motion.duration.base)}>
      <Box gap="sm">
        {service.includes.map(line => (
          <Box key={line} row align="center" gap="sm">
            <Check size={sizes.icon.sm} color={colors.status.success.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {line}
              </Text>
            </Box>
          </Box>
        ))}
        {service.addons.map(addon => (
          <Box key={addon.key} row align="center" gap="sm">
            <Zap size={sizes.icon.sm} color={colors.interactive.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {addon.deliveryHours === null
                  ? addon.label
                  : t('account.mediaKit.previewScreen.addonWithHours', {
                      label: addon.label,
                      hours: t('account.rates.hours', { count: addon.deliveryHours }),
                    })}
              </Text>
            </Box>
            {addon.price ? <MoneyText value={addon.price} size="sm" showSign /> : null}
          </Box>
        ))}
      </Box>
    </Animated.View>
  );
});

/**
 * One service as a brand compares it: name and price lead (🔒 while locked), one muted line of
 * terms (delivery · revisions · how long it stays up), the inclusions and add-ons folded under
 * "Details", then "Add".
 */
const MediaKitServiceCardComponent: React.FC<MediaKitServiceCardProps> = ({
  service,
  selectable,
  selected,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => onToggle(service.key), [onToggle, service.key]);
  const toggleDetails = useCallback(() => setOpen(prev => !prev), []);
  const hasDetails = service.includes.length > 0 || service.addons.length > 0;

  const terms = [
    t('account.mediaKit.showcase.services.delivery', {
      days: t('account.rates.days', { count: service.deliveryDays }),
    }),
    t('account.mediaKit.showcase.services.revisions', { count: service.revisions }),
    service.retentionLabel,
  ]
    .filter(Boolean)
    .join(t('account.mediaKit.showcase.services.termsSeparator'));

  return (
    <Animated.View layout={LinearTransition.duration(motion.duration.base)}>
      <Card p="lg" selected={selectable ? selected : undefined}>
        <Box gap="sm">
          <Box row align="flex-start" gap="md">
            <Box flex={1} gap="xs">
              <Text variant="title" numberOfLines={2}>
                {service.packageLabel
                  ? t('account.mediaKit.showcase.services.nameWithPackage', {
                      service: service.serviceLabel,
                      pkg: service.packageLabel,
                    })
                  : service.serviceLabel}
              </Text>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
                {terms}
              </Text>
            </Box>
            {service.price ? <MoneyText value={service.price} size="title" /> : <LockedPrice />}
          </Box>

          {hasDetails || selectable ? (
            <Box row align="center" justify="space-between" gap="md">
              {hasDetails ? (
                <Pressable
                  onPress={toggleDetails}
                  row
                  align="center"
                  gap="xs"
                  minHeight={sizes.button.md}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                >
                  <Text variant="bodyMedium" color={colors.interactive.text}>
                    {t('account.mediaKit.showcase.services.details')}
                  </Text>
                  {open ? (
                    <ChevronUp size={sizes.icon.sm} color={colors.interactive.text} />
                  ) : (
                    <ChevronDown size={sizes.icon.sm} color={colors.interactive.text} />
                  )}
                </Pressable>
              ) : (
                <Box />
              )}
              {selectable ? (
                <CustomButton
                  title={t(
                    selected
                      ? 'account.mediaKit.showcase.services.added'
                      : 'account.mediaKit.showcase.services.add',
                  )}
                  variant="secondary"
                  size="sm"
                  haptic
                  leftIcon={selected ? <Check /> : <Plus />}
                  onPress={toggle}
                  accessibilityState={{ selected }}
                />
              ) : null}
            </Box>
          ) : null}

          {open ? <ServiceDetails service={service} /> : null}
        </Box>
      </Card>
    </Animated.View>
  );
};

export const MediaKitServiceCard = memo(MediaKitServiceCardComponent);
