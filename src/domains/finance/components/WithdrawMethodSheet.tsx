import React, { memo, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, ListGroup, ListRow, Pressable, Text } from '@/shared/ui';
import { channelCurrenciesKey } from '../constants/paymentChannels';
import type { PayoutMethodView } from '../utils/payoutMethodView';

interface WithdrawMethodSheetProps {
  visible: boolean;
  onClose: () => void;
  views: readonly PayoutMethodView[];
  selectedId: string | null;
  onPick: (id: string) => void;
  /** Called once the sheet is gone, so the channel sheet never races its dismissal. */
  onAdd: () => void;
}

interface MethodOptionProps {
  view: PayoutMethodView;
  selected: boolean;
  onChoose: (id: string) => void;
}

const MethodOption = memo<MethodOptionProps>(({ view, selected, onChoose }) => {
  const { t } = useTranslation();
  const { id } = view;
  const press = useCallback(() => onChoose(id), [id, onChoose]);
  const currencies = t(channelCurrenciesKey(view.currencies));
  return (
    <ListRow
      icon={view.icon}
      title={view.title}
      subtitle={view.meta ? `${view.meta} · ${currencies}` : currencies}
      onPress={press}
      selected={selected}
    />
  );
});

/** "Where should we send it?": the saved methods as radio rows, then "Add payout method". */
const WithdrawMethodSheetComponent: React.FC<WithdrawMethodSheetProps> = ({
  visible,
  onClose,
  views,
  selectedId,
  onPick,
  onAdd,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  }));
  const adding = useRef(false);

  const choose = useCallback(
    (id: string) => {
      onPick(id);
      onClose();
    },
    [onClose, onPick],
  );

  const add = useCallback(() => {
    adding.current = true;
    onClose();
  }, [onClose]);

  const onDismissed = useCallback(() => {
    if (!adding.current) return;
    adding.current = false;
    onAdd();
  }, [onAdd]);

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="h4" accessibilityRole="header">
          {t('finance.withdraw.methodSheet.title')}
        </Text>
        <ListGroup>
          {views.map(view => (
            <MethodOption key={view.id} view={view} selected={view.id === selectedId} onChoose={choose} />
          ))}
        </ListGroup>
        <Pressable
          onPress={add}
          row
          align="center"
          justify="center"
          gap="xs"
          minHeight={sizes.button.md}
          accessibilityRole="button"
          accessibilityLabel={t('finance.withdraw.methodSheet.add')}
        >
          <Plus size={sizes.icon.sm} color={colors.interactive.main} />
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('finance.withdraw.methodSheet.add')}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
};

export const WithdrawMethodSheet = memo(WithdrawMethodSheetComponent);
