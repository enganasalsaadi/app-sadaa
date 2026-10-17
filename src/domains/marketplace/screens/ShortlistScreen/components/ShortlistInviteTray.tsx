import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import type { ExploreCreator } from '../../../types/explore';

const FACE = moderateScale(40);
const OVERLAP = moderateScale(12);
const TRAY_HEIGHT = moderateScale(72);
/** More faces than this stop reading as faces; the count says the rest. */
const MAX_FACES = 3;

export interface ShortlistInviteTrayProps {
  picks: readonly ExploreCreator[];
  onInvite: () => void;
}

/**
 * Invite mode's floating tray: the faces picked so far, how many, and «Invite», which opens the
 * campaign picker once at least one is chosen.
 */
const ShortlistInviteTrayComponent: React.FC<ShortlistInviteTrayProps> = ({ picks, onInvite }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { bg, text } = colors.button.primary;
  const styles = useStyles(
    ({ spacing, radii, shadows }): Record<'tray' | 'overlap', ViewStyle> => ({
      tray: {
        position: 'absolute',
        start: spacing.xl,
        end: spacing.xl,
        bottom: Math.max(bottom, spacing.md) + spacing.sm,
        minHeight: TRAY_HEIGHT,
        borderRadius: radii.xl,
        paddingHorizontal: spacing.md,
        backgroundColor: bg,
        ...shadows.lg,
      },
      overlap: { marginStart: -OVERLAP },
    }),
    [bottom, bg],
  );
  const faces = picks.slice(-MAX_FACES);

  return (
    <Box row align="center" gap="md" style={styles.tray}>
      <Box row align="center" accessible={false}>
        {faces.map((pick, index) => (
          <Box key={pick.slug} style={index > 0 ? styles.overlap : undefined}>
            <ApplicantFace name={pick.displayName} avatarUrl={pick.avatarUrl} size={FACE} />
          </Box>
        ))}
      </Box>
      <Box flex={1}>
        <Text variant="bodyMedium" color={text} numberOfLines={1}>
          {t('marketplace.shortlist.invite.tray.picked', { count: picks.length })}
        </Text>
        {picks.length === 0 ? (
          <Text variant="caption" color={text} numberOfLines={2}>
            {t('marketplace.shortlist.invite.tray.hint')}
          </Text>
        ) : null}
      </Box>
      <CustomButton size="sm" variant="secondary" title={t('marketplace.shortlist.invite.tray.go')} onPress={onInvite} />
    </Box>
  );
};

export const ShortlistInviteTray = memo(ShortlistInviteTrayComponent);
