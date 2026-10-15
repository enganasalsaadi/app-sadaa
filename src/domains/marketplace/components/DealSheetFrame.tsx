import React, { memo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box } from '@/shared/ui';
import { DealSheetHeading } from './DealSheetHeading';

/** Tall forms (ruler + reason + hold) still fit small phones with the keyboard up. */
const MAX_HEIGHT_RATIO = 0.92;

export interface DealSheetFrameProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  /** In the white header, over the sunken body. */
  title: string;
  body?: string;
  /** The sheet's one decision, pinned in the white footer. */
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The respond sheets' shell: a white header (handle + title), the content sunken on the page
 * color so its cards stand off it, and the decision pinned in a white footer that stays above the
 * keyboard. Only the middle scrolls.
 */
const DealSheetFrameComponent: React.FC<DealSheetFrameProps> = ({
  visible,
  onClose,
  onDismissed,
  title,
  body,
  footer,
  children,
}) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      maxHeight={height * MAX_HEIGHT_RATIO}
      bg={colors.layout.base}
      header={
        <Box px="xl" pb="lg">
          <DealSheetHeading title={title} body={body} />
        </Box>
      }
      footer={
        <Box px="xl" pt="md" pb="md">
          {footer}
        </Box>
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box px="xl" py="lg" gap="lg">
          {children}
        </Box>
      </ScrollView>
    </BottomSheet>
  );
};

export const DealSheetFrame = memo(DealSheetFrameComponent);
