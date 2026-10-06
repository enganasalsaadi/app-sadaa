import React, { memo } from 'react';
import { Box, SectionHeader } from '@/shared/ui';
import { MediaKitCard } from '@/domains/identity';
import { useMediaKitCardDemo } from './hooks/useMediaKitCardDemo';

const MediaKitCardDemoComponent: React.FC = () => {
  const variants = useMediaKitCardDemo();

  return (
    <Box gap="xl">
      {variants.map(variant => (
        <Box key={variant.id} gap="sm">
          <SectionHeader title={variant.title} />
          <MediaKitCard {...variant.props} />
        </Box>
      ))}
    </Box>
  );
};

export const MediaKitCardDemo = memo(MediaKitCardDemoComponent);
