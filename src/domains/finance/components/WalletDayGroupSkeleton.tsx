import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Divider, Skeleton } from '@/shared/ui';

const DAY_LABEL_WIDTH = moderateScale(80);
const DAY_LABEL_HEIGHT = moderateScale(12);
const TITLE_HEIGHT = moderateScale(14);
const META_HEIGHT = moderateScale(10);
const AMOUNT_WIDTH = moderateScale(64);
const AMOUNT_HEIGHT = moderateScale(16);

export interface WalletDayGroupSkeletonProps {
  rows: number;
}

/** A day group's shape while lines load: caption bar + a card of row placeholders. */
const WalletDayGroupSkeletonComponent: React.FC<WalletDayGroupSkeletonProps> = ({ rows }) => {
  const { sizes } = useTheme();

  return (
    <Box gap="sm" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton width={DAY_LABEL_WIDTH} height={DAY_LABEL_HEIGHT} borderRadius="xs" />
      <Card px="lg" py="xs">
        {Array.from({ length: rows }, (_, index) => (
          <Box key={index}>
            {index > 0 ? <Divider /> : null}
            <Box row align="center" gap="md" py="md">
              <Skeleton width={sizes.iconButton.md} height={sizes.iconButton.md} borderRadius="md" />
              <Box flex={1} gap="sm">
                <Skeleton width="60%" height={TITLE_HEIGHT} borderRadius="xs" />
                <Skeleton width="30%" height={META_HEIGHT} borderRadius="xs" />
              </Box>
              <Skeleton width={AMOUNT_WIDTH} height={AMOUNT_HEIGHT} borderRadius="xs" />
            </Box>
          </Box>
        ))}
      </Card>
    </Box>
  );
};

export const WalletDayGroupSkeleton = memo(WalletDayGroupSkeletonComponent);
