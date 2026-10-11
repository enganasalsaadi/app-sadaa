import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';
import type { AudienceShare, MediaKitAudience as Audience } from '../../types/mediaKit';
import { topAgeRange } from '../../utils/mediaKitShowcase';
import { MediaKitGrow } from './MediaKitGrow';
import { MediaKitRise } from './MediaKitRise';
import { MediaKitSectionTitle } from './MediaKitSectionTitle';

const WHOLE: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
const ONE_DECIMAL: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 1 };
const pct = (value: number, options = ONE_DECIMAL) => formatNumber(value / 100, options);

const GENDER_HEIGHT = moderateScale(46);
const GENDER_GAP = moderateScale(3);
/** Below this share the word ("Women") no longer fits beside the number inside the bar. */
const GENDER_WORD_MIN = 30;
const CITY_NAME = moderateScale(84);
const CITY_VALUE = moderateScale(48);
const CITY_BAR = moderateScale(12);
const AGES_HEIGHT = moderateScale(130);
const ROW_STAGGER = 100;
const COLUMN_STAGGER = 80;

const GroupLabel = memo<{ label: string; aside?: string }>(({ label, aside }) => {
  const { colors } = useTheme();
  return (
    <Box row justify="space-between" align="center" mb="sm">
      <Text variant="buttonSmall" color={colors.text.secondary}>
        {label}
      </Text>
      {aside ? (
        <Text variant="buttonSmall" color={colors.interactive.text}>
          {aside}
        </Text>
      ) : null}
    </Box>
  );
});

const GenderSegment = memo<{ share: number; word: string; tone: 'male' | 'female'; delay: number }>(
  ({ share, word, tone, delay }) => {
    const styles = useStyles(
      ({ colors, spacing }) => ({
        segment: {
          flex: Math.max(share, 1),
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          overflow: 'hidden' as const,
          backgroundColor: tone === 'male' ? colors.brand.main : colors.interactive.main,
        },
      }),
      [share, tone],
    );
    const { colors } = useTheme();
    const ink = tone === 'male' ? colors.text.onBrand : colors.text.onAccent;
    return (
      <MediaKitGrow axis="x" delay={delay} style={styles.segment}>
        <Text variant="title" color={ink} numberOfLines={1}>
          {pct(share, WHOLE)}
        </Text>
        {share >= GENDER_WORD_MIN ? (
          <Text variant="caption" color={ink} numberOfLines={1}>
            {word}
          </Text>
        ) : null}
      </MediaKitGrow>
    );
  },
);

const GenderBar = memo<{ gender: NonNullable<Audience['gender']> }>(({ gender }) => {
  const { t } = useTranslation();
  const styles = useStyles(
    ({ radii }) => ({
      bar: { flexDirection: 'row' as const, height: GENDER_HEIGHT, gap: GENDER_GAP, borderRadius: radii.md, overflow: 'hidden' as const },
    }),
    [],
  );
  const male = t('account.mediaKit.showcase.audience.male', { pct: pct(gender.male_pct, WHOLE) });
  const female = t('account.mediaKit.showcase.audience.female', { pct: pct(gender.female_pct, WHOLE) });
  return (
    <Box>
      <GroupLabel label={t('account.mediaKit.showcase.audience.gender')} />
      <Box style={styles.bar} accessible accessibilityLabel={[male, female].join(t('account.mediaKit.showcase.listSeparator'))}>
        <GenderSegment share={gender.male_pct} word={t('account.mediaKit.showcase.audience.men')} tone="male" delay={0} />
        <GenderSegment
          share={gender.female_pct}
          word={t('account.mediaKit.showcase.audience.women')}
          tone="female"
          delay={ROW_STAGGER}
        />
      </Box>
    </Box>
  );
});

