import React, { memo, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CURRENCY } from '@/core/config';
import { moderateScale, useTheme } from '@/core/theme';
import { AmountInput, Box, ChipGroup, Divider, FormSection, Switch, Text } from '@/shared/ui';
import { ADDON_ICONS } from '../../../constants/addonIcons';
import type { AddonField, RateCardEditorModel } from '../hooks/useRateCardEditorScreen';

const ICON_BOX = moderateScale(36);

interface AddonRowProps {
  field: AddonField;
  index: number;
  control: RateCardEditorModel['control'];
  onToggle: RateCardEditorModel['onToggleAddon'];
}

/** One add-on: switch on, then its options (a fixed one as text) and its own fee. */
const AddonRow = memo<AddonRowProps>(({ field, index, control, onToggle }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const enabled = useWatch({ control, name: `addons.${index}.enabled` });
  const toggle = useCallback((next: boolean) => onToggle(index, next), [index, onToggle]);
  const Icon = ADDON_ICONS[field.type];

  return (
    <Box gap="lg">
      <Box row align="center" gap="md">
        <Box
          width={ICON_BOX}
          height={ICON_BOX}
          borderRadius="md"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium">{field.label}</Text>
          {!field.available ? (
            <Text variant="caption" color={colors.text.secondary}>
              {t('account.rates.editor.rushUnavailable')}
            </Text>
          ) : null}
        </Box>
        <Switch
          value={!!enabled}
          onValueChange={toggle}
          accessibilityLabel={field.label}
          disabled={!field.available && !enabled}
        />
      </Box>
      {enabled ? (
        <>
          <Controller
            control={control}
            name={`addons.${index}.options`}
            render={({ field: { value, onChange }, fieldState }) => (
              <Box gap="md">
                {field.options.map(option => (
                  <Box key={option.key} gap="sm">
                    {option.fixed ? (
                      <Box row align="center" justify="space-between" gap="md">
                        <Text variant="label" color={colors.text.secondary}>
                          {option.title}
                        </Text>
                        <Text variant="bodyMedium">{option.fixed}</Text>
                      </Box>
                    ) : (
                      <>
                        <Text variant="label" color={colors.text.secondary}>
                          {option.title}
                        </Text>
                        <ChipGroup
                          items={option.items}
                          value={value?.[option.key] ?? null}
                          onChange={next => onChange({ ...value, [option.key]: next })}
                          accessibilityLabel={option.title}
                        />
                      </>
                    )}
                  </Box>
                ))}
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
            name={`addons.${index}.price`}
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <AmountInput
                ref={ref}
                label={t('account.rates.editor.addonPrice', { label: field.label })}
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
  );
});

/** Extras the picked service offers, drawn from the catalog in its order; each a fixed fee. */
export const RateCardAddonFields: React.FC<{ vm: RateCardEditorModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  if (vm.addons.length === 0) return null;

  return (
    <FormSection title={t('account.rates.editor.extras')} description={t('account.rates.editor.extrasHint')}>
      <Box>
        {vm.addons.map((field, index) => (
          <React.Fragment key={field.type}>
            {index > 0 ? <Divider spacing="lg" /> : null}
            <AddonRow field={field} index={index} control={vm.control} onToggle={vm.onToggleAddon} />
          </React.Fragment>
        ))}
      </Box>
    </FormSection>
  );
});
