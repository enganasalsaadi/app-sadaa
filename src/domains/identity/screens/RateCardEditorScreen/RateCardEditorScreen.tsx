import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  Layout,
  LayoutFooter,
  Notice,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { ProfileFormSkeleton } from '../../components/ProfileFormSkeleton';
import { RateCardLockedSummary, RateCardPickers } from './components/RateCardPickers';
import {
  RateCardIncludes,
  RateCardRushFields,
  RateCardServiceFields,
} from './components/RateCardServiceFields';
import { useRateCardEditorScreen, type RateCardEditorModel } from './hooks/useRateCardEditorScreen';

const RateCardForm: React.FC<{ vm: RateCardEditorModel }> = memo(({ vm }) => {
  const { t } = useTranslation();

  if (vm.noFreeSlot) {
    return <Notice tone="info" message={t('account.rates.editor.noFreeSlot')} />;
  }
  return (
    <Box gap="3xl" pb="xl">
      {vm.locked ? (
        <RateCardLockedSummary group={vm.locked.group} service={vm.locked.service} />
      ) : (
        <RateCardPickers vm={vm} />
      )}
      <RateCardServiceFields vm={vm} />
      <RateCardRushFields vm={vm} />
      <RateCardIncludes includes={vm.includes} />
    </Box>
  );
});

/** Detail/form archetype: one price slot; saving is the one primary action, delete sits in the header. */
const RateCardEditorScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useRateCardEditorScreen();
  useHideBottomBar();

  const ready = !vm.isLoading && !vm.isError && !vm.isNotFound && !vm.noFreeSlot;
  const body = vm.isLoading ? (
    <ProfileFormSkeleton fields={2} />
  ) : vm.isError ? (
    <ErrorState error={vm.error} onRetry={vm.retry} retrying={vm.isRetrying} />
  ) : vm.isNotFound ? (
    <EmptyState
      icon={SearchX}
      title={t('account.rates.editor.notFound')}
      action={{ label: t('common.back'), onPress: vm.goBack, variant: 'secondary' }}
    />
  ) : (
    <RateCardForm vm={vm} />
  );

  return (
    <>
      <Layout
        header={{
          title: t(vm.isEdit ? 'account.rates.editor.editTitle' : 'account.rates.editor.newTitle'),
          actions:
            vm.isEdit && ready
              ? [{ icon: Trash2, accessibilityLabel: t('account.rates.editor.delete'), onPress: vm.deleteSheet.onOpen }]
              : undefined,
        }}
        footer={
          ready ? (
            <LayoutFooter
              primary={{ label: t('account.rates.editor.save'), onPress: vm.onSave, loading: vm.isSaving }}
            />
          ) : undefined
        }
      >
        {body}
      </Layout>

      <ConfirmSheet
        visible={vm.deleteSheet.visible}
        onClose={vm.deleteSheet.onClose}
        icon={<Trash2 size={sizes.icon.lg} color={colors.status.danger.main} />}
        title={t('account.rates.editor.deleteTitle')}
        body={t('account.rates.editor.deleteBody')}
        confirmLabel={t('account.rates.editor.delete')}
        confirmVariant="danger"
        onConfirm={vm.deleteSheet.onConfirm}
        confirmLoading={vm.deleteSheet.loading}
        cancelLabel={t('common.cancel')}
      />
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const RateCardEditorScreen = memo(RateCardEditorScreenComponent);
