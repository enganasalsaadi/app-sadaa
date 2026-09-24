import type { ReactElement } from 'react';
import type {
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import type { FlashListProps } from '@shopify/flash-list';

export type ListLayout = 'list' | 'grid-2' | 'grid-3';

export interface SuperListProps<T> {
  // ─── Data ──────────────────────────────────────────────────────────────
  data: T[];
  renderItem: FlashListProps<T>['renderItem'];
  keyExtractor: (item: T, index: number) => string;

  // ─── Loading / Error ───────────────────────────────────────────────────
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  isRefreshing?: boolean;
  isError?: boolean;

  // ─── Pagination ────────────────────────────────────────────────────────
  hasNextPage?: boolean;
  onEndReached?: () => void;
  /** Items from the end that triggers pre-fetch (default: 5) */
  prefetchThreshold?: number;

  // ─── Pull-to-refresh ───────────────────────────────────────────────────
  onRefresh?: () => void;

  // ─── Empty / Error UI ──────────────────────────────────────────────────
  onRetry?: () => void;
  emptyMessage?: string;
  errorMessage?: string;

  // ─── Layout ────────────────────────────────────────────────────────────
  layout?: ListLayout;

  // ─── Performance ───────────────────────────────────────────────────────
  /** Override column span per item (FlashList v2: only `span` is supported) */
  overrideItemLayout?: FlashListProps<T>['overrideItemLayout'];

  // ─── Scroll restoration (persisted via MMKV across restarts) ──────────
  scrollRestorationKey?: string;

  // ─── Scroll integration (wires into FloatingBottomBar / ScrollContext) ─
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;

  // ─── Extras ────────────────────────────────────────────────────────────
  ListHeaderComponent?: ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Number of skeleton placeholder cards shown during initial load */
  skeletonCount?: number;
  /** Custom skeleton shown during initial load (overrides the default card skeleton) */
  ListSkeletonComponent?: ReactElement | null;
  testID?: string;
}
