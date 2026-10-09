import React, { memo, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import type { CatalogService } from '@/core/api';
import { useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  AmountInput,
  Box,
  Card,
  Checkbox,
  ChipGroup,
  SocialPlatformIcon,
  Text,
} from '@/shared/ui';
import { RATE_CURRENCY } from '../constants/influencerOnboarding';
import type { InfluencerRatesFormValues } from '../schemas';

/** One service row: its index into `rates` and the catalog entry it prices. */
export interface RateFormRow {
  index: number;
  service: CatalogService;
}

interface RateServiceRowProps {
  control: Control<InfluencerRatesFormValues>;
  index: number;
  service: CatalogService;
}

// Subscribes to its own row only, so typing a price doesn't re-render the card.
const RateServiceRow: React.FC<RateServiceRowProps> = memo(({ control, index, service }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const enabled = useWatch({ control, name: `rates.${index}.enabled` });
  const pkg = service.package;
  const packageItems = useMemo(
    () => pkg?.options.map(option => ({ value: String(option.value), label: option.label })) ?? [],
    [pkg],
  );

  return (
    <Box gap="sm">
      <Controller
        control={control}
        name={`rates.${index}.enabled`}
        render={({ field: { value, onChange } }) => (
          <Checkbox checked={value} onChange={onChange} label={service.label} />
        )}
      />
      {enabled ? (
        <Box gap="md" ps="2xl">
          {pkg ? (
            <Controller
              control={control}
              name={`rates.${index}.packageValue`}
              render={({ field: { value, onChange }, fieldState }) => (
                <Box gap="sm">
                  <Text variant="label" color={colors.text.secondary}>
                    {pkg.label}
                  </Text>
                  <ChipGroup
                    items={packageItems}
                    value={value}
                    onChange={onChange}
                    accessibilityLabel={pkg.label}
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
          <Controller
            control={control}
            name={`rates.${index}.price`}
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <AmountInput
                ref={ref}
                label={t('auth.influencerOnboarding.rates.priceLabel', { service: service.label })}
                placeholder={t('auth.influencerOnboarding.rates.pricePlaceholder')}
                value={value}
                onChangeValue={onChange}
                onBlur={onBlur}
                currency={RATE_CURRENCY}
                returnKeyType="done"
                error={fieldState.error?.message}
              />
            )}
          />
        </Box>
      ) : null}
    </Box>
  );
});

interface RatePlatformCardProps {
  control: Control<InfluencerRatesFormValues>;
  /** Server platform key for the icon; `null` = the in-person group. */
  platform: string | null;
  title: string;
  /** `@username` for a platform. */
  subtitle?: string;
  rows: readonly RateFormRow[];
}

/** One linked platform (or the in-person group) with a price per catalog service. */
export const RatePlatformCard: React.FC<RatePlatformCardProps> = memo(
  ({ control, platform, title, subtitle, rows }) => {
    const { colors, sizes } = useTheme();

    return (
      <Card p="lg">
        <Box gap="lg">
          <Box row align="center" gap="md">
            <Box
              width={sizes.button.md}
              height={sizes.button.md}
              borderRadius="md"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              {platform && isSocialPlatform(platform) ? (
                <SocialPlatformIcon platform={platform} size={sizes.icon.md} color={colors.interactive.main} />
              ) : (
                <MapPin size={sizes.icon.md} color={colors.interactive.main} />
              )}
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium">{title}</Text>
              {subtitle ? (
                <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </Box>
          </Box>
          {rows.map(row => (
            <RateServiceRow key={row.service.key} control={control} index={row.index} service={row.service} />
          ))}
        </Box>
      </Card>
    );
  },
);
