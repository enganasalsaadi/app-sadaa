import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Send, Trash2 } from 'lucide-react-native';
import { Box, ConfirmSheet, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useConfirmSheetDemo } from './hooks/useConfirmSheetDemo';

const ConfirmSheetDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { kind, openNeutral, openDanger, openNotice, close, confirm } =
    useConfirmSheetDemo();
  const isDanger = kind === 'danger';
  const isNotice = kind === 'notice';

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
      <CustomButton
        title={t('devShowcase.confirmSheet.openNotice')}
        onPress={openNotice}
        variant="outline"
      />

      <ConfirmSheet
        visible={kind !== null}
        onClose={close}
        title={t(
          isDanger
            ? 'devShowcase.confirmSheet.dangerTitle'
            : isNotice
              ? 'devShowcase.confirmSheet.noticeTitle'
              : 'devShowcase.confirmSheet.neutralTitle',
        )}
        body={t(
          isDanger
            ? 'devShowcase.confirmSheet.dangerBody'
            : isNotice
              ? 'devShowcase.confirmSheet.noticeBody'
              : 'devShowcase.confirmSheet.neutralBody',
        )}
        icon={
          isDanger ? (
            <Trash2 size={sizes.icon.md} color={colors.status.danger.main} />
          ) : isNotice ? (
            <Info size={sizes.icon.md} color={colors.interactive.main} />
          ) : (
            <Send size={sizes.icon.md} color={colors.interactive.main} />
          )
        }
        confirmLabel={t(isDanger ? 'common.delete' : isNotice ? 'common.ok' : 'common.confirm')}
        confirmVariant={isDanger ? 'danger' : isNotice ? 'secondary' : 'primary'}
        onConfirm={isNotice ? close : confirm}
        cancelLabel={isNotice ? undefined : t('common.cancel')}
      />
    </Box>
  );
};

export const ConfirmSheetDemo = memo(ConfirmSheetDemoComponent);
