import { useCallback, useMemo } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import { CAMPAIGN_MISSING_LABEL, CAMPAIGN_STEP_LABEL } from '../../../constants/campaignWizard';
import type { CampaignDetail } from '../../../types/campaign';
import type { CampaignWizardStep } from '../../../types/campaignDraft';
import { briefPreviewLines, missingByStep } from '../../../utils/campaignReview';
import { formatCampaignDate } from '../../../utils/campaignSchedule';
import { useCampaignWizard } from '../CampaignWizardContext';

export type ReviewRowKey = Exclude<CampaignWizardStep, 'review'> | 'brief';
export type ReviewRowState = 'done' | 'missing' | 'optional';

export interface ReviewRow {
  key: ReviewRowKey;
  title: string;
  line: string;
  state: ReviewRowState;
  actionLabel: string;
  a11yLabel: string;
}

export interface ReviewShortfall {
  balance: Money;
  max: Money;
  shortfall: Money;
}

const COMPACT = { notation: 'compact', maximumFractionDigits: 1 } as const;
const SEP = ' · ';

const ideaLine = (t: TFunction, campaign: CampaignDetail): string =>
  [
    campaign.cover
      ? t('marketplace.campaign.wizard.review.idea.withCover')
      : t('marketplace.campaign.wizard.review.idea.noCover'),
    campaign.activityType?.label,
  ]
    .filter(Boolean)
    .join(SEP);

const requirementsLine = (t: TFunction, campaign: CampaignDetail): string => {
  const parts = campaign.deliverables.map(line =>
    t('marketplace.campaign.wizard.review.requirements.line', { service: line.service.label, count: line.count }),
  );
  if (campaign.targeting.minFollowers) {
    parts.push(
      t('marketplace.campaign.wizard.review.requirements.followers', {
        count: formatNumber(campaign.targeting.minFollowers, COMPACT),
      }),
    );
  }
  parts.push(t('marketplace.campaign.wizard.review.requirements.shipping', { mode: campaign.shippingMode.label }));
  return parts.join(SEP);
};

const moneyLine = (t: TFunction, campaign: CampaignDetail): string => {
  const { model, seatPrice, bidMin, bidMax } = campaign.pricing;
  const parts: string[] = [];
  if (model.key === 'fixed' && seatPrice) {
    parts.push(t('marketplace.campaign.wizard.review.money.seat', { price: formatMoney(seatPrice) }));
  } else if (model.key === 'bidding' && bidMax) {
    parts.push(
      bidMin
        ? t('marketplace.campaign.wizard.review.money.bid', { min: formatMoney(bidMin), max: formatMoney(bidMax) })
        : t('marketplace.campaign.wizard.review.money.bidTop', { max: formatMoney(bidMax) }),
    );
  }
  parts.push(t('marketplace.campaign.wizard.review.money.seats', { count: campaign.seatsTotal }));
  if (campaign.dropAt !== null) {
    parts.push(t('marketplace.campaign.wizard.review.money.drop', { date: formatCampaignDate(campaign.dropAt) }));
  } else if (campaign.deliveryDays !== null) {
    parts.push(t('marketplace.campaign.wizard.review.money.delivery', { count: campaign.deliveryDays }));
  }
  return parts.join(SEP);
};

/**
 * The review step's content from the saved campaign (server labels, server `missing[]`): one row
 * per step with what it holds or what it still lacks, the private brief as an optional row, a few
 * locked brief lines, the wallet against the most that could be held, and the team's note when
 * they asked for changes.
 */
export const useCampaignReviewSummary = () => {
  const { t } = useTranslation();
  const { campaign, progress, brief, values, money, changesRequested, goToStep } = useCampaignWizard();
  const { entryCount, fileCount, openSheet } = brief;

  const openRow = useCallback(
    (key: ReviewRowKey) => {
      if (key === 'brief') openSheet();
      else goToStep(key).catch(() => undefined);
    },
    [goToStep, openSheet],
  );

  const rows = useMemo<ReviewRow[]>(() => {
    if (!campaign) return [];
    const missing = missingByStep(campaign.missing);
    const stepRow = (key: Exclude<CampaignWizardStep, 'review'>, line: string): ReviewRow => {
      const title = t(CAMPAIGN_STEP_LABEL[key]);
      const incomplete = progress.steps[key] === 'incomplete';
      const known = missing[key].map(reason => t(CAMPAIGN_MISSING_LABEL[reason]));
      let shown = line;
      if (incomplete) {
        shown = known.length > 0
          ? t('marketplace.campaign.wizard.review.missing', { items: known.join(SEP) })
          : t('marketplace.campaign.wizard.review.missingSome');
      }
      return {
        key,
        title,
        line: shown,
        state: incomplete ? 'missing' : 'done',
        actionLabel: incomplete
          ? t('marketplace.campaign.wizard.review.complete')
          : t('marketplace.campaign.wizard.review.edit'),
        a11yLabel: t('marketplace.campaign.wizard.review.editA11y', { label: title }),
      };
    };

    const briefTitle = t('marketplace.campaign.wizard.requirements.brief.title');
    const briefParts: string[] = [];
    if (entryCount > 0) briefParts.push(t('marketplace.campaign.wizard.requirements.brief.items', { count: entryCount }));
    if (fileCount > 0) briefParts.push(t('marketplace.campaign.wizard.requirements.brief.files', { count: fileCount }));

    return [
      stepRow('idea', ideaLine(t, campaign)),
      stepRow('requirements', requirementsLine(t, campaign)),
      stepRow('money', moneyLine(t, campaign)),
      {
        key: 'brief',
        title: briefTitle,
        line: briefParts.length > 0 ? briefParts.join(SEP) : t('marketplace.campaign.wizard.review.brief.empty'),
        state: 'optional',
        actionLabel: t('marketplace.campaign.wizard.review.edit'),
        a11yLabel: t('marketplace.campaign.wizard.review.editA11y', { label: briefTitle }),
      },
    ];
  }, [campaign, entryCount, fileCount, progress.steps, t]);

  const briefLines = useMemo(() => briefPreviewLines(values.privateBrief), [values.privateBrief]);

  const wallet = money.quote?.wallet;
  const max = money.quote?.totalGross.max ?? null;
  const shortfall: ReviewShortfall | null =
    wallet && max && wallet.shortfall.amount > 0
      ? { balance: wallet.balance, max, shortfall: wallet.shortfall }
      : null;

  return {
    rows,
    openRow,
    ready: progress.ready,
    briefLines,
    shortfall,
    /** The team's note, shown while they wait for the brand's changes. */
    reviewNote: changesRequested ? (campaign?.reviewNote ?? null) : null,
  };
};
