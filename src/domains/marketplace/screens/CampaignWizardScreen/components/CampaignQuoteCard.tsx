import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, GradientSurface, InlineError, Notice, Skeleton, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

const CARD_HEIGHT = moderateScale(176);

/**
 * The server's quote of the saved draft on a dark card: the most that could be held if every seat
 * fills (mint, an estimate), then the wallet against it. Below, the reminder that nothing is held
 * until an applicant is selected, with a top-up nudge when the wallet falls short.
 */
const CampaignQuoteCardComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { money } = useCampaignWizard();
  const { quote, quoteLoading, quoteUpdating, quoteFailed, reloadQuote } = money;

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'pill' | 'rule', ViewStyle> => ({
      pill: {
        paddingHorizontal: spacing.sm,
        borderRadius: radii.full,
        backgroundColor: colors.glass.badge,
      },
      rule: { height: borderWidths.thin, backgroundColor: colors.glass.border },
    }),
    [colors.glass.badge, colors.glass.border],
  );

  if (quoteFailed) {
    return (
      <Box gap="sm" align="flex-start">
        <InlineError error={t('marketplace.campaign.wizard.money.quote.failed')} />
        <CustomButton
          title={t('marketplace.campaign.wizard.money.quote.retry')}
          variant="outline"
          size="sm"
          onPress={reloadQuote}
        />
      </Box>
    );
  }

  if (quoteLoading) return <Skeleton width="100%" height={CARD_HEIGHT} borderRadius="lg" />;

  const max = quote?.totalGross.max ?? null;
  const min = quote?.totalGross.min ?? null;
  const wallet = quote?.wallet;
  const short = wallet !== undefined && wallet.shortfall.amount > 0;

  return (
    <Box gap="md">
      <GradientSurface variant="live" borderRadius="lg" p="lg" gap="md" shadow="lg">
        <Box row align="center" gap="sm">
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.campaign.wizard.money.quote.title')}
          </Text>
          <Box style={styles.pill}>
            <Text variant="caption" color={colors.text.onBrand}>
              {t('marketplace.campaign.wizard.money.quote.estimate')}
            </Text>
          </Box>
          <Box flex={1} align="flex-end">
            {quoteUpdating ? (
              <Text variant="caption" color={colors.text.onBrandMuted} accessibilityLiveRegion="polite">
                {t('marketplace.campaign.wizard.money.quote.updating')}
              </Text>
            ) : null}
          </Box>
        </Box>
        {max ? (
          <>
            <Box gap="xs">
              <Text variant="amountLarge" color={colors.glass.iconMoney}>
                {formatMoney(max)}
              </Text>
              {min && min.amount !== max.amount ? (
                <Text variant="caption" color={colors.text.onBrandMuted}>
                  {t('marketplace.campaign.wizard.money.quote.range', { min: formatMoney(min) })}
                </Text>
              ) : null}
            </Box>
            {wallet ? (
              <>
                <Box style={styles.rule} />
                <Box row justify="space-between" align="center" gap="md">
                  <Text variant="bodySmall" color={colors.text.onBrand}>
                    {t('marketplace.campaign.wizard.money.quote.balance')}
                  </Text>
                  <Text variant="amountSmall" color={colors.text.onBrand}>
                    {formatMoney(wallet.balance, undefined, { rounding: 'down' })}
                  </Text>
                </Box>
                <Box row justify="space-between" align="center" gap="md">
                  <Text variant="bodySmall" color={colors.text.onBrand}>
                    {t(short ? 'marketplace.campaign.wizard.money.quote.shortfall' : 'marketplace.campaign.wizard.money.quote.covered')}
                  </Text>
                  {short ? (
                    <Text variant="amountSmall" color={colors.glass.iconWarning}>
                      {formatMoney(wallet.shortfall)}
                    </Text>
                  ) : null}
                </Box>
              </>
            ) : null}
          </>
        ) : (
          <Text variant="bodySmall" color={colors.text.onBrand}>
            {t('marketplace.campaign.wizard.money.quote.empty')}
          </Text>
        )}
      </GradientSurface>
      <Notice
        tone={short ? 'warning' : 'info'}
        icon={Wallet}
        title={short ? t('marketplace.campaign.wizard.money.quote.note') : undefined}
        message={t(short ? 'marketplace.campaign.wizard.money.quote.topUp' : 'marketplace.campaign.wizard.money.quote.note')}
      />
    </Box>
  );
};

export const CampaignQuoteCard = memo(CampaignQuoteCardComponent);
