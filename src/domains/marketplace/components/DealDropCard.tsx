import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Radio } from 'lucide-react-native';
import { Notice } from '@/shared/ui';
import type { DealRole } from '../types';
import type { DealDropModel } from '../hooks/useDealDrop';

export interface DealDropCardProps {
  drop: DealDropModel;
  role: DealRole;
}

/**
 * The drop of a linked deal on its page (PC6.3): everyone posts at the same moment, and the live
 * link opens a few minutes before. One notice that follows the clock: waiting, live link open,
 * past; behind schedule turns amber for both sides (the server's grace decides what comes next).
 */
const DealDropCardComponent: React.FC<DealDropCardProps> = ({ drop, role }) => {
  const { t } = useTranslation();
  const { view, remaining, when } = drop;
  const time = remaining ?? '';

  if (view.late) {
    return (
      <Notice
        tone="warning"
        icon={Radio}
        title={t('marketplace.deals.drop.late.title')}
        message={role === 'creator' ? t('marketplace.deals.drop.late.creator') : t('marketplace.deals.drop.late.brand')}
      />
    );
  }
  switch (view.phase) {
    case 'upcoming':
      return (
        <Notice
          tone="info"
          icon={Megaphone}
          title={t('marketplace.deals.drop.upcoming.title', { date: when })}
          message={
            role === 'creator'
              ? t('marketplace.deals.drop.upcoming.creator', { time })
              : t('marketplace.deals.drop.upcoming.brand', { time })
          }
        />
      );
    case 'publish_open':
      return (
        <Notice
          tone="success"
          icon={Radio}
          title={t('marketplace.deals.drop.open.title', { time })}
          message={role === 'creator' ? t('marketplace.deals.drop.open.creator') : t('marketplace.deals.drop.open.brand')}
        />
      );
    case 'live':
      return (
        <Notice
          tone="info"
          icon={Megaphone}
          title={t('marketplace.deals.drop.live.title')}
          message={t('marketplace.deals.drop.live.body', { date: when })}
        />
      );
    default: {
      const _exhaustive: never = view.phase;
      return _exhaustive;
    }
  }
};

export const DealDropCard = memo(DealDropCardComponent);
