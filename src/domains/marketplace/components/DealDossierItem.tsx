import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Clapperboard,
  Clock3,
  Pin,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import { DEAL_RETENTION_LABEL } from '../constants/dealCopy';
import type { DealItem, DealRole } from '../types';
import { getDealItemStatusMeta } from '../utils/dealStatus';
import { formatDuration } from '../utils/offerDuration';

const TILE = moderateScale(48);

export interface DealDossierItemProps {
  item: DealItem;
  role: DealRole;
}

const Fact = memo<{ icon: LucideIcon; label: string }>(
  ({ icon: Icon, label }) => {
    const { colors, sizes } = useTheme();
    return (
      <Box
        row
        align="center"
        gap="xs"
        px="sm"
        py="xs"
        borderRadius="md"
        bg={colors.surface.elevated}
      >
        <Icon size={sizes.icon.xs} color={colors.icon.secondary} />
        <Text variant="caption" color={colors.text.secondary}>
          {label}
        </Text>
      </Box>
    );
  },
);

/**
 * One deliverable as it was ordered: platform mark, title, delivery window, revisions and how long
 * it stays up, every add-on, then its own status. Prices for the brand only (the creator's side
 * of the money lives in their wallet, after commission).
 */
const DealDossierItemComponent: React.FC<DealDossierItemProps> = ({
  item,
  role,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const showPrice = role === 'brand';
  const hue = resolveHue(colors, getDealItemStatusMeta(item.status.key).tone);
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'card' | 'tile' | 'addons' | 'status' | 'dot', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        overflow: 'hidden',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      tile: {
        width: TILE,
        height: TILE,
        borderRadius: radii.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.main,
      },
      addons: {
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: borderWidths.thin,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
      status: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: hue.soft,
      },
      dot: {
        width: sizes.dot.md,
        height: sizes.dot.md,
        borderRadius: radii.full,
        backgroundColor: hue.main,
      },
    }),
    [
      colors.border.card,
      colors.border.default,
      colors.brand.main,
      colors.surface.main,
      hue.main,
      hue.soft,
      sizes.dot.md,
    ],
  );

  const hours =
    item.deliveryHours ??
    (item.deliveryDays !== null ? item.deliveryDays * 24 : null);

  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md" p="lg">
        <Box style={styles.tile}>
          {item.platform && isSocialPlatform(item.platform) ? (
            <SocialPlatformIcon
              platform={item.platform}
              size={sizes.icon.md}
              color={colors.text.onBrand}
            />
          ) : (
            <Clapperboard size={sizes.icon.md} color={colors.text.onBrand} />
          )}
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} numberOfLines={2}>
            {item.title}
          </Text>
        </Box>
        {showPrice ? <MoneyText value={item.unitPrice} size="md" /> : null}
      </Box>

      <Box row wrap gap="xs" px="lg" pb="md">
        {hours !== null ? (
          <Fact
            icon={Clock3}
            label={t('marketplace.deals.dossier.delivery', {
              duration: formatDuration(t, hours),
            })}
          />
        ) : null}
        <Fact
          icon={RefreshCw}
          label={t('marketplace.offer.units.revisions', {
            count: item.revisionsAllowed,
          })}
        />
        {item.retention ? (
          <Fact icon={Pin} label={t(DEAL_RETENTION_LABEL[item.retention])} />
        ) : null}
      </Box>

      {item.addons.length > 0 ? (
        <Box style={styles.addons}>
          {item.addons.map((addon, index) => (
            // Add-ons carry no id; the same type can repeat via upsells.
            <Box key={`${addon.type}-${index}`} row align="center" gap="sm">
              <Plus size={sizes.icon.xs} color={colors.interactive.main} />
              <Box flex={1}>
                <Text variant="bodySmall" color={colors.text.primary}>
                  {addon.label}
                </Text>
              </Box>
              {showPrice ? <MoneyText value={addon.price} size="sm" /> : null}
            </Box>
          ))}
        </Box>
      ) : null}

      <Box style={styles.status}>
        <Box style={styles.dot} />
        <Box flex={1}>
          <Text variant="caption" color={hue.text} numberOfLines={1}>
            {item.status.label}
          </Text>
        </Box>
        {item.revisionsUsed > 0 ? (
          <Text variant="caption" color={hue.text}>
            {t('marketplace.deals.dossier.revisionsLeft', {
              revisions: t('marketplace.offer.units.revisions', {
                count: item.revisionsLeft,
              }),
            })}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export const DealDossierItem = memo(DealDossierItemComponent);
