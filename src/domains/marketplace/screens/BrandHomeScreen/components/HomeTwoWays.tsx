import React, { memo, useCallback, useEffect, useState } from 'react';
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Link2, Sparkles } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { TWO_WAYS, TWO_WAYS_CTA, TWO_WAYS_ROWS, type TwoWay } from '../../../constants/brandHomeTwoWays';
import { TwoWaysScene } from './TwoWaysScene';
import { TwoWaysSwitch } from './TwoWaysSwitch';

interface HomeTwoWaysProps {
  onExplore: () => void;
  onCreateCampaign: () => void;
}

/**
 * For a brand with nothing open yet: what separates a direct deal (it picks one creator, at the
 * creator's price) from a public campaign (it posts one request, creators apply, it picks). One
 * switch moves the picture, the three comparison rows and the single button together.
 */
const HomeTwoWaysComponent: React.FC<HomeTwoWaysProps> = ({ onExplore, onCreateCampaign }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const [way, setWay] = useState<TwoWay>('direct');
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = TWO_WAYS.indexOf(way);
    progress.value = reduceMotion ? target : withSpring(target, motion.spring);
  }, [progress, reduceMotion, way]);

  const onPrimary = useCallback(() => {
    if (way === 'direct') onExplore();
    else onCreateCampaign();
  }, [onCreateCampaign, onExplore, way]);

  return (
    <Box
      mx="xl"
      pb="lg"
      borderRadius="xl"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      overflow="hidden"
    >
      <Box px="lg" pt="lg" gap="xs">
        <Box row align="center" gap="xs">
          <Sparkles size={sizes.icon.xs} color={colors.interactive.text} />
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.brandHome.twoWays.kicker')}
          </Text>
        </Box>
        <Text variant="h4" accessibilityRole="header">
          {t('marketplace.brandHome.twoWays.title')}
        </Text>
        <Text variant="bodySmall" color={colors.text.tertiary}>
          {t('marketplace.brandHome.twoWays.subtitle')}
        </Text>
      </Box>
      <Box px="lg" mt="lg">
        <TwoWaysSwitch way={way} progress={progress} onChange={setWay} />
      </Box>
      <Box px="lg" mt="md">
        <TwoWaysScene progress={progress} />
      </Box>
      <Box px="lg" mt="xs">
        {TWO_WAYS_ROWS.map((row, index) => (
          <Box
            key={row.id}
            row
            align="flex-start"
            gap="md"
            py="md"
            borderTopWidth={index > 0 ? 'hairline' : 'none'}
            borderColor={colors.layout.divider}
          >
            <Box width="26%">
              <Text variant="bodySmall" color={colors.text.tertiary}>
                {t(row.label)}
              </Text>
            </Box>
            <Box flex={1}>
              <Animated.View key={way} entering={FadeInDown.duration(motion.duration.base).delay(index * motion.stagger)}>
                <Text variant="bodyMedium">{t(row.copy[way])}</Text>
              </Animated.View>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        row
        align="flex-start"
        gap="sm"
        mx="lg"
        p="md"
        borderRadius="md"
        bg={colors.interactive.soft}
      >
        <Link2 size={sizes.icon.sm} color={colors.interactive.text} />
        <Box flex={1}>
          <Text variant="caption" color={colors.interactive.text}>
            {t('marketplace.brandHome.twoWays.note')}
          </Text>
        </Box>
      </Box>
      <Box px="lg" mt="lg">
        <CustomButton title={t(TWO_WAYS_CTA[way])} onPress={onPrimary} fullWidth />
      </Box>
    </Box>
  );
};

export const HomeTwoWays = memo(HomeTwoWaysComponent);
