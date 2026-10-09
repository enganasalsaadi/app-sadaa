import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, ChipGroup, FormSection, KeyValueRow, Text } from '@/shared/ui';
import type { RateCardEditorModel } from '../hooks/useRateCardEditorScreen';

interface Props {
  vm: RateCardEditorModel;
}

/** Create: where (platform or in person) and what (service). Only slots still free are offered. */
export const RateCardPickers: React.FC<Props> = memo(({ vm }) => {
  const { t } = useTranslation();

  return (
    <Box gap="3xl">
      <Controller
        control={vm.control}
        name="group"
        render={({ field: { value }, fieldState }) => (
          <FormSection title={t('account.rates.editor.platform')} error={fieldState.error?.message}>
            <ChipGroup
              items={vm.groupItems}
              value={value}
              onChange={vm.onPickGroup}
              accessibilityLabel={t('account.rates.editor.platform')}
            />
          </FormSection>
        )}
      />
      {vm.serviceItems.length > 0 ? (
        <Controller
          control={vm.control}
          name="service"
          render={({ field: { value }, fieldState }) => (
            <FormSection title={t('account.rates.editor.service')} error={fieldState.error?.message}>
              <ChipGroup
                items={vm.serviceItems}
                value={value}
                onChange={vm.onPickService}
                accessibilityLabel={t('account.rates.editor.service')}
              />
            </FormSection>
          )}
        />
      ) : null}
    </Box>
  );
});

/** Edit: platform and service are fixed once saved (PATCH rejects them). */
export const RateCardLockedSummary: React.FC<{ group: string; service: string }> = memo(
  ({ group, service }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
      <Box gap="sm">
        <Card px="lg" py="sm">
          <KeyValueRow label={t('account.rates.editor.platform')} value={group} />
          <KeyValueRow label={t('account.rates.editor.service')} value={service} />
        </Card>
        <Text variant="caption" color={colors.text.secondary}>
          {t('account.rates.editor.lockedHint')}
        </Text>
      </Box>
    );
  },
);
