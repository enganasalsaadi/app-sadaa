import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Directions, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/core/theme';
import { ONBOARDING_SLIDES } from '../data';
import { resolveSlides } from '../utils/resolveSlides';

interface Params {
  onFinish: () => void;
}

export const useOnboardingScreen = ({ onFinish }: Params) => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const [index, setIndex] = useState(0);
  // Guards against a double tap on the last CTA firing onFinish twice.
  const finishedRef = useRef(false);

  const slides = useMemo(() => resolveSlides(ONBOARDING_SLIDES, t), [t]);
  const total = slides.length;
  const isLast = index === total - 1;
  const slide = slides[index];

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      finish();
      return;
    }
    setIndex(index + 1);
  }, [finish, index, total]);

  const goPrev = useCallback(() => {
    setIndex(current => Math.max(0, current - 1));
  }, []);

  // Swipe toward reading-start advances: left in LTR, right in RTL.
  const swipeGesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Fling()
          .direction(isRTL ? Directions.RIGHT : Directions.LEFT)
          .runOnJS(true)
          .onEnd(goNext),
        Gesture.Fling()
          .direction(isRTL ? Directions.LEFT : Directions.RIGHT)
          .runOnJS(true)
          .onEnd(goPrev),
      ),
    [goNext, goPrev, isRTL],
  );

  return {
    slide,
    index,
    total,
    isLast,
    swipeGesture,
    ctaLabel: isLast ? t('onboarding.start') : t('onboarding.next'),
    skipLabel: t('onboarding.skip'),
    skipHint: t('onboarding.skipHint'),
    progressLabel: t('onboarding.progress', { current: index + 1, total }),
    onNext: goNext,
    onSkip: finish,
  };
};
