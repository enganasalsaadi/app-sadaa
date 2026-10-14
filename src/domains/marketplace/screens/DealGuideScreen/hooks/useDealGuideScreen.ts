import { useCallback, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type Animated from 'react-native-reanimated';
import { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { DealFlowStackScreenProps } from '@/core/navigation';
import { guideChaptersFor } from '../../../utils/dealGuide';
import { useDealGuideCopy, type GuideChapterCopy } from './useDealGuideCopy';

type ScreenProps = DealFlowStackScreenProps<'DealGuide'>;

export interface GuideChapterView extends GuideChapterCopy {
  key: string;
  /** Shown only with a physical product: tagged «with a product». */
  optional: boolean;
}

/** Where a chapter counts as «being read»: its top passes this share of the viewport. */
const READ_LINE = 0.4;

/**
 * «How a deal completes» for one role. Chapters follow where it was opened (no shipping chapter
 * inside a digital deal). The sticky bar knows the chapter being read; the metro jumps to one.
 */
export const useDealGuideScreen = () => {
  const navigation = useNavigation<ScreenProps['navigation']>();
  const { params } = useRoute<ScreenProps['route']>();
  const copy = useDealGuideCopy(params.role);

  const chapters = useMemo<GuideChapterView[]>(
    () =>
      guideChaptersFor(params).flatMap(chapter => {
        const text = copy.chapters[chapter.key];
        return text ? [{ ...text, key: chapter.key, optional: chapter.optional }] : [];
      }),
    [copy.chapters, params],
  );

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const viewport = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const offsets = useSharedValue<number[]>([]);
  const heroHeight = useSharedValue(0);
  const [current, setCurrent] = useState(0);
  const currentRef = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
    viewport.value = event.layoutMeasurement.height;
    contentHeight.value = event.contentSize.height;
    const line = event.contentOffset.y + event.layoutMeasurement.height * READ_LINE;
    let index = 0;
    offsets.value.forEach((top, i) => {
      if (top > 0 && top <= line) index = i;
    });
    // Only a change crosses to JS, never every frame.
    if (index !== currentRef.value) {
      currentRef.value = index;
      scheduleOnRN(setCurrent, index);
    }
  });

  const onScrollLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewport.value = event.nativeEvent.layout.height;
    },
    [viewport],
  );
  const onHeroLayout = useCallback(
    (event: LayoutChangeEvent) => {
      heroHeight.value = event.nativeEvent.layout.height;
    },
    [heroHeight],
  );

  // Chapter tops in scroll content, filled as they lay out (the list sits under the hero).
  const bodyTop = useRef(0);
  const chapterTops = useRef<number[]>([]);
  const onBodyLayout = useCallback(
    (event: LayoutChangeEvent) => {
      bodyTop.current = event.nativeEvent.layout.y;
      offsets.value = chapterTops.current.map(top => top + bodyTop.current);
    },
    [offsets],
  );
  const onChapterLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const next = [...chapterTops.current];
      next[index] = event.nativeEvent.layout.y;
      chapterTops.current = next;
      offsets.value = next.map(top => top + bodyTop.current);
    },
    [offsets],
  );

  const barHeight = useRef(0);
  const onBarLayout = useCallback((event: LayoutChangeEvent) => {
    barHeight.current = event.nativeEvent.layout.height;
  }, []);
  const jumpTo = useCallback(
    (index: number) => {
      const top = chapterTops.current[index];
      if (top === undefined) return;
      scrollRef.current?.scrollTo({ y: Math.max(0, top + bodyTop.current - barHeight.current), animated: true });
    },
    [scrollRef],
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    role: params.role,
    copy,
    chapters,
    current,
    scrollRef,
    onScroll,
    scrollY,
    viewport,
    contentHeight,
    heroHeight,
    onScrollLayout,
    onHeroLayout,
    onBodyLayout,
    onChapterLayout,
    onBarLayout,
    jumpTo,
    onBack,
  };
};

export type DealGuideModel = ReturnType<typeof useDealGuideScreen>;
