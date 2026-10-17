import React, { memo, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Checkbox, CustomInput, Notice, Text } from '@/shared/ui';
import type { NoticeProps } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import { DealSheetFrame } from '../../../components/DealSheetFrame';
import type { CreatorCampaignDetail } from '../../../types/campaign';
import { PITCH_MAX, type ApplyRefusal } from '../../../utils/campaignApply';
import type { CampaignApplyModel } from '../hooks/useCampaignApply';
import { ApplyAccountsSection } from './ApplyAccountsSection';
import { ApplyPriceSection } from './ApplyPriceSection';
import { ApplyTermsCard } from './ApplyTermsCard';

export interface CampaignApplySheetProps {
  campaign: CreatorCampaignDetail;
  apply: CampaignApplyModel;
}

const BANNER_TONE = {
  restricted: 'danger',
  profile: 'warning',
  limit: 'warning',
  other: 'danger',
  closed: 'warning',
} as const satisfies Record<ApplyRefusal['kind'], NonNullable<NoticeProps['tone']>>;

const Section = memo<{ title: string; note?: string; children: ReactNode }>(({ title, note, children }) => {
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Box row align="baseline" gap="sm">
        <Text variant="title" color={colors.text.primary}>
          {title}
        </Text>
        {note ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {note}
          </Text>
        ) : null}
      </Box>
      {children}
    </Box>
  );
});

/**
 * The application (PC5.1, frames 8 · 9 · 10): the price (a bid against its ruler with the live net
 * as an estimate, or the fixed price), one account per required platform, an optional pitch, the
 * frozen terms, then the consent and the hold that signs the 72-hour binding offer. Nothing is
 * disabled for being unfinished: the hold answers with what is missing.
 */
const CampaignApplySheetComponent: React.FC<CampaignApplySheetProps> = ({ campaign, apply }) => {
  const { t } = useTranslation();
  const { banner } = apply;
  const fixed = campaign.pricing.fixed;
  const profileAction = useMemo(
    () => (banner?.kind === 'profile' ? { label: t('marketplace.campaign.apply.banner.profile'), onPress: apply.openProfile } : undefined),
    [apply.openProfile, banner?.kind, t],
  );
  const offer = apply.isBid ? apply.bid : (fixed?.gross ?? null);
  const net = apply.isBid ? (apply.net?.net ?? null) : (fixed?.net ?? null);

  return (
    <DealSheetFrame
      visible={apply.visible}
      onClose={apply.close}
      title={t('marketplace.campaign.apply.title')}
      body={t('marketplace.campaign.apply.subtitle', { brand: campaign.brand.name, title: campaign.title })}
      footer={
        <Box gap="md">
          <Checkbox
            checked={apply.consent}
            onChange={apply.toggleConsent}
            label={t('marketplace.campaign.apply.consent')}
            error={apply.consentMissing ? t('marketplace.campaign.apply.consentRequired') : undefined}
          />
          <DealHoldToSign
            label={t('marketplace.campaign.apply.hold.label')}
            caption={t('marketplace.campaign.apply.hold.caption')}
            hint={t('marketplace.deals.respond.hold.hint')}
            accessibilityLabel={t('marketplace.campaign.apply.hold.a11y')}
            accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
            onComplete={apply.sign}
          />
        </Box>
      }
    >
      {banner ? (
        <Notice tone={BANNER_TONE[banner.kind]} message={banner.message} action={profileAction} />
      ) : null}
      <Section
        title={t('marketplace.campaign.apply.price.title')}
        note={apply.isBid ? t('marketplace.campaign.apply.price.bidding') : undefined}
      >
        <ApplyPriceSection pricing={campaign.pricing} apply={apply} />
      </Section>
      <Section title={t('marketplace.campaign.apply.accounts.title')}>
        <ApplyAccountsSection apply={apply} />
      </Section>
      <Section title={t('marketplace.campaign.apply.pitch.title')} note={t('marketplace.campaign.apply.pitch.optional')}>
        <CustomInput
          value={apply.pitch}
          onChangeText={apply.setPitch}
          placeholder={t('marketplace.campaign.apply.pitch.placeholder')}
          accessibilityLabel={t('marketplace.campaign.apply.pitch.title')}
          maxLength={PITCH_MAX}
          showCount
          multiline
          numberOfLines={4}
        />
      </Section>
      <Section title={t('marketplace.campaign.apply.terms.title')}>
        <ApplyTermsCard campaign={campaign} offer={offer} net={net} estimated={apply.isBid} />
      </Section>
    </DealSheetFrame>
  );
};

export const CampaignApplySheet = memo(CampaignApplySheetComponent);
