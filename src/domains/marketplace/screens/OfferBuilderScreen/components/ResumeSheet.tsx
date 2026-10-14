import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, Box, CustomButton, Text } from '@/shared/ui';
import { DEAL_DRAFT_TTL_DAYS } from '../../../constants/dealOffer';
import { useOfferBuilder } from '../OfferBuilderContext';
import { SheetTitle } from './SheetTitle';

/** An unsent draft with this creator already exists: pick it up, or start over (the old one goes). */
const ResumeSheetComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { showResume, resumedAt, onResume, onStartFresh, creatorName, phase } = useOfferBuilder();
  const styles = useStyles(
    ({ radii }): Record<'mark', ViewStyle> => ({
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors.interactive.soft, sizes.icon.xl],
  );

  return (
    // Swiping it away keeps the draft: starting over deletes it, so that needs the button.
    <BottomSheet visible={showResume && phase === 'building'} onClose={onResume}>
      <Box px="xl" pb="2xl" gap="lg" align='center'>
        <Box style={styles.mark} align="center" justify="center">
          <History size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <SheetTitle title={t('marketplace.offer.resume.title', { name: creatorName })} body={t('marketplace.offer.resume.body')} />
        {resumedAt !== null ? (
          <Text variant="label" color={colors.interactive.text}>
            {t('marketplace.offer.resume.savedAt', {
              date: formatDate(resumedAt, { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }, i18n.language),
            })}
          </Text>
        ) : null}
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.offer.resume.fine', { days: DEAL_DRAFT_TTL_DAYS })}
        </Text>
        
      </Box>
      <Box gap="sm" px="xl">
          <CustomButton title={t('marketplace.offer.resume.resume')} size="lg" fullWidth onPress={onResume} />
          <CustomButton title={t('marketplace.offer.resume.fresh')} variant="ghost" fullWidth onPress={onStartFresh} />
        </Box>
    </BottomSheet>
  );
};

export const ResumeSheet = memo(ResumeSheetComponent);
