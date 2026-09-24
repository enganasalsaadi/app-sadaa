import React from 'react';
import { StyleSheet } from 'react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import LottieView from 'lottie-react-native';

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
    width: moderateScale(120),
    height: moderateScale(100),
    marginTop: moderateScale(-25),
    marginBottom: moderateScale(-25),
  },
});
