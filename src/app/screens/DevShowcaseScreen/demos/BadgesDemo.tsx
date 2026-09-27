import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { BadgeCheck, Clock } from 'lucide-react-native';
import { Badge, Box, SectionHeader, StatusPill, Tag, Text } from '@/shared/ui';
import type { BadgeTone, TagTone } from '@/shared/ui';
import { HUE_TONES } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { useBadgesDemo } from './hooks/useBadgesDemo';

const BADGE_TONES: BadgeTone[] = ['danger', 'interactive', 'neutral'];
const BADGE_COUNTS = [3, 12, 150];
const TAG_TONES: TagTone[] = ['neutral', 'brand', 'premium'];

/** Exhaustive: a new hue fails the build until it is shown here. */
const TONE_LABEL_KEY = {
  success: 'devShowcase.badges.success',
  warning: 'devShowcase.badges.warning',
  danger: 'devShowcase.badges.danger',
  info: 'devShowcase.badges.info',
  neutral: 'devShowcase.badges.neutral',
  brand: 'devShowcase.badges.brand',
  interactive: 'devShowcase.badges.interactive',
  money: 'devShowcase.badges.money',
  premium: 'devShowcase.badges.premium',
} as const satisfies Record<HueTone, ParseKeys>;

const BadgesDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useBadgesDemo();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.badges.badgeTitle')} />
        {BADGE_TONES.map(tone => (
          <Box key={tone} row gap="md" align="center">
            {BADGE_COUNTS.map(count => (
              <Badge key={count} count={count} tone={tone} />
            ))}
            <Badge variant="dot" tone={tone} />
          </Box>
        ))}
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.badges.pillTitle')} />
        <Box row wrap gap="sm">
          {HUE_TONES.map(tone => (
            <StatusPill key={tone} tone={tone} label={t(TONE_LABEL_KEY[tone])} />
          ))}
        </Box>
        <Box row wrap gap="sm">
          <StatusPill tone="premium" icon={BadgeCheck} label={t('devShowcase.badges.verified')} />
          <StatusPill tone="info" icon={Clock} label={t('devShowcase.badges.underReview')} />
          <StatusPill tone="success" size="sm" label={t('devShowcase.badges.success')} />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader
          title={t('devShowcase.badges.tagTitle')}
          action={{ label: t('common.reset'), onPress: demo.resetTags }}
        />
        <Box row wrap gap="sm">
          {TAG_TONES.map(tone => (
            <Tag key={tone} tone={tone} label={t(TONE_LABEL_KEY[tone])} />
          ))}
        </Box>
        <Box row wrap gap="sm">
          {demo.tags.map(tag => (
            <Tag key={tag} label={tag} onRemove={demo.removeTag} />
          ))}
          {demo.tags.length === 0 ? (
            <Text variant="caption">{t('devShowcase.badges.noTags')}</Text>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export const BadgesDemo = memo(BadgesDemoComponent);
