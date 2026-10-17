import React, { memo, useCallback, useState } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import { monogramOf } from '../utils/creatorText';

export interface ApplicantFaceProps {
  name: string;
  avatarUrl: string | null;
  size: number;
  /** Monogram text size; defaults to a title. */
  large?: boolean;
}

/** A creator's face as a circle: the photo, or the monogram on `brand.soft` when there is none (or it broke). */
const ApplicantFaceComponent: React.FC<ApplicantFaceProps> = ({ name, avatarUrl, size, large = false }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const showImage = !!avatarUrl && !failed;
  return (
    <Box
      width={size}
      height={size}
      borderRadius="full"
      overflow="hidden"
      align="center"
      justify="center"
      bg={colors.brand.soft}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showImage ? (
        <Image uri={avatarUrl ?? undefined} width={size} height={size} resizeMode="cover" onError={onError} />
      ) : (
        <Text variant={large ? 'h3' : 'bodyMedium'} color={colors.brand.text}>
          {monogramOf(name)}
        </Text>
      )}
    </Box>
  );
};

export const ApplicantFace = memo(ApplicantFaceComponent);
