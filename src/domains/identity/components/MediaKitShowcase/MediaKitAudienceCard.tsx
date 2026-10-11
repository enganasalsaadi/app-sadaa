import React, { memo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { motion, useTheme } from '@/core/theme';
import { Box, Card, ProgressBar, SectionHeader, Text } from '@/shared/ui';
import type { AudienceShare, MediaKitAudience } from '../../types/mediaKit';
import { topAgeRange } from '../../utils/mediaKitShowcase';

const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
const pct = (value: number) => formatNumber(value / 100, PERCENT);

const CityRow = memo<{ city: AudienceShare }>(({ city }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="xs">
      <Box row align="center" justify="space-between">
        <Text variant="bodySmall">{city.label}</Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {pct(city.share_pct)}
        </Text>
      </Box>
      <ProgressBar
        value={city.share_pct / 100}
        accessibilityLabel={t('account.mediaKit.showcase.metrics.a11yItem', {
          label: city.label,
          value: pct(city.share_pct),
        })}
      />
    </Box>
  );
});

/** Two-tone bar: women from the start edge, men from the end, each labelled (never colour only). */
const GenderSplit = memo<{ gender: NonNullable<MediaKitAudience['gender']> }>(({ gender }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const female = t('account.mediaKit.showcase.audience.female', { pct: pct(gender.female_pct) });
  const male = t('account.mediaKit.showcase.audience.male', { pct: pct(gender.male_pct) });

  return (
    <Box gap="sm" accessible accessibilityLabel={[female, male].join(t('account.mediaKit.showcase.listSeparator'))}>
      <Box row justify="space-between">
        <Text variant="bodySmall">{female}</Text>
        <Text variant="bodySmall">{male}</Text>
      </Box>
      <Box row height={sizes.dot.md} borderRadius="full" gap="xs">
        <Box flex={Math.max(gender.female_pct, 1)} borderRadius="full" bg={colors.interactive.main} />
        <Box flex={Math.max(gender.male_pct, 1)} borderRadius="full" bg={colors.border.strong} />
      </Box>
    </Box>
  );
});

/**
 * Who follows the creator (server, from platform insights): top cities, gender split and the
 * biggest age group, with the source and date underneath. Hidden until the server sends it.
 */
const MediaKitAudienceCardComponent: React.FC<{ audience: MediaKitAudience }> = ({ audience }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const age = topAgeRange(audience.age_ranges);

  return (
    <Box px="xl" gap="md">
      <SectionHeader title={t('account.mediaKit.showcase.audience.title')} emphasis="strong" />
      <Animated.View entering={FadeIn.duration(motion.duration.slow)}>
        <Card p="lg">
          <Box gap="xl">
            {audience.cities.length > 0 ? (
              <Box gap="md">
                {audience.cities.map(city => (
                  <CityRow key={city.key} city={city} />
                ))}
              </Box>
            ) : null}
            {audience.gender ? <GenderSplit gender={audience.gender} /> : null}
            {age ? (
              <Box row align="center" justify="space-between">
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {t('account.mediaKit.showcase.audience.topAge')}
                </Text>
                <Text variant="bodyMedium">
                  {t('account.mediaKit.showcase.audience.ageValue', { range: age.label, pct: pct(age.share_pct) })}
                </Text>
              </Box>
            ) : null}
            <Text variant="caption" color={colors.text.tertiary}>
              {audience.source_label}
            </Text>
          </Box>
        </Card>
      </Animated.View>
    </Box>
  );
};

export const MediaKitAudienceCard = memo(MediaKitAudienceCardComponent);
