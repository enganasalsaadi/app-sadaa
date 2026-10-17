import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, InlineError, Pressable, ProgressBar, Skeleton, Text } from '@/shared/ui';
import { deliverableKey, deliverableLabels, serviceAddons } from '../../../utils/campaignDeliverables';
import { useCampaignWizard } from '../CampaignWizardContext';
import { DeliverableLineCard } from './DeliverableLineCard';

const SKELETON_HEIGHT = moderateScale(120);

/**
 * What each creator delivers: the lines picked from the catalog (service × platform, how many,
 * edit rounds, add-ons) and how much of the 20-unit allowance they use. No prices here: the
 * money step sets what a seat pays.
 */
const DeliverablesFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { values, requirements } = useCampaignWizard();
  const {
    choices,
    catalogLoading,
    catalogFailed,
    reloadCatalog,
    units,
    unitsMax,
    countMin,
    revisionsMax,
    openSheet,
    removeLine,
    setCount,
    setRevisions,
    setAddons,
    maxCount,
    deliverablesError,
  } = requirements;
  const lines = values.deliverables;

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'add', ViewStyle> => ({
      add: {
        minHeight: sizes.button.lg,
        borderRadius: radii.xl,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
        backgroundColor: colors.surface.main,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
      },
    }),
    [colors, sizes.button.lg],
  );

  if (catalogFailed) {
    return (
      <Box gap="sm" align="flex-start">
        <InlineError error={t('marketplace.campaign.wizard.requirements.deliverables.catalogFailed')} />
        <CustomButton
          title={t('marketplace.campaign.wizard.strip.retry')}
          variant="outline"
          size="sm"
          onPress={reloadCatalog}
        />
      </Box>
    );
  }

  if (catalogLoading && lines.length === 0) {
    return <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="xl" />;
  }

  return (
    <Box gap="md">
      {lines.map(line => {
        const key = deliverableKey(line);
        const names = deliverableLabels(choices, line);
        return (
          <DeliverableLineCard
            key={key}
            lineKey={key}
            platform={line.platform}
            platformLabel={names.platform}
            serviceLabel={names.service}
            count={line.count}
            revisions={line.revisions}
            addonValue={line.addons}
            addons={serviceAddons(choices, line.platform, line.service)}
            countMin={countMin}
            countMax={maxCount(key)}
            revisionsMax={revisionsMax}
            onRemove={removeLine}
            onCount={setCount}
            onRevisions={setRevisions}
            onAddons={setAddons}
          />
        );
      })}
      <Pressable
        style={styles.add}
        scaleOnPress
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.add')}
      >
        <Plus size={sizes.icon.md} color={colors.interactive.text} />
        <Text variant="label" color={colors.interactive.text}>
          {t(
            lines.length === 0
              ? 'marketplace.campaign.wizard.requirements.deliverables.addFirst'
              : 'marketplace.campaign.wizard.requirements.deliverables.add',
          )}
        </Text>
      </Pressable>
      {lines.length > 0 ? (
        <ProgressBar
          value={units / unitsMax}
          tone={units >= unitsMax ? 'warning' : 'interactive'}
          size="sm"
          label={t('marketplace.campaign.wizard.requirements.deliverables.quota')}
          valueLabel={`${formatNumber(units)} / ${formatNumber(unitsMax)}`}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.deliverables.quotaA11y', {
            units,
            max: unitsMax,
          })}
        />
      ) : null}
      {deliverablesError ? <InlineError error={deliverablesError} /> : null}
    </Box>
  );
};

export const DeliverablesField = memo(DeliverablesFieldComponent);
