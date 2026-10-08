import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { ListGroup, ListRow, MoneyText } from '@/shared/ui';
import type { RateCardGroupView, RateCardListRow } from '../hooks/useRateCardsScreen';

interface RateRowItemProps {
  row: RateCardListRow;
  onPress: (cardId: string) => void;
}

const RateRowItem: React.FC<RateRowItemProps> = memo(({ row, onPress }) => {
  const handlePress = useCallback(() => onPress(row.id), [onPress, row.id]);
  const title = row.packageLabel ? `${row.serviceLabel} · ${row.packageLabel}` : row.serviceLabel;
  return (
    <ListRow
      title={title}
      trailing={<MoneyText value={row.price} />}
      onPress={handlePress}
      accessibilityLabel={`${title}, ${formatMoney(row.price)}`}
    />
  );
});

interface RateGroupSectionProps {
  group: RateCardGroupView;
  onOpenCard: (cardId: string) => void;
  onAdd: (group: string) => void;
}

/** One platform (or the in-person group): its priced slots, or a nudge to add the first. */
const RateGroupSectionComponent: React.FC<RateGroupSectionProps> = ({ group, onOpenCard, onAdd }) => {
  const { t } = useTranslation();
  const title = group.label ?? t('account.rates.inPerson');
  const add = useCallback(() => onAdd(group.key), [group.key, onAdd]);

  return (
    <ListGroup
      title={title}
      action={group.canAdd && group.rows.length > 0 ? { label: t('account.rates.add'), onPress: add } : undefined}
    >
      {group.rows.length > 0 ? (
        group.rows.map(row => <RateRowItem key={row.id} row={row} onPress={onOpenCard} />)
      ) : (
        <ListRow
          icon={Plus}
          title={t('account.rates.groupEmpty')}
          subtitle={t('account.rates.addFor', { group: title })}
          onPress={group.canAdd ? add : undefined}
        />
      )}
    </ListGroup>
  );
};

export const RateGroupSection = memo(RateGroupSectionComponent);
