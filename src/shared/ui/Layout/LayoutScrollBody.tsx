import React, { memo } from 'react';
import { type ScrollViewProps, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/core/theme';
import type { SpacingToken } from '@/core/theme/types';
import { Box } from '../primitives/Box';
import type { LayoutScrollState } from './hooks/useLayoutScroll';

interface LayoutScrollBodyProps extends Pick<ScrollViewProps, 'refreshControl'> {
  children: React.ReactNode;
  keyboardAware: boolean;
  paddingX: SpacingToken | undefined;
  paddingY: SpacingToken | undefined;
  /** No footer below: pad past the home indicator so the last row is reachable. */
  clearBottomInset: boolean;
  /** Gap kept between the focused input and the keyboard (footer height + breathing room). */
  keyboardBottomOffset: number;
  scroll: LayoutScrollState;
  /** Edge-to-edge content before the padded body (hero, large title). */
  leading?: React.ReactNode;
  /** Pinned to the top of the viewport once scrolled to. */
  sticky?: React.ReactNode;
  /** Sticky row background, so content never shows through it. */
  bg: string;
  /** Room left for a header floating over the top of the scroll view. */
  topOffset: number;
}

const LayoutScrollBodyComponent: React.FC<LayoutScrollBodyProps> = ({
  children,
  keyboardAware,
  paddingX,
  paddingY,
  clearBottomInset,
  keyboardBottomOffset,
  scroll,
  refreshControl,
  leading,
  sticky,
  bg,
  topOffset,
}) => {
  const { bottom } = useSafeAreaInsets();

  const styles = useStyles(
    (theme): Record<'scroll' | 'content' | 'body' | 'sticky', ViewStyle> => {
      const px = paddingX ? theme.spacing[paddingX] : 0;
      const py = paddingY ? theme.spacing[paddingY] : 0;
      return {
        scroll: { flex: 1 },
        content: { flexGrow: 1, paddingTop: topOffset, paddingBottom: clearBottomInset ? bottom : 0 },
        body: { flexGrow: 1, paddingHorizontal: px, paddingVertical: py },
        sticky: { backgroundColor: bg, paddingHorizontal: px, paddingVertical: theme.spacing.sm },
      };
    },
    [paddingX, paddingY, clearBottomInset, bottom, bg, topOffset],
  );

  const hasSticky = sticky != null;

  const scrollViewProps = {
    style: styles.scroll,
    contentContainerStyle: styles.content,
    keyboardShouldPersistTaps: 'handled',
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 16,
    onScroll: scroll.onScroll,
    onContentSizeChange: scroll.onContentSizeChange,
    onLayout: scroll.onViewportLayout,
    refreshControl,
    // Children are [leading?, sticky?, body]; null slots are dropped before indexing.
    stickyHeaderIndices: hasSticky ? [leading != null ? 1 : 0] : undefined,
  } as const;

  const content = [
    leading != null ? <React.Fragment key="leading">{leading}</React.Fragment> : null,
    hasSticky ? (
      <Box key="sticky" style={styles.sticky}>
        {sticky}
      </Box>
    ) : null,
    <Box key="body" style={styles.body}>
      {children}
    </Box>,
  ];

  if (keyboardAware) {
    return (
      <KeyboardAwareScrollView bottomOffset={keyboardBottomOffset} {...scrollViewProps}>
        {content}
      </KeyboardAwareScrollView>
    );
  }

  return <Animated.ScrollView {...scrollViewProps}>{content}</Animated.ScrollView>;
};

export const LayoutScrollBody = memo(LayoutScrollBodyComponent);
