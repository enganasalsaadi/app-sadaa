import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppSelector, selectNetworkError } from '@/core/store';
import { useTheme } from '@/core/theme';
import { Box, Text } from '../primitives';

const HIDDEN_OFFSET = 100;

export const NetworkSnackbar: React.FC = () => {
  const { t } = useTranslation();
  const { colors, zIndices, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const networkError = useAppSelector(selectNetworkError);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (networkError.show) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }
    // Sliding out from 0 is a no-op, so this is safe while already hidden.
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [networkError.show, slideAnim]);

  const animatedStyle = useMemo(
    () => ({
      zIndex: zIndices.toast,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [HIDDEN_OFFSET + insets.bottom, 0],
          }),
        },
      ],
    }),
    [slideAnim, insets.bottom, zIndices.toast],
  );

  const contentStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + spacing.md }),
    [insets.bottom, spacing.md],
  );

  if (!visible) {
    return null;
  }

  return (
    // Animated.View can't be replaced by Box — it must wrap the animated transform
    <Animated.View style={[styles.container, animatedStyle]}>
      <Box
        bg={colors.status.warning.soft}
        borderTopWidth="thin"
        borderColor={colors.status.warning.main}
        px="lg"
        pt="md"
        style={contentStyle}
      >
        <Text variant="label" color={colors.text.primary} align="center">
          {t('errors.network.message')}
        </Text>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
  },
});
