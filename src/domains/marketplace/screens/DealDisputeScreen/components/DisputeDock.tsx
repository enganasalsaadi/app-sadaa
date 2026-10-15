import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Undo2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';

export interface DisputeDockProps {
  canAdd: boolean;
  /** The window is open but the viewer's side has used every entry. */
  full: boolean;
  canWithdraw: boolean;
  onAdd: () => void;
  onWithdraw: () => void;
}

/** Add a piece of evidence while the window is open; the opener may also withdraw (low, red). */
const DisputeDockComponent: React.FC<DisputeDockProps> = ({ canAdd, full, canWithdraw, onAdd, onWithdraw }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box px="xl" pt="md" pb="md" gap="sm">
      {full ? (
        <Text variant="caption" color={colors.text.tertiary} align="center">
          {t('marketplace.deals.dispute.dock.full')}
        </Text>
      ) : null}
      {canAdd ? (
        <CustomButton
          title={t('marketplace.deals.dispute.dock.add')}
          size="lg"
          fullWidth
          leftIcon={<Plus size={sizes.icon.sm} color={colors.button.primary.text} />}
          onPress={onAdd}
        />
      ) : null}
      {canWithdraw ? (
        <Pressable
          onPress={onWithdraw}
          row
          align="center"
          justify="center"
          gap="xs"
          minHeight={sizes.iconButton.md}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.dispute.dock.withdraw')}
        >
          <Undo2 size={sizes.icon.xs} color={colors.status.danger.main} />
          <Text variant="buttonSmall" color={colors.status.danger.text}>
            {t('marketplace.deals.dispute.dock.withdraw')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DisputeDock = memo(DisputeDockComponent);
