import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';

interface WizardSaveLabelProps {
  state: 'idle' | 'saving' | 'saved' | 'error';
  labels: { saving: string; saved: string; failed: string };
}

/** The save state as words, tuned for the navy bar; nothing before the first save. */
const WizardSaveLabelComponent: React.FC<WizardSaveLabelProps> = ({ state, labels }) => {
  const { colors } = useTheme();
  if (state === 'idle') return null;
  const [label, color] =
    state === 'saving'
      ? [labels.saving, colors.text.onBrandMuted]
      : state === 'saved'
        ? [labels.saved, colors.glass.iconInteractive]
        : [labels.failed, colors.glass.iconWarning];
  return (
    <Text variant="caption" color={color} numberOfLines={1} accessibilityLiveRegion="polite">
      {label}
    </Text>
  );
};

export const WizardSaveLabel = memo(WizardSaveLabelComponent);
