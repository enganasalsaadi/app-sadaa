import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useStyles } from '@/core/theme';
import { Box } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import { useOfferBuilder } from '../OfferBuilderContext';

/** The review step's footer: hold to sign and send the offer. */
const HoldToSignComponent: React.FC = () => {
  const { t } = useTranslation();
  const { onSign, sending, creatorName } = useOfferBuilder();
  const { bottom } = useSafeAreaInsets();

  const styles = useStyles(
    ({ spacing }): Record<'wrap', ViewStyle> => ({
      // The footer slot already pads by the home-indicator inset; top it up to at least `lg`.
      wrap: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: Math.max(0, spacing.lg - bottom),
      },
    }),
    [bottom],
  );

  return (
    <Box style={styles.wrap}>
      <DealHoldToSign
        label={t('marketplace.offer.sign.hold')}
        caption={t('marketplace.offer.sign.caption')}
        hint={t('marketplace.offer.sign.hint')}
        accessibilityLabel={t('marketplace.offer.sign.hold')}
        accessibilityHint={t('marketplace.offer.sign.a11yHint')}
        onComplete={onSign}
        sending={sending}
        sendingLabel={t('marketplace.offer.sign.sending', {
          name: creatorName,
        })}
      />
    </Box>
  );
};

export const HoldToSign = memo(HoldToSignComponent);
