import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, ChipGroup, IconButton, NumberStepper, SocialPlatformIcon, Text } from '@/shared/ui';
import type { CatalogAddonChoice } from '../../../utils/campaignDeliverables';

interface DeliverableLineCardProps {
  lineKey: string;
  platform: string;
  platformLabel: string;
  serviceLabel: string;
  count: number;
  revisions: number;
  addonValue: string[];
  addons: CatalogAddonChoice[];
  countMin: number;
  countMax: number;
  revisionsMax: number;
  onRemove: (key: string) => void;
  onCount: (key: string, count: number) => void;
  onRevisions: (key: string, revisions: number) => void;
  onAddons: (key: string, addons: string[]) => void;
}

/** One line of what each creator delivers: service + platform, how many, edit rounds and the add-ons it can carry. */
const DeliverableLineCardComponent: React.FC<DeliverableLineCardProps> = ({
  lineKey,
  platform,
  platformLabel,
  serviceLabel,
  count,
  revisions,
  addonValue,
  addons,
  countMin,
  countMax,
  revisionsMax,
  onRemove,
  onCount,
  onRevisions,
  onAddons,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'card' | 'mark', ViewStyle> => ({
      card: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.xl,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        backgroundColor: colors.surface.main,
      },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        backgroundColor: colors.layout.base,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors, sizes.icon.xl],
  );

  const remove = useCallback(() => onRemove(lineKey), [lineKey, onRemove]);
  const changeCount = useCallback((value: number) => onCount(lineKey, value), [lineKey, onCount]);
  const changeRevisions = useCallback((value: number) => onRevisions(lineKey, value), [lineKey, onRevisions]);
  const changeAddons = useCallback((value: string[]) => onAddons(lineKey, value), [lineKey, onAddons]);

  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md">
        <Box style={styles.mark}>
          {isSocialPlatform(platform) ? (
            <SocialPlatformIcon platform={platform} size={sizes.icon.md} color={colors.text.primary} />
          ) : null}
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} numberOfLines={1}>
            {serviceLabel}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {platformLabel}
          </Text>
        </Box>
        <IconButton
          icon={X}
          variant="soft"
          onPress={remove}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.remove', {
            title: `${serviceLabel} ${platformLabel}`,
          })}
        />
      </Box>
      <Box row gap="lg">
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.requirements.deliverables.count')}
          </Text>
          <NumberStepper
            value={count}
            onChange={changeCount}
            min={countMin}
            max={countMax}
            accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.count')}
          />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.requirements.deliverables.revisions')}
          </Text>
          <NumberStepper
            value={revisions}
            onChange={changeRevisions}
            min={0}
            max={revisionsMax}
            accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.revisions')}
          />
        </Box>
      </Box>
      {addons.length > 0 ? (
        <ChipGroup
          multiple
          items={addons}
          value={addonValue}
          onChange={changeAddons}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.addons')}
        />
      ) : null}
    </Box>
  );
};

export const DeliverableLineCard = memo(DeliverableLineCardComponent);
