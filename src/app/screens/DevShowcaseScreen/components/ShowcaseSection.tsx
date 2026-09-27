import React, { memo } from 'react';
import { Box, Card, Text } from '@/shared/ui';

interface ShowcaseSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Card frame around one registry entry's demo. */
const ShowcaseSectionComponent: React.FC<ShowcaseSectionProps> = ({
  title,
  children,
}) => (
  <Card>
    <Box gap="lg">
      <Text variant="title">{title}</Text>
      {children}
    </Box>
  </Card>
);

export const ShowcaseSection = memo(ShowcaseSectionComponent);
