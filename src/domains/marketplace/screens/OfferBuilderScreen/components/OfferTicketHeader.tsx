import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Layers, PenLine, Signature, type LucideIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Avatar, Box, Text } from '@/shared/ui';
import { WizardRailHeader } from '../../../components/WizardRailHeader';
import { WizardSaveLabel } from '../../../components/WizardSaveLabel';
import type { WizardRailStep } from '../../../components/WizardRailStop';
import { monogramOf } from '../../../utils/creatorText';
import { useOfferBuilder } from '../OfferBuilderContext';
import { OFFER_STEPS, type OfferStep } from '../hooks/useOfferBuilderScreen';

const AVATAR = moderateScale(28);

const STEP_LABEL = {
  services: 'marketplace.offer.header.steps.services',
  brief: 'marketplace.offer.header.steps.brief',
  review: 'marketplace.offer.header.steps.sign',
} as const satisfies Record<OfferStep, string>;

const STEP_ICON = {
  services: Layers,
  brief: PenLine,
  review: Signature,
} as const satisfies Record<OfferStep, LucideIcon>;

/**
 * The offer's navy bar: close, the creator (photo + name, centred), the save state as words, and the
 * three-step rail where only steps already passed can be tapped.
 */
const OfferTicketHeaderComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { creator, creatorName, stepIndex, goToStep, onClose, quoteBlocker, onBlockerAction, saveState } =
    useOfferBuilder();

  const styles = useStyles(
    ({ borderWidths, radii }): Record<'face', ViewStyle> => ({
      face: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.sm,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.badge, colors.glass.border],
  );

  const steps = useMemo<WizardRailStep<OfferStep>[]>(
    () =>
      OFFER_STEPS.map((step, index) => {
        const label = t(STEP_LABEL[step]);
        return {
          key: step,
          label,
          icon: STEP_ICON[step],
          state: index < stepIndex ? 'done' : index === stepIndex ? 'now' : 'todo',
          tappable: index < stepIndex,
          a11yLabel: t('marketplace.offer.header.stepA11y', { step: index + 1, label }),
        };
      }),
    [stepIndex, t],
  );

  const strip = useMemo(
    () =>
      quoteBlocker
        ? {
            text: quoteBlocker.label,
            actionLabel: t('marketplace.offer.blocked.strip'),
            onAction: () => onBlockerAction(quoteBlocker),
          }
        : undefined,
    [onBlockerAction, quoteBlocker, t],
  );

  const labels = useMemo(
    () => ({
      saving: t('marketplace.offer.header.saving'),
      saved: t('marketplace.offer.header.saved'),
      failed: t('marketplace.offer.header.saveFailed'),
    }),
    [t],
  );

  return (
    <WizardRailHeader
      steps={steps}
      current={stepIndex}
      closeLabel={t('marketplace.offer.header.close')}
      onClose={onClose}
      onStepPress={goToStep}
      strip={strip}
      trailing={<WizardSaveLabel state={saveState === 'failed' ? 'error' : saveState} labels={labels} />}
      center={
        <>
          <Box style={styles.face}>
            {creator?.avatarUrl ? (
              <Avatar uri={creator.avatarUrl} size={AVATAR} />
            ) : (
              <Text variant="caption" color={colors.text.onBrand}>
                {monogramOf(creatorName)}
              </Text>
            )}
          </Box>
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
            {creatorName}
          </Text>
        </>
      }
    />
  );
};

export const OfferTicketHeader = memo(OfferTicketHeaderComponent);
