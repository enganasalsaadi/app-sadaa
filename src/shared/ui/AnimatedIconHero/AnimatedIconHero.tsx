import React, { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { Box } from '../primitives';
import { moderateScale } from '@/core/theme/utils/responsive';
import LottieView from 'lottie-react-native';
import type { SpacingToken } from '@/core/theme/types';

const ICON_MAP = {
  bell: require('../../../assets/lottie/bell.json'),
} as const;

export interface AnimatedIconHeroProps {
  /** اسم أيقونة Lottie في المنتصف (بدون امتداد .json) */
  iconName?: keyof typeof ICON_MAP;

  /** React Node للاستخدام بدلاً من Lottie (مثل Earth, Bell, Heart, إلخ) */
  icon?: React.ReactNode;

  /** حجم الأيقونة الرئيسية */
  iconSize?: number;

  /** حجم الدائرة الخلفية المتحركة */
  circleSize?: number;

  /** المسافة من الأعلى */
  marginTop?: SpacingToken;

  /** إلغاء التكرار (إذا أردت تشغيلها مرة واحدة) */
  loop?: boolean;

  /** تشغيل تلقائي */
  autoPlay?: boolean;
  /** أنماط إضافية */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_SIZES = {
  icon: 50,
  circle: 175,
};

export const AnimatedIconHero: React.FC<AnimatedIconHeroProps> = ({
  iconName,
  icon,
  iconSize: customIconSize,
  circleSize: customCircleSize,
  marginTop = '2xl',
  loop = true,
  autoPlay = true,
  style,
}) => {
  const { iconDimensions, circleDimensions } = useMemo(() => {
    const iconSize = moderateScale(customIconSize ?? DEFAULT_SIZES.icon);
    const circleSize = moderateScale(customCircleSize ?? DEFAULT_SIZES.circle);
    return {
      iconDimensions: { width: iconSize, height: iconSize },
      circleDimensions: { width: circleSize, height: circleSize },
    };
  }, [customIconSize, customCircleSize]);
  const lottieSource = iconName ? ICON_MAP[iconName] : null;

  return (
    <Box
      mt={marginTop}
      align="center"
      justify="center"
      accessibilityRole="image"
    >
      {/* الدائرة الخلفية المتحركة */}
      <LottieView
        source={require('../../../assets/lottie/circle.json')}
        autoPlay={autoPlay}
        loop={loop}
        style={[styles.circle, circleDimensions]}
      />

      {/* الأيقونة المركزية */}
      {iconName ? (
        <LottieView
          source={lottieSource}
          autoPlay={autoPlay}
          loop={loop}
          style={[iconDimensions, style]}
        />
      ) : (
        icon
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  circle: { position: 'absolute' },
});
