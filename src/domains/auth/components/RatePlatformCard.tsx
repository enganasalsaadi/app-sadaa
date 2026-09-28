import React, { memo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  AmountInput,
  Box,
  Card,
  Checkbox,
  SocialPlatformIcon,
  Text,
} from '@/shared/ui';
import { RATE_CURRENCY } from '../constants/influencerOnboarding';
import { PLATFORM_LABEL_KEY } from '../constants/socialPlatforms';
import type { InfluencerPlatform, InfluencerRatesFormValues } from '../schemas';
import type { ServiceType } from '../store';

interface RateServiceRowProps {
  control: Control<InfluencerRatesFormValues>;
  index: number;
  label: string;
}

// Subscribes to its own row only, so typing a price doesn't re-render the card.
const RateServiceRow: React.FC<RateServiceRowProps> = memo(
  ({ control, index, label }) => {
    const { t } = useTranslation();
    const enabled = useWatch({ control, name: `rates.${index}.enabled` });

    return (
      <Box gap="sm">
        <Controller
          control={control}
          name={`rates.${index}.enabled`}
          render={({ field: { value, onChange } }) => (
            <Checkbox checked={value} onChange={onChange} label={label} />
          )}
        />
        {enabled ? (
          <Controller
            control={control}
            name={`rates.${index}.price`}
            render={({
              field: { ref, value, onChange, onBlur },
              fieldState,
            }) => (
              <AmountInput
                ref={ref}
                label={t('auth.influencerOnboarding.rates.priceLabel', {
                  service: label,
                })}
                placeholder={t(
                  'auth.influencerOnboarding.rates.pricePlaceholder',
                )}
                value={value}
                onChangeValue={onChange}
                onBlur={onBlur}
                currency={RATE_CURRENCY}
                returnKeyType="done"
                error={fieldState.error?.message}
              />
            )}
          />
        ) : null}
      </Box>
    );
  },
);

interface RatePlatformCardProps {
  control: Control<InfluencerRatesFormValues>;
  platform: InfluencerPlatform;
  username: string;
  rows: readonly { index: number; service: ServiceType }[];
  serviceLabel: (service: ServiceType) => string;
}

/** One linked platform with a price per service the creator offers there. */
export const RatePlatformCard: React.FC<RatePlatformCardProps> = memo(
  ({ control, platform, username, rows, serviceLabel }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();

    return (
      <Card p="lg" shadow="none">
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
              <SocialPlatformIcon
                platform={platform}
                size={sizes.icon.md}
                color={colors.interactive.main}
              />
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium">
                {t(PLATFORM_LABEL_KEY[platform])}
              </Text>
              <Text
                variant="caption"
                color={colors.text.secondary}
                numberOfLines={1}
              >
                @{username}
              </Text>
            </Box>
          </Box>
          {rows.map(row => (
            <RateServiceRow
              key={row.service}
              control={control}
              index={row.index}
              label={serviceLabel(row.service)}
            />
          ))}
        </Box>
      </Card>
    );
  },
);
