import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';
import { formatMoney, formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { AmountInput, Box, Card, IconButton, KeyValueRow, MoneyText, Text } from '@/shared/ui';
import type { CreatorCampaignPricing } from '../../../types/campaign';
import { BID_MIN, rulerPosition } from '../../../utils/campaignApply';
import type { CampaignApplyModel } from '../hooks/useCampaignApply';
import { ApplyBidRail } from './ApplyBidRail';

export interface ApplyPriceSectionProps {
  pricing: CreatorCampaignPricing;
  apply: CampaignApplyModel;
}

const BPS_PER_PERCENT = 100;

/** A fixed price only shows what the creator gets; a bid is typed (or stepped) against the ruler. */
const FixedPrice = memo<{ pricing: CreatorCampaignPricing }>(({ pricing }) => {
  const { t } = useTranslation();
  const { fixed, feeBps } = pricing;
  if (!fixed) return null;
  return (
    <Card p="lg">
      <Box gap="xs">
        <KeyValueRow
          label={t('marketplace.campaign.opportunity.net.campaignPrice')}
          value={<MoneyText value={fixed.gross} size="sm" />}
        />
        <KeyValueRow
          label={t('marketplace.campaign.opportunity.net.fee', { percent: formatNumber(feeBps / BPS_PER_PERCENT) })}
          value={<MoneyText value={fixed.fee} size="sm" />}
        />
        <KeyValueRow
          label={t('marketplace.campaign.apply.price.fixedNet')}
          value={<MoneyText value={fixed.net} size="md" tone="money" />}
          emphasis="strong"
        />
      </Box>
    </Card>
  );
});

const BidPrice = memo<{ apply: CampaignApplyModel }>(({ apply }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { bid, max, suggested, net, bidError, setBid, stepBid, feeBps } = apply;
  const down = useCallback(() => stepBid(-1), [stepBid]);
  const up = useCallback(() => stepBid(1), [stepBid]);
  if (!max || !suggested) return null;
  const position = bid ? rulerPosition(bid.amount, max) : 0;
  const invalid = bidError !== null;
  return (
    <Card p="lg">
      <Box gap="md">
        <Box row align="flex-start" gap="md">
          <Box pt="xs">
            <IconButton
              icon={Minus}
              variant="soft"
              accessibilityLabel={t('marketplace.campaign.apply.bid.decrease')}
              onPress={down}
              disabled={!bid || bid.amount <= BID_MIN.amount}
            />
          </Box>
          <Box flex={1}>
            <AmountInput
              value={bid}
              onChangeValue={setBid}
              currency={max.currency}
              error={bidError ?? undefined}
              accessibilityLabel={t('marketplace.campaign.apply.bid.a11y')}
              placeholder={t('marketplace.campaign.apply.bid.placeholder')}
            />
          </Box>
          <Box pt="xs">
            <IconButton
              icon={Plus}
              variant="soft"
              accessibilityLabel={t('marketplace.campaign.apply.bid.increase')}
              onPress={up}
              disabled={!bid || bid.amount >= max.amount}
            />
          </Box>
        </Box>
        <ApplyBidRail position={position} suggestedFrom={rulerPosition(suggested.amount, max)} invalid={invalid} />
        <Box row align="center" justify="space-between" gap="sm">
          <Text variant="caption" color={colors.text.tertiary}>
            {formatMoney(BID_MIN, i18n.language)}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.apply.bid.suggested', { amount: formatMoney(suggested, i18n.language) })}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {formatMoney(max, i18n.language)}
          </Text>
        </Box>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.campaign.apply.bid.hint', {
            max: formatMoney(max, i18n.language),
            min: formatMoney(BID_MIN, i18n.language),
          })}
        </Text>
        <Box row align="center" justify="space-between" gap="md" p="md" borderRadius="md" bg={colors.surface.elevated}>
          <Box flex={1} gap="xs">
            <Box row align="center" gap="sm">
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t(net ? 'marketplace.campaign.apply.net.label' : 'marketplace.campaign.apply.net.blocked')}
              </Text>
              <Box px="sm" borderRadius="full" bg={colors.brand.soft}>
                <Text variant="label" color={colors.brand.text}>
                  {t('marketplace.campaign.apply.estimate')}
                </Text>
              </Box>
            </Box>
            {net ? (
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.campaign.apply.net.fee', {
                  percent: formatNumber(feeBps / BPS_PER_PERCENT),
                  fee: formatMoney(net.fee, i18n.language),
                })}
              </Text>
            ) : null}
          </Box>
          {net ? (
            <MoneyText value={net.net} size="lg" tone="money" />
          ) : (
            <Text variant="h3" color={colors.text.tertiary}>
              —
            </Text>
          )}
        </Box>
      </Box>
    </Card>
  );
});

const ApplyPriceSectionComponent: React.FC<ApplyPriceSectionProps> = ({ pricing, apply }) =>
  apply.isBid ? <BidPrice apply={apply} /> : <FixedPrice pricing={pricing} />;

export const ApplyPriceSection = memo(ApplyPriceSectionComponent);
