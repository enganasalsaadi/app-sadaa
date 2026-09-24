import type React from 'react';

export interface TabConfig {
  id: number;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  onPress: () => void;
}

export interface BottomBarProps {
  tabs: TabConfig[];
  activeTabId: number;
  /** Reserve a fixed-width gap in the middle for a raised center FAB. */
  centerGap?: number;
}

export interface TabItemProps {
  isActive: boolean;
  label: string;
  icon: TabConfig['icon'];
  onPress: () => void;
}
