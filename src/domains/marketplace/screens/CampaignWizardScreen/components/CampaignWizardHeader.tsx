import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import { WizardRailHeader, type WizardRailStrip } from '../../../components/WizardRailHeader';
import { WizardSaveLabel } from '../../../components/WizardSaveLabel';
import type { WizardRailStep } from '../../../components/WizardRailStop';
import { CAMPAIGN_STEP_ICON, CAMPAIGN_STEP_LABEL } from '../../../constants/campaignWizard';
import type { CampaignWizardStep } from '../../../types/campaignDraft';
import { wizardRailState } from '../../../utils/campaignWizard';
import { useCampaignWizard } from '../CampaignWizardContext';

const THUMB = moderateScale(28);

/**
 * The wizard's navy bar: close, the campaign's name (with its cover) in place of «new campaign» as
 * soon as it has one, the save state, and the four-step rail. Any step is a tap away once the draft
 * exists; a step left behind with something still missing wears the warning tone. A failure that
 * stops saving rides under the rail with its way out; when the team asked for changes, the strip
 * leads to their note on the review step. Editing a live campaign there is no save state (nothing
 * saves until «save»), and once its terms locked no rail either: one step is left.
 */
const CampaignWizardHeaderComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    values,
    step,
    stepIndex,
    progress,
    campaignId,
    goToStep,
    onClose,
    saveState,
    failure,
    retry,
    confirmLeave,
    cover,
    changesRequested,
    steps: stepKeys,
    live,
  } = useCampaignWizard();

  const styles = useStyles(
    ({ borderWidths, radii }): Record<'thumb', ViewStyle> => ({
      thumb: {
        width: THUMB,
        height: THUMB,
        borderRadius: radii.sm,
        overflow: 'hidden',
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.sm,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.badge, colors.glass.border],
  );

  const steps = useMemo<WizardRailStep<CampaignWizardStep>[]>(
    () =>
      stepKeys.map((key, index) => {
        const label = t(CAMPAIGN_STEP_LABEL[key]);
        const state = wizardRailState(key, step, progress);
        return {
          key,
          label,
          icon: CAMPAIGN_STEP_ICON[key],
          state,
          tappable: campaignId !== null && state !== 'now',
          a11yLabel: t(
            state === 'missing'
              ? 'marketplace.campaign.wizard.header.stepMissingA11y'
              : 'marketplace.campaign.wizard.header.stepA11y',
            { step: index + 1, label },
          ),
        };
      }),
    [campaignId, progress, step, stepKeys, t],
  );

  const strip = useMemo<WizardRailStrip | undefined>(() => {
    if (!failure) {
      if (!changesRequested || step === 'review') return undefined;
      return {
        text: t('marketplace.campaign.wizard.strip.changesRequested'),
        actionLabel: t('marketplace.campaign.wizard.strip.readNote'),
        onAction: () => {
          goToStep('review').catch(() => undefined);
        },
      };
    }
    if (failure.kind === 'conflict') {
      return {
        text: failure.error.message,
        actionLabel: t('marketplace.campaign.wizard.strip.leave'),
        onAction: confirmLeave,
      };
    }
    return {
      text: failure.kind === 'limit' ? failure.error.message : t('marketplace.campaign.wizard.strip.saveFailed'),
      actionLabel: t('marketplace.campaign.wizard.strip.retry'),
      onAction: () => {
        retry().catch(() => undefined);
      },
    };
  }, [changesRequested, confirmLeave, failure, goToStep, retry, step, t]);

  const labels = useMemo(
    () => ({
      saving: t('marketplace.campaign.wizard.header.saving'),
      saved: t('marketplace.campaign.wizard.header.saved'),
      failed: t('marketplace.campaign.wizard.header.saveFailed'),
    }),
    [t],
  );

  const name = values.title.trim();
  const thumbUri = cover.upload?.source.uri ?? cover.coverUrl;

  return (
    <WizardRailHeader
      steps={steps}
      current={stepIndex}
      closeLabel={t('marketplace.campaign.wizard.header.close')}
      onClose={onClose}
      onStepPress={goToStep}
      strip={strip}
      trailing={live ? null : <WizardSaveLabel state={saveState} labels={labels} />}
      center={
        <>
          {thumbUri ? (
            <Box style={styles.thumb}>
              <Image uri={thumbUri} size={THUMB} />
            </Box>
          ) : null}
          <Box flex={1}>
            <Text
              variant="title"
              color={name ? colors.text.onBrand : colors.text.onBrandMuted}
              numberOfLines={1}
              align="center"
            >
              {name || t('marketplace.campaign.wizard.header.newTitle')}
            </Text>
          </Box>
        </>
      }
    />
  );
};

export const CampaignWizardHeader = memo(CampaignWizardHeaderComponent);
