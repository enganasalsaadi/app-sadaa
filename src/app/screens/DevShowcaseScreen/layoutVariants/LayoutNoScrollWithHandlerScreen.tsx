import React, { memo, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { useScrollHandler } from '@/shared/context/ScrollContext';

const ROW_COUNT = 20;

/**
 * Layout gallery variant: `withScroll={false}` opts out of Layout's built-in
 * scroll view. When a screen needs its own scrollable (e.g. to embed a
 * `SuperList`) it must wire `useScrollHandler()` into that scrollable itself
 * so the shared `ScrollContext` (and anything reacting to it, like
 * `FloatingBottomBar`'s auto-hide) still receives scroll updates.
 */
const LayoutNoScrollWithHandlerScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scrollHandler = useScrollHandler();

  const rows = useMemo(() => Array.from({ length: ROW_COUNT }, (_, i) => i), []);

  return (
    <Layout withScroll={false}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <Box gap="lg" pb="3xl">
          <CustomButton
            title={t('common.back')}
            onPress={goBack}
            variant="outline"
            size="sm"
          />
          <Text variant="h4">
            {t('devShowcase.layoutGallery.noScrollWithHandlerTitle')}
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            {t('devShowcase.layoutGallery.noScrollWithHandlerDescription')}
          </Text>

          {rows.map(index => (
            <Box
              key={index}
              py="lg"
              borderBottomWidth="hairline"
              borderColor={colors.border.default}
            >
              <Text variant="body">
                {t('devShowcase.layoutGallery.noScrollWithHandlerRow', {
                  index,
                })}
              </Text>
            </Box>
          ))}
        </Box>
      </Animated.ScrollView>
    </Layout>
  );
};

export const LayoutNoScrollWithHandlerScreen = memo(
  LayoutNoScrollWithHandlerScreenComponent,
);
