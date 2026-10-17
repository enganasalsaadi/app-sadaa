import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { AmountInput, Box, InlineError, SegmentedControl, Text, type SegmentedOption } from '@/shared/ui';
import type { CampaignPricingModel } from '../../../types/campaign';
import { bpsShare } from '../../../utils/dealContract';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignField } from './CampaignField';

const WHOLE_DOLLARS = { precision: 0 } as const;
const PERCENT = { style: 'percent', maximumFractionDigits: 2 } as const;

/**
 * How a seat is paid: a fixed price, or bidding inside a range (the top binds, the bottom guides)
 * with an optional budget cap. The fee and the creator's net come from the server's quote, and
 * only once it was worked out for the price on screen.
 */
const PricingFieldComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { money } = useCampaignWizard();
  const {
    model,
    chooseModel,
    seatPrice,
    setSeatPrice,
    bidMin,
    setBidMin,
    bidMax,
    setBidMax,
    budget,
    setBudget,
    limits,
    quote,
    seatSplit,
    seatPriceError,
    bidMinError,
    bidMaxError,
    budgetError,
    pricingError,
  } = money;

  const options = useMemo<SegmentedOption<CampaignPricingModel>[]>(
    () => [
      { value: 'fixed', label: t('marketplace.campaign.wizard.money.pricing.fixed') },
      { value: 'bidding', label: t('marketplace.campaign.wizard.money.pricing.bidding') },
    ],
    [t],
  );

  const split =
    seatSplit && quote
      ? t(
          model === 'fixed'
            ? 'marketplace.campaign.wizard.money.seatPrice.split'
            : 'marketplace.campaign.wizard.money.bid.split',
          { fee: formatNumber(bpsShare(quote.feeBps), PERCENT), net: formatMoney(seatSplit.net) },
        )
      : undefined;

  const range = t('marketplace.campaign.wizard.money.seatPrice.note', {
    min: formatMoney({ amount: limits.seatPriceMin * 100, currency: 'USD' }, i18n.language, WHOLE_DOLLARS),
    max: formatMoney({ amount: limits.seatPriceMax * 100, currency: 'USD' }, i18n.language, WHOLE_DOLLARS),
  });

  return (
    <Box gap="lg">
      <Box gap="sm">
        <SegmentedControl
          options={options}
          value={model}
          onChange={chooseModel}
          accessibilityLabel={t('marketplace.campaign.wizard.money.pricing.label')}
        />
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t(
            model === 'fixed'
              ? 'marketplace.campaign.wizard.money.pricing.fixedHint'
              : 'marketplace.campaign.wizard.money.pricing.biddingHint',
          )}
        </Text>
      </Box>
      {model === 'fixed' ? (
        <CampaignField label={t('marketplace.campaign.wizard.money.seatPrice.label')} note={range}>
          <AmountInput
            size="lg"
            value={seatPrice}
            onChangeValue={setSeatPrice}
            currency="USD"
            error={seatPriceError}
            hint={split}
            returnKeyType="done"
            accessibilityLabel={t('marketplace.campaign.wizard.money.seatPrice.label')}
          />
        </CampaignField>
      ) : (
        <>
          <Box row gap="md" align="flex-start">
            <Box flex={1}>
              <CampaignField
                label={t('marketplace.campaign.wizard.money.bid.min')}
                note={t('marketplace.campaign.wizard.money.bid.minNote')}
              >
                <AmountInput
                  value={bidMin}
                  onChangeValue={setBidMin}
                  currency="USD"
                  error={bidMinError}
                  returnKeyType="done"
                  accessibilityLabel={t('marketplace.campaign.wizard.money.bid.min')}
                />
              </CampaignField>
            </Box>
            <Box flex={1}>
              <CampaignField
                label={t('marketplace.campaign.wizard.money.bid.max')}
                note={t('marketplace.campaign.wizard.money.bid.maxNote')}
              >
                <AmountInput
                  value={bidMax}
                  onChangeValue={setBidMax}
                  currency="USD"
                  error={bidMaxError}
                  returnKeyType="done"
                  accessibilityLabel={t('marketplace.campaign.wizard.money.bid.max')}
                />
              </CampaignField>
            </Box>
          </Box>
          {split ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {split}
            </Text>
          ) : null}
          <CampaignField
            label={t('marketplace.campaign.wizard.money.budget.label')}
            note={t('marketplace.campaign.wizard.money.budget.note')}
          >
            <AmountInput
              value={budget}
              onChangeValue={setBudget}
              currency="USD"
              error={budgetError}
              hint={t('marketplace.campaign.wizard.money.budget.hint')}
              returnKeyType="done"
              accessibilityLabel={t('marketplace.campaign.wizard.money.budget.label')}
            />
          </CampaignField>
        </>
      )}
      {pricingError ? <InlineError error={pricingError} /> : null}
    </Box>
  );
};

export const PricingField = memo(PricingFieldComponent);
