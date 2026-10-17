import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { BRIEF_TONES, type BriefToneKey } from '../../utils/briefEntries';

const TONE_LABEL = {
  casual: 'marketplace.offer.brief.tone.casual.label',
  luxury: 'marketplace.offer.brief.tone.luxury.label',
  fun: 'marketplace.offer.brief.tone.fun.label',
  educational: 'marketplace.offer.brief.tone.educational.label',
} as const satisfies Record<BriefToneKey, string>;

interface BriefToneChipsProps {
  active: BriefToneKey | null;
  onToggle: (tone: BriefToneKey) => void;
}

/** One tone at a time; picking one writes it as a talking point the creator reads. */
const BriefToneChipsComponent: React.FC<BriefToneChipsProps> = ({ active, onToggle }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.offer.brief.talk.tone')}
      </Text>
      <Box row wrap gap="sm" accessibilityRole="radiogroup">
        {BRIEF_TONES.map(tone => {
          const on = active === tone;
          return (
            <Pressable
              key={tone}
              row
              align="center"
              gap="xs"
              px="lg"
              minHeight={sizes.button.md}
              borderRadius="full"
              bg={on ? colors.button.primary.bg : colors.surface.elevated}
              scaleOnPress
              onPress={() => onToggle(tone)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={t(TONE_LABEL[tone])}
            >
              {on ? <Check size={sizes.icon.xs} color={colors.button.primary.text} /> : null}
              <Text variant="buttonSmall" color={on ? colors.button.primary.text : colors.text.secondary}>
                {t(TONE_LABEL[tone])}
              </Text>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export const BriefToneChips = memo(BriefToneChipsComponent);
