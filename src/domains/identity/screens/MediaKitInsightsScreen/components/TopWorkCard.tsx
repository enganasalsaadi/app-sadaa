import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { ListGroup, ListRow } from '@/shared/ui';
import type { MediaKitStats } from '../../../types/mediaKit';

interface TopWorkCardProps {
  items: MediaKitStats['top_portfolio_items'];
}

/** Portfolio items by clicks (§17.7). Empty until the portfolio ships; the screen hides it then. */
const TopWorkCardComponent: React.FC<TopWorkCardProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <ListGroup title={t('account.mediaKit.insightsScreen.topWork.title')}>
      {items.map(item => (
        <ListRow
          key={item.id}
          title={item.title}
          value={t('account.mediaKit.insightsScreen.topWork.clicks', {
            count: formatNumber(item.clicks),
          })}
          trailing={null}
        />
      ))}
    </ListGroup>
  );
};

export const TopWorkCard = memo(TopWorkCardComponent);
