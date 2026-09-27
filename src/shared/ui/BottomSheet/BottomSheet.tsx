import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  Animated,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { motion, useTheme } from '@/core/theme';
import { Box, Pressable } from '../primitives';

/** Default cap so the sheet never hides the whole screen behind it. */
const DEFAULT_MAX_HEIGHT_RATIO = 0.75;

// Clamped so the sheet never overshoots upwards and reveals a gap below it.
const SHEET_SPRING = { ...motion.spring, overshootClamping: true } as const;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
  maxHeight?: number;
  showHandle?: boolean;
  bg?: string;
  fullScreen?: boolean;
  muted?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapHeight,
  maxHeight: maxHeightProp,
  showHandle = true,
  bg,
  fullScreen = false,
  muted = false,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(windowHeight)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: motion.duration.base,
          useNativeDriver: true,
        }),
        Animated.spring(sheetAnim, {
          toValue: 0,
          ...SHEET_SPRING,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: motion.duration.base,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: windowHeight,
          duration: motion.duration.base,
          useNativeDriver: true,
        }),
      ]).start(() => setIsVisible(false));
    }
  }, [visible, backdropAnim, sheetAnim, windowHeight]);

  const sheetStyle = useMemo(() => {
    if (fullScreen) return { height: windowHeight - insets.top };
    if (snapHeight) return { height: snapHeight };
    return { maxHeight: maxHeightProp ?? windowHeight * DEFAULT_MAX_HEIGHT_RATIO };
  }, [fullScreen, snapHeight, maxHeightProp, windowHeight, insets.top]);

  const overlayStyle = useMemo(
    () => [
      StyleSheet.absoluteFill,
      { backgroundColor: colors.overlay, opacity: backdropAnim },
    ],
    [colors.overlay, backdropAnim],
  );

  const translateStyle = useMemo(
    () => ({ transform: [{ translateY: sheetAnim }] }),
    [sheetAnim],
  );

  const backgroundColor = bg ?? colors.navigation.bottomSheet.background;
  // Android draws the gesture bar over the sheet, so pad a little extra.
  const bottomSpacer =
    insets.bottom + (Platform.OS === 'android' ? spacing.xl : 0);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay — pointerEvents none so touches reach the dismiss area below */}
      <Animated.View pointerEvents="none" style={overlayStyle} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          flex={1}
          onPress={onClose}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />

        <Animated.View style={translateStyle}>
          <Box
            style={sheetStyle}
            bg={backgroundColor}
            borderTopStartRadius="lg"
            borderTopEndRadius="lg"
            overflow="hidden"
          >
            {showHandle && (
              <Box align="center" pt="md" pb="sm">
                <Box
                  width={sizes.sheetHandle.width}
                  height={sizes.sheetHandle.height}
                  borderRadius="full"
                  bg={colors.navigation.bottomSheet.handle}
                />
              </Box>
            )}
            {children}
            {insets.bottom > 0 && (
              <Box
                height={bottomSpacer}
                bg={muted ? undefined : colors.surface.main}
              />
            )}
          </Box>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
