import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Plus, UserRound } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import type { DealParty } from '../../../types';

const FACE = moderateScale(52);
const OVERLAP = moderateScale(-14);
const WASH = moderateScale(96);
const SLOTS = 2;
const MESSAGE_MAX = moderateScale(290);

interface DealsWelcomeProps {
  /** Real creators from Home's rails; empty slots fall back to a plain person mark. */
  faces: DealParty[];
  onExplore: () => void;
}

/**
 * No open deal yet: two creators and a «+» as the invitation, one line on how a deal works
 * here, and the way to Explore.
 */
const DealsWelcomeComponent: React.FC<DealsWelcomeProps> = ({ faces, onExplore }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ colors: palette, borderWidths }): Record<'wash' | 'seat' | 'overlap' | 'message', ViewStyle> => ({
      wash: { ...StyleSheet.absoluteFill, bottom: undefined, height: WASH },
      seat: {
        width: FACE + borderWidths.lg * 2,
        height: FACE + borderWidths.lg * 2,
        borderRadius: FACE,
        borderWidth: borderWidths.lg,
        borderColor: palette.surface.main,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      overlap: { marginStart: OVERLAP },
      message: { maxWidth: MESSAGE_MAX },
    }),
    [],
  );

  return (
    <Box
      mx="xl"
      px="lg"
      pt="2xl"
      pb="lg"
      borderRadius="xl"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      align="center"
      overflow="hidden"
    >
      <LinearGradient
        colors={[colors.interactive.soft, colors.layout.transparent]}
        style={styles.wash}
        pointerEvents="none"
      />
      <Box row mb="lg" importantForAccessibility="no-hide-descendants">
        {Array.from({ length: SLOTS }, (_, at) => {
          const face = faces[at];
          return (
            <Box key={at} style={[styles.seat, at > 0 ? styles.overlap : undefined]} bg={colors.interactive.soft}>
              {face ? (
                <DealFace party={face} size={FACE} />
              ) : (
                <UserRound size={sizes.icon.md} color={colors.interactive.text} />
              )}
            </Box>
          );
        })}
        <Box style={[styles.seat, styles.overlap]} bg={colors.button.primary.bg}>
          <Plus size={sizes.icon.md} color={colors.button.primary.text} strokeWidth={iconStroke.bold} />
        </Box>
      </Box>
      <Text variant="h4" align="center" accessibilityRole="header">
        {t('marketplace.brandHome.deals.welcome.title')}
      </Text>
      <Box style={styles.message} mt="xs">
        <Text variant="bodySmall" align="center" color={colors.text.tertiary}>
          {t('marketplace.brandHome.deals.welcome.message')}
        </Text>
      </Box>
      <Box alignSelf="stretch" mt="lg">
        <CustomButton title={t('marketplace.brandHome.deals.welcome.cta')} onPress={onExplore} fullWidth />
      </Box>
    </Box>
  );
};

export const DealsWelcome = memo(DealsWelcomeComponent);
