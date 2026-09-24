import React from 'react';

import { useTheme } from '@/core/theme';

import { Box } from '../primitives';

import { TabItem } from './TabItem';
import type { BottomBarProps } from './types';

export const BottomBar: React.FC<BottomBarProps> = ({
  tabs,
  activeTabId,
  centerGap = 0,
}) => {
  const { colors } = useTheme();

  // Split the tabs into two halves so a fixed-width gap can be reserved in the
  // middle for a raised center FAB (2 + gap + 2 layout).
  const mid = Math.ceil(tabs.length / 2);
  const left = centerGap > 0 ? tabs.slice(0, mid) : tabs;
  const right = centerGap > 0 ? tabs.slice(mid) : [];

  const renderTab = (tab: (typeof tabs)[number]) => (
    <TabItem
      key={tab.id}
      isActive={activeTabId === tab.id}
      label={tab.label}
      icon={tab.icon}
      onPress={tab.onPress}
    />
  );

  return (
    <Box
      row
      borderRadius="full"
      mx="lg"
      mb="sm"
      bg={colors.surface.main}
      height={60}
      align="center"
      shadow="md"
      px="md"
      overflow="hidden"
      borderWidth="hairline"
      borderColor={colors.border.strong}
    >
      {left.map(renderTab)}
      {centerGap > 0 && <Box width={centerGap} />}
      {right.map(renderTab)}
    </Box>
  );
};
