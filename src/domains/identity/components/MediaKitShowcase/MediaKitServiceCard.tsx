import React, { memo, useCallback } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Lock, Plus, RefreshCw, Timer, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, MoneyText, Text } from '@/shared/ui';
import type { ShowcaseService } from '../../utils/mediaKitShowcase';

interface MediaKitServiceCardProps {
  service: ShowcaseService;
  /** Brand viewer with prices visible: the card can be picked for an offer. */
  selectable: boolean;
  selected: boolean;
  onToggle: (key: string) => void;
}

const Term = memo<{ icon: LucideIcon; label: string }>(({ icon: Icon, label }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box row align="center" gap="xs">
      <Icon size={sizes.icon.xs} color={colors.icon.secondary} />
      <Text variant="caption" color={colors.text.secondary}>
        {label}
      </Text>
    </Box>
  );
});

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

/**
 * One service as a brand compares it: what it is, the price (🔒 while locked), everything
 * included, delivery, revisions and how long the post stays up, add-ons, then "Add".
 */
const MediaKitServiceCardComponent: React.FC<MediaKitServiceCardProps> = ({
  service,
  selectable,
  selected,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const toggle = useCallback(() => onToggle(service.key), [onToggle, service.key]);

  return (
    <Animated.View layout={LinearTransition.duration(motion.duration.base)}>
      <Card p="lg" selected={selectable ? selected : undefined}>
        <Box gap="md">
          <Box row align="flex-start" gap="md">
            <Box flex={1} gap="xs">
              <Text variant="title" numberOfLines={2}>
                {service.serviceLabel}
              </Text>
              {service.packageLabel ? (
                <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
                  {service.packageLabel}
                </Text>
              ) : null}
            </Box>
            {service.price ? <MoneyText value={service.price} size="title" /> : <LockedPrice />}
          </Box>

          {service.includes.length > 0 ? (
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
            </Box>
          ) : null}

          <Box row wrap gap="lg">
            <Term
              icon={Clock}
              label={t('account.mediaKit.showcase.services.delivery', {
                days: t('account.rates.days', { count: service.deliveryDays }),
              })}
            />
            <Term
              icon={RefreshCw}
              label={t('account.mediaKit.showcase.services.revisions', { count: service.revisions })}
            />
            {service.retentionLabel ? <Term icon={Timer} label={service.retentionLabel} /> : null}
          </Box>

          {service.addons.length > 0 ? (
            <Box gap="sm" pt="md" borderTopWidth="thin" borderColor={colors.border.default}>
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
          ) : null}

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
      </Card>
    </Animated.View>
  );
};

export const MediaKitServiceCard = memo(MediaKitServiceCardComponent);
