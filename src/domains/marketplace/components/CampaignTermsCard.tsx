import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  Clapperboard,
  Gift,
  Lock,
  MapPin,
  PencilLine,
  ShieldCheck,
  Target,
  Wallet,
} from 'lucide-react-native';
import { useLookupItems, type LookupItem } from '@/core/api';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Tag, Text } from '@/shared/ui';
import type { CampaignDetail } from '../types/campaign';
import type { CampaignTermsState } from '../utils/campaignDetail';
import { formatCampaignDate, formatCampaignTime } from '../utils/campaignSchedule';
import { CampaignTermTile } from './CampaignTermTile';

const COMPACT = { notation: 'compact', maximumFractionDigits: 1 } as const;

const labelsOf = (values: readonly string[], items: readonly LookupItem[]): string[] =>
  values.map(value => items.find(item => item.value === value)?.label ?? value);

export interface CampaignTermsCardProps {
  campaign: Pick<
    CampaignDetail,
    'deliverables' | 'targeting' | 'shippingMode' | 'dropAt' | 'deliveryDays' | 'applyDeadlineAt' | 'pricing' | 'budgetSecured'
  >;
  state: CampaignTermsState;
  /** Opens the wizard on the terms; only an `editable` state offers it. */
  onEdit: () => void;
}

/**
 * What the campaign asks of a creator and pays, as tiles: the deliverables first, then the price
 * (the one mint tile), the dates, the audience, where it ranks and what ships. The chip at the
 * title says whether the terms can still change: edit, locked by the first application, or
 * fixed while the team reviews.
 */
