import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DEAL_RETENTION_LABEL } from '../constants/dealCopy';
import { DEFAULT_DEAL_WINDOWS } from '../constants/dealOffer';
import type { DealCommitLine } from '../components/DealCommitSlip';
import type { Deal } from '../types';
import { formatDuration } from '../utils/offerDuration';
import { dealCommitments, dealExtensionAsk } from '../utils/dealRespond';

/**
 * The words on the slips signed in P4: what the creator commits to on accept (deliverables,
 * delivery, the terms every item shares) and what the brand approves with an extension.
 */
export const useDealSlipCopy = (deal: Deal) => {
  const { t } = useTranslation();
  return useMemo(() => {
    const commitments = dealCommitments(deal);
    const caption = t('marketplace.deals.respond.slip.value', {
      items: t('marketplace.offer.units.deliverables', {
        count: deal.items.length,
      }),
    });

    const accept: DealCommitLine[] = [
      {
        key: 'items',
        title: commitments.lines
          .map(({ title, count }) =>
            t('marketplace.deals.respond.slip.times', { title, count }),
          )
          .join(' · '),
      },
    ];
    if (commitments.deliveryHours !== null) {
      accept.push({
        key: 'delivery',
        title: t('marketplace.deals.respond.accept.delivery', {
          duration: formatDuration(t, commitments.deliveryHours),
        }),
        detail: commitments.hasProduct
          ? t('marketplace.deals.respond.accept.afterProduct')
          : undefined,
      });
    }
    if (commitments.revisions !== null) {
      accept.push({
        key: 'revisions',
        title: t('marketplace.deals.respond.slip.perItem', {
          value: t('marketplace.offer.units.revisions', {
            count: commitments.revisions,
          }),
        }),
      });
    }
    if (commitments.retention !== null) {
      accept.push({
        key: 'retention',
        title: t(DEAL_RETENTION_LABEL[commitments.retention]),
      });
    }

    const ask = dealExtensionAsk(deal);
    const approve: DealCommitLine[] = [
      ...(ask
        ? [
            {
              key: 'delivery',
              title: t('marketplace.deals.respond.approve.newDelivery', {
                duration: formatDuration(t, ask.toHours),
              }),
            },
          ]
        : []),
      {
        key: 'shortfall',
        title: t('marketplace.deals.respond.approve.shortfall', {
          duration: formatDuration(t, DEFAULT_DEAL_WINDOWS.paymentTopUpHours),
        }),
      },
    ];

    return {
      caption,
      accept,
      approve,
      askDuration: ask ? formatDuration(t, ask.toHours) : null,
    };
  }, [deal, t]);
};
