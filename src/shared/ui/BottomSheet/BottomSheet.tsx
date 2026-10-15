import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
  /**
   * Pinned over the content on the sheet's own surface, with the handle and a hairline under it.
   * With `bg` on the page color this reads as a white header over a sunken body.
   */
  header?: React.ReactNode;
  /** Pinned under the content on the sheet's surface (the sheet's CTA), hairline above, insets included. */
  footer?: React.ReactNode;
  /**
   * After the sheet has fully left the screen. Open the next native screen (an image or
   * file picker) from here: iOS can't present one while a modal is still dismissing.
   */
  onDismissed?: () => void;
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
  header,
  footer,
  onDismissed,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(windowHeight)).current;
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;
  // The close animation also runs on mount; only a sheet that was open reports a dismissal.
  const shownRef = useRef(false);

  useEffect(() => {
    if (visible) {
      shownRef.current = true;
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
      ]).start(({ finished }) => {
        if (!finished) return;
        setIsVisible(false);
        const wasShown = shownRef.current;
        shownRef.current = false;
        // iOS reports through the Modal's own `onDismiss`, once it is really gone.
        if (wasShown && Platform.OS !== 'ios') onDismissedRef.current?.();
      });
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

  const surface = colors.navigation.bottomSheet.background;
  const backgroundColor = bg ?? surface;
  // Android draws the gesture bar over the sheet, so pad a little extra.
  const bottomSpacer =
    insets.bottom + (Platform.OS === 'android' ? spacing.xl : 0);

  const handle = showHandle ? (
    <Box align="center" pt="md" pb="sm">
      <Box
        width={sizes.sheetHandle.width}
        height={sizes.sheetHandle.height}
        borderRadius="full"
        bg={colors.navigation.bottomSheet.handle}
      />
    </Box>
  ) : null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismissed}
    >
      {/* Overlay — pointerEvents none so touches reach the dismiss area below */}
      <Animated.View pointerEvents="none" style={overlayStyle} />

      {/* keyboard-controller follows the Modal's own window on Android too; RN's version did nothing
          there under edge-to-edge, so the sheet's CTA ended up behind the keyboard. */}
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior="padding">
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
            borderTopStartRadius="xl"
            borderTopEndRadius="xl"
            overflow="hidden"
          >
            {header ? (
              <Box
                bg={surface}
                borderBottomWidth="hairline"
                borderColor={colors.border.default}
              >
                {handle}
                {header}
              </Box>
            ) : (
              handle
            )}
            {children}
            {footer ? (
              <Box
                bg={surface}
                borderTopWidth="hairline"
                borderColor={colors.border.default}
              >
                {footer}
                {insets.bottom > 0 && <Box height={bottomSpacer} />}
              </Box>
            ) : (
              insets.bottom > 0 && (
                <Box
                  height={bottomSpacer}
                  bg={muted ? undefined : colors.surface.main}
                />
              )
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
