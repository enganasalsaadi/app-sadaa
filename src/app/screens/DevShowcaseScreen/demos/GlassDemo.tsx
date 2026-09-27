import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';
import {
  Box,
  GlassCard,
  HeroBackdrop,
  Text,
  useGlassCardStyle,
} from '@/shared/ui';
import { moderateScale, useTheme } from '@/core/theme';
import { useGlassDemo } from './hooks/useGlassDemo';

const STAGE_HEIGHT = moderateScale(200);
const CARD_HEIGHT = moderateScale(96);

/** Glass is only allowed over the navy gradient (rule 08), so the demo brings its own. */
const GlassDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const glass = useGlassCardStyle();
  const { stageWidth, onStageLayout } = useGlassDemo();
  const inset = spacing.xl;

  return (
    <Box gap="sm">
      <Box
        height={STAGE_HEIGHT}
        borderRadius="lg"
        overflow="hidden"
        bg={colors.brand.main}
        onLayout={onStageLayout}
      >
        <HeroBackdrop />
        {stageWidth > 0 ? (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <GlassCard
              x={inset}
              y={(STAGE_HEIGHT - CARD_HEIGHT) / 2}
              width={stageWidth - inset * 2}
              height={CARD_HEIGHT}
              glass={glass}
            />
          </Canvas>
        ) : null}
      </Box>
      <Text variant="caption" color={colors.text.tertiary}>
        {t('devShowcase.glass.hint')}
      </Text>
    </Box>
  );
};

export const GlassDemo = memo(GlassDemoComponent);
