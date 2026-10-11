import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { MediaKitRise } from './MediaKitRise';

/** Arcs rising from under the card's bottom edge, like the stage's echo at rest. */
const ARC_RADII = [80, 130, 180, 230].map(r => moderateScale(r));
const ARC_DROP = moderateScale(110);
const ARC_ALPHA = 0.25;

interface MediaKitJoinCardProps {
  onCreator: () => void;
  onBrand: () => void;
}

/**
 * For visitors without an account: "Your page could be next on Sada", with one way in for
 * creators (make a kit like this one) and one for brands (book creators with escrow).
 */
const MediaKitJoinCardComponent: React.FC<MediaKitJoinCardProps> = ({ onCreator, onBrand }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const styles = useStyles(
    ({ radii, borderWidths, colors: palette }) => ({
      card: {
        borderRadius: radii.xl,
        overflow: 'hidden' as const,
        borderWidth: borderWidths.thin,
        borderColor: palette.border.default,
      },
    }),
    [],
  );
  const wash = useMemo(() => [colors.interactive.soft, colors.premium.soft], [colors]);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  return (
    <MediaKitRise>
      <LinearGradient colors={wash} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card} onLayout={onLayout}>
        {size.width > 0 ? (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Group opacity={ARC_ALPHA}>
              {ARC_RADII.map(r => (
                <Circle
                  key={r}
                  cx={size.width / 2}
                  cy={size.height + ARC_DROP}
                  r={r}
                  style="stroke"
                  strokeWidth={1}
                  color={colors.interactive.main}
                />
              ))}
            </Group>
          </Canvas>
        ) : null}
        <Box px="xl" py="2xl" gap="lg" align="center">
          <Box gap="sm" align="center">
            <Text variant="h3" align="center">
              {t('account.mediaKit.showcase.join.title')}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary} align="center">
              {t('account.mediaKit.showcase.join.body')}
            </Text>
          </Box>
          <Box gap="sm" width="100%">
            <CustomButton title={t('account.mediaKit.showcase.join.creator')} onPress={onCreator} fullWidth haptic />
            <CustomButton title={t('account.mediaKit.showcase.join.brand')} variant="outline" onPress={onBrand} fullWidth />
          </Box>
        </Box>
      </LinearGradient>
    </MediaKitRise>
  );
};

export const MediaKitJoinCard = memo(MediaKitJoinCardComponent);
