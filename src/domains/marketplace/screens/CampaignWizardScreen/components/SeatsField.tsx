import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, InlineError, NumberStepper, Text } from '@/shared/ui';
import { CAMPAIGN_MONEY_LIMITS } from '../../../constants/campaignMoney';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignField } from './CampaignField';

const DOT = moderateScale(14);
/** One cell per seat the campaign could ever have (fixed cap), filled up to the seats chosen. */
const SEAT_CELLS = Array.from({ length: CAMPAIGN_MONEY_LIMITS.seatsMax }, (_, index) => index);

/** How many creators the campaign takes (1–20), with the seats drawn as a strip of cells. */
const SeatsFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { money } = useCampaignWizard();
  const { seats, setSeats, limits, seatsError } = money;

  const styles = useStyles(
    ({ radii, spacing }): Record<'card' | 'cell' | 'filled', ViewStyle> => {
      const cell: ViewStyle = { width: DOT, height: DOT, borderRadius: radii.xs, backgroundColor: colors.surface.elevated };
      return {
        card: {
          padding: spacing.lg,
          gap: spacing.md,
          borderRadius: radii.lg,
          backgroundColor: colors.surface.main,
        },
        cell,
        filled: { ...cell, backgroundColor: colors.interactive.main },
      };
    },
    [colors.interactive.main, colors.surface.elevated, colors.surface.main],
  );

  return (
    <CampaignField label={t('marketplace.campaign.wizard.money.seats.label')}>
      <Box style={styles.card} shadow="card">
        <Box row align="center" gap="md">
          <NumberStepper
            value={seats}
            onChange={setSeats}
            min={limits.seatsMin}
            max={limits.seatsMax}
            accessibilityLabel={t('marketplace.campaign.wizard.money.seats.a11y')}
          />
          <Box flex={1}>
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.campaign.wizard.money.seats.hint', { max: limits.seatsMax })}
            </Text>
          </Box>
        </Box>
        <Box row wrap gap="xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {SEAT_CELLS.map(index => (
            <Box key={index} style={index < seats ? styles.filled : styles.cell} />
          ))}
        </Box>
      </Box>
      {seatsError ? <InlineError error={seatsError} /> : null}
    </CampaignField>
  );
};

export const SeatsField = memo(SeatsFieldComponent);
