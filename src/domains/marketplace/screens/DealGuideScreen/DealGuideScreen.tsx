import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { ViewStyle } from 'react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Layout } from '@/shared/ui';
import { GuideBar } from './components/GuideBar';
import { GuideChapter } from './components/GuideChapter';
import { GuideFaq } from './components/GuideFaq';
import { GuideHero } from './components/GuideHero';
import { useDealGuideScreen } from './hooks/useDealGuideScreen';

/** «How does a deal complete?»: a navy hero with the metro, one chapter per station, then the FAQ. */
export const DealGuideScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useDealGuideScreen();
  const styles = useStyles(
    ({ spacing, borderWidths }): Record<'scroll' | 'body' | 'link', ViewStyle> => ({
      scroll: { flex: 1 },
      body: { paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing['5xl'], gap: spacing['3xl'] },
      link: {
        position: 'absolute',
        top: -spacing['3xl'],
        height: spacing['3xl'],
        alignSelf: 'center',
        borderStartWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
    }),
    [colors.border.default],
  );

  return (
    <Layout mode="static" padding="none" statusBar="light" edges={[]}>
      <Animated.ScrollView
        ref={vm.scrollRef}
        style={styles.scroll}
        onScroll={vm.onScroll}
        onLayout={vm.onScrollLayout}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <GuideHero
          copy={vm.copy}
          chapters={vm.chapters}
          jumpTo={vm.jumpTo}
          onBack={vm.onBack}
          onHeroLayout={vm.onHeroLayout}
        />
        <Box style={styles.body} onLayout={vm.onBodyLayout}>
          {vm.chapters.map((chapter, index) => (
            <Box key={chapter.key}>
              {index > 0 ? <Box style={styles.link} /> : null}
              <GuideChapter
                chapter={chapter}
                index={index}
                who={vm.copy.who}
                scrollY={vm.scrollY}
                viewport={vm.viewport}
                onLayout={vm.onChapterLayout}
              />
            </Box>
          ))}
          <GuideFaq faq={vm.copy.faq} />
          <CustomButton title={t('marketplace.guide.done')} size="lg" fullWidth onPress={vm.onBack} />
        </Box>
      </Animated.ScrollView>
      <GuideBar
        chapters={vm.chapters}
        current={vm.current}
        scrollY={vm.scrollY}
        viewport={vm.viewport}
        contentHeight={vm.contentHeight}
        heroHeight={vm.heroHeight}
        onBack={vm.onBack}
        onBarLayout={vm.onBarLayout}
      />
    </Layout>
  );
};
