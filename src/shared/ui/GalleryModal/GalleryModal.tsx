import React, { memo, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  FlatList,
  StatusBar,
  useWindowDimensions,
  type ListViewToken,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Image } from '../primitives/Image';
import { Pressable } from '../primitives/Pressable';

export interface GalleryModalProps {
  images: string[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

const GalleryModalComponent: React.FC<GalleryModalProps> = ({
  images,
  visible,
  initialIndex = 0,
  onClose,
  onIndexChange,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);

  const styles = useStyles(
    ({ spacing, zIndices }): Record<'closeButton' | 'counter', ViewStyle> => ({
      closeButton: {
        position: 'absolute',
        top: insets.top + spacing.lg,
        end: spacing.xl,
        zIndex: zIndices.overlay,
      },
      counter: {
        position: 'absolute',
        bottom: spacing['5xl'],
        start: 0,
        end: 0,
      },
    }),
    [insets.top],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index !== null && index !== undefined) {
        onIndexChange?.(index);
      }
    },
    [onIndexChange],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <Box width={width} height={height} align="center" justify="center">
        <Image
          uri={item}
          width={width}
          height={height}
          resizeMode="contain"
          showSkeleton={false}
        />
        <Box style={styles.counter} align="center">
          <Box px="lg" py="sm" borderRadius="full" bg={colors.overlay}>
            <Text variant="caption" color={colors.text.onBrand}>
              {index + 1} / {images.length}
            </Text>
          </Box>
        </Box>
      </Box>
    ),
    [width, height, styles.counter, colors, images.length],
  );

  const closeIcon = useMemo(
    () => (
      <X
        size={sizes.icon.sm}
        color={colors.text.onBrand}
        strokeWidth={iconStroke.regular}
      />
    ),
    [sizes.icon.sm, colors.text.onBrand],
  );

  if (images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Box flex={1} bg={colors.mediaBackdrop}>
        <StatusBar barStyle="light-content" />

        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={sizes.hitSlop.lg}
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="full"
          bg={colors.overlay}
          align="center"
          justify="center"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          {closeIcon}
        </Pressable>

        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          keyExtractor={(uri, i) => `gallery-${i}-${uri.slice(-20)}`}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          renderItem={renderItem}
        />
      </Box>
    </Modal>
  );
};

export const GalleryModal = memo(GalleryModalComponent);
