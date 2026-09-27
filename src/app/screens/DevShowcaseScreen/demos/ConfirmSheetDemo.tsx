import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2 } from 'lucide-react-native';
import { Box, ConfirmSheet, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useConfirmSheetDemo } from './hooks/useConfirmSheetDemo';

const ConfirmSheetDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { kind, openNeutral, openDanger, close, confirm } =
    useConfirmSheetDemo();
  const isDanger = kind === 'danger';

  return (
    <Box row wrap gap="sm">
      <CustomButton
        title={t('devShowcase.confirmSheet.openNeutral')}
        onPress={openNeutral}
        variant="outline"
      />
      <CustomButton
        title={t('devShowcase.confirmSheet.openDanger')}
        onPress={openDanger}
        variant="outline"
      />

      <ConfirmSheet
        visible={kind !== null}
        onClose={close}
        title={t(
          isDanger
            ? 'devShowcase.confirmSheet.dangerTitle'
            : 'devShowcase.confirmSheet.neutralTitle',
        )}
        body={t(
          isDanger
            ? 'devShowcase.confirmSheet.dangerBody'
            : 'devShowcase.confirmSheet.neutralBody',
        )}
        icon={
          isDanger ? (
            <Trash2 size={sizes.icon.md} color={colors.status.danger.main} />
          ) : (
            <Send size={sizes.icon.md} color={colors.interactive.main} />
          )
        }
        confirmLabel={t(isDanger ? 'common.delete' : 'common.confirm')}
        confirmVariant={isDanger ? 'danger' : 'primary'}
        onConfirm={confirm}
        cancelLabel={t('common.cancel')}
      />
    </Box>
  );
};

export const ConfirmSheetDemo = memo(ConfirmSheetDemoComponent);
