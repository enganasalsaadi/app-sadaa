import React, { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  KeyboardState,
  useAnimatedKeyboard,
} from 'react-native-keyboard-controller';

export interface LayoutKeyboardContainerProps {
  children: ReactNode;
}

export const LayoutKeyboardContainer: React.FC<
  LayoutKeyboardContainerProps
> = ({ children }) => {
  const keyboard = useAnimatedKeyboard();

  const animatedContainerStyle = useAnimatedStyle(() => {
    'worklet';
    if (keyboard.state.value === KeyboardState.CLOSED) {
      return { paddingBottom: 0 };
    }
    return { paddingBottom: Math.max(0, keyboard.height.value) };
  }, []);

  // On iOS, applying paddingBottom to the outer container conflicts with the
  // native UIScrollView keyboard inset adjustment, causing inputs to lose focus
  // immediately after the keyboard opens. Let iOS handle it via
  // automaticallyAdjustKeyboardInsets on the ScrollView instead.
  if (Platform.OS === 'ios') {
    return <View style={styles.flex}>{children}</View>;
  }

  return (
    <Animated.View style={[styles.flex, animatedContainerStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
