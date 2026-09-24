import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  maxHeight = SCREEN_HEIGHT * 0.75,
  showHandle = true,
  bg,
  fullScreen = false,
  muted = false,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setIsVisible(false));
    }
  }, [visible, backdropAnim, sheetAnim]);

  const sheetStyle = fullScreen
    ? { height: SCREEN_HEIGHT - insets.top }
    : snapHeight
    ? { height: snapHeight }
    : { maxHeight };
  const backgroundColor = bg ?? colors.navigation.bottomSheet.background;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay — pointerEvents none so touches reach the touchable below */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.overlay, opacity: backdropAnim },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop dismiss area */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{ transform: [{ translateY: sheetAnim }] }}
        >
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
                  width={40}
                  height={4}
                  borderRadius="full"
                  bg={colors.navigation.bottomSheet.handle}
                />
              </Box>
            )}
            {children}
            {insets.bottom > 0 && (
              <Box
                height={insets.bottom + (Platform.OS === 'android' ? 20 : 0)}
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
  backdrop: { flex: 1 },
});
