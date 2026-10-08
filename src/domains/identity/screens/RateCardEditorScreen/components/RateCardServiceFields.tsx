import React, { memo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { DEFAULT_CURRENCY } from '@/core/config';
import { useTheme } from '@/core/theme';
import {
  AmountInput,
  Box,
  ChipGroup,
  FormSection,
  NumberStepper,
  Switch,
  Text,
} from '@/shared/ui';
import type { RateCardEditorModel } from '../hooks/useRateCardEditorScreen';

interface Props {
  vm: RateCardEditorModel;
}

/** Package, price and the three criteria of the picked service (labels from the catalog). */
export const RateCardServiceFields: React.FC<Props> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { service, control } = vm;
  if (!service) return null;
  const { criteria } = service;
  const pkg = service.package;

  return (
    <Box gap="3xl">
      {pkg ? (
        <Controller
          control={control}
          name="packageValue"
          render={({ field: { value, onChange }, fieldState }) => (
            <FormSection title={pkg.label} error={fieldState.error?.message}>
              <ChipGroup items={vm.packageItems} value={value} onChange={onChange} accessibilityLabel={pkg.label} />
            </FormSection>
          )}
        />
      ) : null}

      <Controller
        control={control}
        name="price"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <AmountInput
            ref={ref}
            label={t('account.rates.editor.price')}
            placeholder={t('auth.influencerOnboarding.rates.pricePlaceholder')}
            value={value}
            onChangeValue={onChange}
            onBlur={onBlur}
            currency={DEFAULT_CURRENCY}
            returnKeyType="done"
            error={fieldState.error?.message}
          />
        )}
      />

      <FormSection title={t('account.rates.editor.details')}>
        <Box gap="xl">
          <Controller
            control={control}
            name="deliveryDays"
            render={({ field: { value, onChange }, fieldState }) => (
              <Box gap="sm">
                <Box row align="center" justify="space-between" gap="md">
                  <Text variant="bodyMedium">{criteria.delivery_days.label}</Text>
                  <NumberStepper
                    value={value}
                    onChange={onChange}
                    min={criteria.delivery_days.min}
                    max={criteria.delivery_days.max}
                    formatValue={vm.formatDays}
                    accessibilityLabel={criteria.delivery_days.label}
                  />
                </Box>
                {fieldState.error?.message ? (
                  <Text variant="caption" color={colors.status.danger.text}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </Box>
            )}
          />
          <Controller
            control={control}
            name="revisions"
            render={({ field: { value, onChange } }) => (
              <Box gap="sm">
                <Text variant="bodyMedium">{criteria.revisions.label}</Text>
                <ChipGroup
                  items={vm.revisionItems}
                  value={String(value)}
                  onChange={next => onChange(Number(next))}
                  accessibilityLabel={criteria.revisions.label}
                />
              </Box>
            )}
          />
          {criteria.retention ? (
            <Controller
              control={control}
              name="retention"
              render={({ field: { value, onChange }, fieldState }) => (
                <Box gap="sm">
                  <Text variant="bodyMedium">{criteria.retention?.label}</Text>
                  <ChipGroup
                    items={vm.retentionItems}
                    value={value}
                    onChange={onChange}
                    accessibilityLabel={criteria.retention?.label ?? ''}
                  />
                  {fieldState.error?.message ? (
                    <Text variant="caption" color={colors.status.danger.text}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </Box>
              )}
            />
          ) : null}
        </Box>
      </FormSection>
    </Box>
  );
});

/** Rush delivery: offered per service, its windows narrowed by the delivery days. */
export const RateCardRushFields: React.FC<Props> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { control, rush } = vm;
  const enabled = useWatch({ control, name: 'rushEnabled' });
  if (!rush) return null;

  return (
    <FormSection title={t('account.rates.editor.extras')}>
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium">{rush.label}</Text>
            {!rush.available ? (
              <Text variant="caption" color={colors.text.secondary}>
                {t('account.rates.editor.rushUnavailable')}
              </Text>
            ) : null}
          </Box>
          <Switch
            value={enabled}
            onValueChange={rush.onToggle}
            accessibilityLabel={rush.label}
            disabled={!rush.available}
          />
        </Box>
        {enabled ? (
          <>
            <Controller
              control={control}
              name="rushHours"
              render={({ field: { value, onChange }, fieldState }) => (
                <Box gap="sm">
                  <Text variant="label" color={colors.text.secondary}>
                    {t('account.rates.editor.rushWindow')}
                  </Text>
                  <ChipGroup
                    items={rush.hourItems}
                    value={value == null ? null : String(value)}
                    onChange={next => onChange(Number(next))}
                    accessibilityLabel={t('account.rates.editor.rushWindow')}
                  />
                  {fieldState.error?.message ? (
                    <Text variant="caption" color={colors.status.danger.text}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </Box>
              )}
            />
            <Controller
              control={control}
              name="rushPrice"
              render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
                <AmountInput
                  ref={ref}
                  label={t('account.rates.editor.rushPrice')}
                  placeholder={t('auth.influencerOnboarding.rates.pricePlaceholder')}
                  value={value}
                  onChangeValue={onChange}
                  onBlur={onBlur}
                  currency={DEFAULT_CURRENCY}
                  returnKeyType="done"
                  error={fieldState.error?.message}
                />
              )}
            />
          </>
        ) : null}
      </Box>
    </FormSection>
  );
});

/** The server's "What's included" lines for a saved card. */
export const RateCardIncludes: React.FC<{ includes: readonly string[] }> = memo(({ includes }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (includes.length === 0) return null;

  return (
    <FormSection title={t('account.rates.includes')}>
      <Box gap="sm">
        {includes.map(line => (
          <Box key={line} row align="center" gap="sm">
            <Check size={sizes.icon.sm} color={colors.status.success.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {line}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </FormSection>
  );
});