const CampaignTermsCardComponent: React.FC<CampaignTermsCardProps> = ({ campaign, state, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const governorates = useLookupItems('governorates').items;
  const niches = useLookupItems('niches').items;
  const { deliverables, targeting, shippingMode, dropAt, deliveryDays, applyDeadlineAt, pricing, budgetSecured } = campaign;
  const price = pricing.seatPrice ?? pricing.bidMax;
  const priority = useMemo(
    () => [...labelsOf(targeting.cities, governorates), ...labelsOf(targeting.niches, niches)],
    [governorates, niches, targeting.cities, targeting.niches],
  );

  const half = [
    <CampaignTermTile
      key="price"
      icon={Wallet}
      tone="money"
      label={t(pricing.seatPrice || price === null ? 'marketplace.campaign.detail.seats.price' : 'marketplace.campaign.detail.seats.bidMax')}
    >
      {price ? (
        <MoneyText value={price} size="title" tone="money" />
      ) : (
        <Text variant="amountTitle" color={colors.money.text}>
          {'—'}
        </Text>
      )}
      <Box row align="center" gap="xs">
        {price && budgetSecured ? (
          <ShieldCheck size={sizes.icon.xs} color={colors.money.text} strokeWidth={iconStroke.bold} />
        ) : null}
        <Text variant="caption" color={colors.money.text}>
          {price === null
            ? t('marketplace.campaign.detail.terms.noPrice')
            : budgetSecured
              ? t('marketplace.campaign.list.secured')
              : pricing.model.label}
        </Text>
      </Box>
    </CampaignTermTile>,
    applyDeadlineAt === null ? null : (
      <CampaignTermTile key="deadline" icon={CalendarClock} label={t('marketplace.campaign.detail.terms.deadline')}>
        <Text variant="title" color={colors.text.primary}>
          {formatCampaignDate(applyDeadlineAt)}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {formatCampaignTime(applyDeadlineAt)}
        </Text>
      </CampaignTermTile>
    ),
    dropAt === null && deliveryDays === null ? null : (
      <CampaignTermTile key="schedule" icon={CalendarClock} label={t('marketplace.campaign.detail.terms.schedule')}>
        {dropAt !== null ? (
          <>
            <Text variant="title" color={colors.text.primary}>
              {formatCampaignDate(dropAt)}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.campaign.detail.terms.drop', { date: formatCampaignTime(dropAt) })}
            </Text>
          </>
        ) : (
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t('marketplace.campaign.wizard.review.money.delivery', { count: deliveryDays ?? 0 })}
          </Text>
        )}
      </CampaignTermTile>
    ),
    <CampaignTermTile key="audience" icon={Target} label={t('marketplace.campaign.detail.terms.targeting')}>
      {targeting.minFollowers ? (
        <>
          <Text variant="amountTitle" color={colors.text.primary}>
            {`+${formatNumber(targeting.minFollowers, COMPACT)}`}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.detail.terms.followersMin')}
          </Text>
        </>
      ) : (
        <Text variant="bodyMedium" color={colors.text.primary}>
          {t('marketplace.campaign.detail.terms.anyone')}
        </Text>
      )}
    </CampaignTermTile>,
  ].filter((tile): tile is React.JSX.Element => tile !== null);

  const rows: React.JSX.Element[][] = [];
  for (let index = 0; index < half.length; index += 2) rows.push(half.slice(index, index + 2));

  return (
    <Box gap="md">
      <Box row align="center" gap="md" minHeight={sizes.button.md}>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} accessibilityRole="header">
            {t('marketplace.campaign.detail.terms.title')}
          </Text>
        </Box>
        {state === 'review' || state === 'locked' ? (
          <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.surface.elevated}>
            <Lock size={sizes.icon.xs} color={colors.text.secondary} strokeWidth={iconStroke.bold} />
            <Text variant="caption" color={colors.text.secondary}>
              {t(
                state === 'review'
                  ? 'marketplace.campaign.detail.terms.lockedReview'
                  : 'marketplace.campaign.detail.terms.locked',
              )}
            </Text>
          </Box>
        ) : null}
        {state === 'editable' ? (
          <Pressable
            row
            align="center"
            gap="xs"
            px="md"
            minHeight={sizes.button.md}
            borderRadius="full"
            hitSlop={sizes.hitSlop.sm}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.campaign.detail.terms.edit')}
          >
            <PencilLine size={sizes.icon.xs} color={colors.interactive.text} strokeWidth={iconStroke.bold} />
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t('marketplace.campaign.detail.terms.edit')}
            </Text>
          </Pressable>
        ) : null}
      </Box>
      <CampaignTermTile icon={Clapperboard} label={t('marketplace.campaign.detail.terms.deliverables')}>
        <Box gap="sm">
          {deliverables.map(line => (
            <Box key={line.id} row align="center" gap="md">
              <Box flex={1}>
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {line.service.label}
                </Text>
                <Text variant="caption" color={colors.text.tertiary}>
                  {line.platform.label}
                </Text>
              </Box>
              {line.revisions > 0 ? (
                <Box px="sm" py="xs" borderRadius="sm" bg={colors.surface.elevated}>
                  <Text variant="caption" color={colors.text.secondary}>
                    {t('marketplace.campaign.detail.terms.revisions', { count: line.revisions })}
                  </Text>
                </Box>
              ) : null}
              <Text variant="amountTitle" color={colors.text.primary}>
                {`×${formatNumber(line.count)}`}
              </Text>
            </Box>
          ))}
        </Box>
      </CampaignTermTile>
      {rows.map(row => (
        <Box key={row.map(tile => tile.key).join('+')} row gap="md">
          {row}
        </Box>
      ))}
      {priority.length > 0 ? (
        <CampaignTermTile icon={MapPin} label={t('marketplace.campaign.detail.terms.priority')}>
          <Box row wrap gap="sm">
            {priority.map(entry => (
              <Tag key={entry} label={entry} />
            ))}
          </Box>
        </CampaignTermTile>
      ) : null}
      <CampaignTermTile icon={Gift} label={t('marketplace.campaign.detail.terms.shipping')}>
        <Text variant="bodyMedium" color={colors.text.primary}>
          {shippingMode.label}
        </Text>
      </CampaignTermTile>
    </Box>
  );
};

export const CampaignTermsCard = memo(CampaignTermsCardComponent);
