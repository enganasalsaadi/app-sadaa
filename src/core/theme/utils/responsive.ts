import { Dimensions, PixelRatio } from 'react-native';
import {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  BREAKPOINTS,
  FONT_SCALE_FACTOR,
  FONT_MAX_SCALE_RATIO,
} from '../../config/layout';

const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

const getDeviceWidth = (): number => {
  const { width, height } = getWindowDimensions();
  return Math.min(width, height);
};

/**
 * دالة القياس العرضي: تكبر القيم حسب عرض الجهاز.
 * تُستخدم للـ Width والـ Horizontal margins/paddings.
 */
export const scale = (size: number): number => {
  const { width } = getWindowDimensions();
  return PixelRatio.roundToNearestPixel((width / DESIGN_WIDTH) * size);
};

/**
 * دالة القياس الرأسي: تكبر القيم حسب طول الجهاز.
 * تُستخدم للـ Height والـ Vertical spacing.
 */
export const verticalScale = (size: number): number => {
  const { height } = getWindowDimensions();
  return PixelRatio.roundToNearestPixel((height / DESIGN_HEIGHT) * size);
};

/**
 * دالة القياس المعتدل (الأكثر استخداماً):
 * تكبر القيم بنسبة 50% فقط من فرق الحجم، لضمان عدم ضخامة العناصر على الشاشات الكبيرة.
 * مثالية للـ Border Radius والـ Padding.
 *
 * العرض، المسافات الجانبية، الأيقونات
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const { width } = getWindowDimensions();
  const scaleFactor = (width / DESIGN_WIDTH - 1) * factor + 1;
  return PixelRatio.roundToNearestPixel(size * scaleFactor);
};

/**
 * دالة القياس المعتدل الرأسي:
 * تكبر القيم بنسبة 50% فقط من فرق الحجم، لضمان عدم ضخامة العناصر على الشاشات الكبيرة.
 * مثالية للـ Border Radius والـ Padding.
 *
 * الارتفاع، المسافات الرأسية، النصوص
 *
 */
export const moderateVerticalScale = (
  size: number,
  factor: number = 0.5,
): number => {
  const { height } = getWindowDimensions();
  const scaleFactor = (height / DESIGN_HEIGHT - 1) * factor + 1;
  return PixelRatio.roundToNearestPixel(size * scaleFactor);
};

export type ScreenCategory = 'small' | 'medium' | 'large';

export const getScreenCategory = (): ScreenCategory => {
  const shortSide = getDeviceWidth();
  if (shortSide < BREAKPOINTS.medium) {
    return 'small';
  }
  if (shortSide < BREAKPOINTS.large) {
    return 'medium';
  }
  return 'large';
};

export const isTablet = (): boolean => {
  return getDeviceWidth() >= BREAKPOINTS.large;
};

export const isLandscape = (): boolean => {
  const { width, height } = getWindowDimensions();
  return width > height;
};

export const screenWidth = (): number => getWindowDimensions().width;
export const screenHeight = (): number => getWindowDimensions().height;

export const fontScale = (size: number): number => {
  const scaled = moderateScale(size, FONT_SCALE_FACTOR);
  const maxScale = size * FONT_MAX_SCALE_RATIO;
  return PixelRatio.roundToNearestPixel(Math.min(scaled, maxScale));
};

/** Uniform hit slop — a number keeps it direction-agnostic (RTL-safe). */
export const hitSlop = (size: number = 8): number => moderateScale(size);

/**
 * دالة النسبة المئوية للعرض: تحول النسبة المئوية إلى وحدات بكسل.
 * @param percent - النسبة المئوية (مثال: 25 يعني 25% من عرض الشاشة)
 * @returns عدد البكسلات المحسوبة
 *
 * @example
 * percentageOfWidth(50) // returns نصف عرض الشاشة
 * percentageOfWidth(33) // returns ثلث عرض الشاشة
 */
export const percentageOfWidth = (percent: number): number => {
  const { width } = getWindowDimensions();
  return PixelRatio.roundToNearestPixel((percent / 100) * width);
};

/**
 * دالة النسبة المئوية للارتفاع: تحول النسبة المئوية إلى وحدات بكسل.
 * @param percent - النسبة المئوية (مثال: 25 يعني 25% من ارتفاع الشاشة)
 * @returns عدد البكسلات المحسوبة
 *
 * @example
 * percentageOfHeight(50) // returns نصف ارتفاع الشاشة
 * percentageOfHeight(100) // returns full height
 */
export const percentageOfHeight = (percent: number): number => {
  const { height } = getWindowDimensions();
  return PixelRatio.roundToNearestPixel((percent / 100) * height);
};

/**
 * دالة النسبة المئوية الأصغر: تعتمد على الضلع الأصغر (العرض أو الارتفاع).
 * مناسبة للعناصر المربعة التي تريدها متناسبة مع أصغر أبعاد الشاشة.
 *
 * @param percent - النسبة المئوية
 * @returns عدد البكسلات المحسوبة
 */
export const percentageOfMin = (percent: number): number => {
  const { width, height } = getWindowDimensions();
  const minSide = Math.min(width, height);
  return PixelRatio.roundToNearestPixel((percent / 100) * minSide);
};

/**
 * دالة النسبة المئوية الأكبر: تعتمد على الضلع الأكبر (العرض أو الارتفاع).
 *
 * @param percent - النسبة المئوية
 * @returns عدد البكسلات المحسوبة
 */
export const percentageOfMax = (percent: number): number => {
  const { width, height } = getWindowDimensions();
  const maxSide = Math.max(width, height);
  return PixelRatio.roundToNearestPixel((percent / 100) * maxSide);
};
