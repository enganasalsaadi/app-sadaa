import React, { memo, useCallback, useRef } from 'react';
import {
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  type ListViewToken,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { moderateScale } from '@/core/theme/utils/responsive';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Image } from '../primitives/Image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GalleryModalProps {
  images: string[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const GalleryModalComponent: React.FC<GalleryModalProps> = ({
  images,
  visible,
  initialIndex = 0,
  onClose,
  onIndexChange,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const listRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(initialIndex);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index !== null && index !== undefined) {
        activeIndexRef.current = index;
        onIndexChange?.(index);
      }
    },
    [onIndexChange],
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

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Box
            width={moderateScale(36)}
            height={moderateScale(36)}
            borderRadius="full"
            bg={colors.overlay}
            align="center"
            justify="center"
          >
            <X
              size={moderateScale(18)}
              color={colors.text.onBrand}
              strokeWidth={2}
            />
          </Box>
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          keyExtractor={(uri, i) => `gallery-${i}-${uri.slice(-20)}`}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item, index }) => (
            <Box
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              align="center"
              justify="center"
            >
              <Image
                uri={item}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
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
          )}
        />
      </Box>
    </Modal>
  );
};

export const GalleryModal = memo(GalleryModalComponent);

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 56,
    end: 20,
    zIndex: 10,
  },
  counter: {
    position: 'absolute',
    bottom: 48,
    start: 0,
    end: 0,
  },
});
