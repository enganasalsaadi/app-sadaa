import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { Notice } from '@/shared/ui';
import type { DealBriefExitModel } from '../hooks/useDealBriefExit';

const UNTIL_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
};

export interface DealBriefExitCardProps {
  exit: DealBriefExitModel;
}

/**
 * Top of a funded linked deal for the creator (PC6.2): the brief just opened, and until the window
 * ends there is a way out with no strike. Quiet by design: it informs and offers, never nags.
 */
const DealBriefExitCardComponent: React.FC<DealBriefExitCardProps> = ({ exit }) => {
  const { t, i18n } = useTranslation();
  return (
    <Notice
      tone="info"
      title={t('marketplace.deals.briefExit.card.title')}
      message={
        exit.until === null
          ? t('marketplace.deals.briefExit.card.bodyOpen')
          : t('marketplace.deals.briefExit.card.body', {
              until: formatDate(exit.until, UNTIL_FORMAT, i18n.language),
            })
      }
      action={{ label: t('marketplace.deals.briefExit.card.action'), onPress: exit.open }}
    />
  );
};

export const DealBriefExitCard = memo(DealBriefExitCardComponent);
