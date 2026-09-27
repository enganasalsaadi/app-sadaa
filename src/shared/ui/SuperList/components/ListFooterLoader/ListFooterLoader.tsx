import React from 'react';
import { StyleSheet } from 'react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import LottieView from 'lottie-react-native';

// The Lottie artwork has built-in transparent padding; the negative margins trim
// it so the footer doesn't add a tall blank band under the last row.
const LOTTIE_WIDTH = moderateScale(120);
const LOTTIE_HEIGHT = moderateScale(100);
const LOTTIE_PADDING_TRIM = moderateScale(-25);

interface ListFooterLoaderProps {
  isVisible: boolean;
}

export const ListFooterLoader: React.FC<ListFooterLoaderProps> = ({
  isVisible,
}) => {
  const { isDark } = useTheme();

  if (!isVisible) return null;

  return (
    <Box align="center" overflow="hidden">
      <LottieView
        source={
          isDark
            ? require('./../../../../../assets/lottie/loading_light.json')
            : require('./../../../../../assets/lottie/loading.json')
        }
        autoPlay
        style={styles.lottie}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: LOTTIE_WIDTH,
    height: LOTTIE_HEIGHT,
    marginTop: LOTTIE_PADDING_TRIM,
    marginBottom: LOTTIE_PADDING_TRIM,
  },
});