const CityRow = memo<{ city: AudienceShare; max: number; index: number }>(({ city, max, index }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, colors: palette }) => ({
      name: { width: CITY_NAME },
      track: { flex: 1, height: CITY_BAR, borderRadius: radii.sm, overflow: 'hidden' as const, backgroundColor: palette.surface.elevated },
      fill: {
        height: '100%' as const,
        width: `${max > 0 ? (city.share_pct / max) * 100 : 0}%` as const,
        borderRadius: radii.sm,
        backgroundColor: palette.interactive.main,
      },
      value: { width: CITY_VALUE },
    }),
    [city.share_pct, max],
  );
  const value = pct(city.share_pct);
  return (
    <Box
      row
      align="center"
      gap="md"
      accessible
      accessibilityLabel={t('account.mediaKit.showcase.metrics.a11yItem', { label: city.label, value })}
    >
      <Box style={styles.name}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {city.label}
        </Text>
      </Box>
      <Box style={styles.track}>
        <MediaKitGrow axis="x" delay={index * ROW_STAGGER} style={styles.fill} />
      </Box>
      <Box style={styles.value} align="flex-end">
        <Text variant="buttonSmall" color={colors.text.secondary}>
          {value}
        </Text>
      </Box>
    </Box>
  );
});

const AgeColumn = memo<{ range: AudienceShare; max: number; top: boolean; index: number }>(
  ({ range, max, top, index }) => {
    const { colors } = useTheme();
    const styles = useStyles(
      ({ radii, colors: palette }) => ({
        bar: {
          width: '100%' as const,
          height: `${max > 0 ? (range.share_pct / max) * 100 : 0}%` as const,
          borderTopStartRadius: radii.md,
          borderTopEndRadius: radii.md,
          borderBottomStartRadius: radii.xs,
          borderBottomEndRadius: radii.xs,
          backgroundColor: top ? palette.interactive.main : palette.interactive.soft,
        },
      }),
      [range.share_pct, max, top],
    );
    return (
      <Box flex={1} align="center" justify="flex-end" gap="xs" height="100%">
        <Text variant="caption" color={top ? colors.interactive.text : colors.text.secondary}>
          {pct(range.share_pct)}
        </Text>
        <Box flex={1} width="100%" justify="flex-end">
          <MediaKitGrow axis="y" delay={index * COLUMN_STAGGER} style={styles.bar} />
        </Box>
        <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
          {range.label}
        </Text>
      </Box>
    );
  },
);

/**
 * "Who's watching?": one card with the gender split as a two-tone bar labelled inside, the top
 * cities as growing bars and the age groups as columns (the biggest one in teal), then the
 * server's source line. Each part shows only with data; bars grow as they come into view.
 */
const MediaKitAudienceComponent: React.FC<{ audience: Audience }> = ({ audience }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const top = topAgeRange(audience.age_ranges);
  const cityMax = Math.max(0, ...audience.cities.map(city => city.share_pct));
  const ageMax = top?.share_pct ?? 0;
  const styles = useStyles(() => ({ ages: { flexDirection: 'row' as const, gap: moderateScale(10), height: AGES_HEIGHT } }), []);

  return (
    <Box gap="lg">
      <MediaKitSectionTitle
        overline={t('account.mediaKit.showcase.audience.overline')}
        title={t('account.mediaKit.showcase.audience.title')}
      />
      <MediaKitRise>
        <Card p="xl" borderRadius="xl">
          <Box gap="2xl">
            {audience.gender ? <GenderBar gender={audience.gender} /> : null}
            {audience.cities.length > 0 ? (
              <Box>
                <GroupLabel label={t('account.mediaKit.showcase.audience.cities')} />
                <Box gap="md">
                  {audience.cities.map((city, index) => (
                    <CityRow key={city.key} city={city} max={cityMax} index={index} />
                  ))}
                </Box>
              </Box>
            ) : null}
            {audience.age_ranges.length > 0 ? (
              <Box>
                <GroupLabel
                  label={t('account.mediaKit.showcase.audience.ages')}
                  aside={top ? t('account.mediaKit.showcase.audience.topAgeShort', { range: top.label }) : undefined}
                />
                <Box style={styles.ages} accessible accessibilityLabel={top ? t('account.mediaKit.showcase.audience.ageValue', { range: top.label, pct: pct(top.share_pct) }) : undefined}>
                  {audience.age_ranges.map((range, index) => (
                    <AgeColumn key={range.key} range={range} max={ageMax} top={range.key === top?.key} index={index} />
                  ))}
                </Box>
              </Box>
            ) : null}
            <Text variant="caption" color={colors.text.tertiary}>
              {audience.source_label}
            </Text>
          </Box>
        </Card>
      </MediaKitRise>
    </Box>
  );
};

export const MediaKitAudience = memo(MediaKitAudienceComponent);
