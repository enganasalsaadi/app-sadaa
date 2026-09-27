import type React from 'react';

export interface TabConfig {
  id: number;
  label: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth?: number;
  }>;
  onPress: () => void;
}
