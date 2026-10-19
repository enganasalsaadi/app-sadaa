import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Hash, Link2, Lock, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, InlineError, Notice, Text, SheetFrame } from '@/shared/ui';
import { BriefBlock } from '../../../components/brief/BriefBlock';
import { BriefTemplates } from '../../../components/brief/BriefTemplates';
import { BriefToneChips } from '../../../components/brief/BriefToneChips';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignBriefFiles } from './CampaignBriefFiles';
import { CampaignBriefList } from './CampaignBriefList';
import { CampaignBriefMeasure } from './CampaignBriefMeasure';

/**
 * The optional private brief in full: templates, talking points, don'ts, hashtags, mentions,
 * links, a discount code, a tracking link and reference files. All of it stays hidden from the
 * creator until the deal is funded, and the draft keeps it as it is typed.
 */
const PrivateBriefSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { brief } = useCampaignWizard();
  const { open, closeSheet, applyTemplate, activeTone, toggleTone, briefError } = brief;
  const lists = brief.brief;
  const count = (size: number) => t('marketplace.offer.brief.count', { count: size, max: DEAL_BRIEF_LIMITS.maxEntries });

  return (
    <SheetFrame
      visible={open}
      onClose={closeSheet}
      title={t('marketplace.campaign.wizard.requirements.brief.sheet.title')}
      body={t('marketplace.campaign.wizard.requirements.brief.sheet.body')}
      footer={<CustomButton title={t('marketplace.campaign.wizard.requirements.brief.sheet.done')} onPress={closeSheet} fullWidth />}
    >
      <Notice tone="info" icon={Lock} message={t('marketplace.campaign.wizard.requirements.brief.sheet.lock')} />
      {briefError ? <InlineError error={briefError} /> : null}
      <BriefTemplates onApply={applyTemplate} />
      <BriefBlock
        icon={MessageCircle}
        title={t('marketplace.offer.brief.talk.title')}
        body={t('marketplace.offer.brief.talk.body')}
        count={count(lists.talkingPoints.length)}
      >
        <CampaignBriefList field="talkingPoints" look="points" placeholder={t('marketplace.offer.brief.talk.placeholder')} />
        <BriefToneChips active={activeTone} onToggle={toggleTone} />
      </BriefBlock>
      <BriefBlock
        icon={Ban}
        title={t('marketplace.offer.brief.donts.title')}
        body={t('marketplace.offer.brief.donts.body')}
        count={count(lists.donts.length)}
      >
        <CampaignBriefList field="donts" look="points" tone="avoid" placeholder={t('marketplace.offer.brief.donts.placeholder')} />
      </BriefBlock>
      <BriefBlock icon={Hash} title={t('marketplace.offer.brief.tags.title')} body={t('marketplace.offer.brief.tags.body')}>
        <Box gap="sm">
          <Text variant="overline" color={colors.text.tertiary}>
            {t('marketplace.offer.brief.tags.hashtags')} · {count(lists.hashtags.length)}
          </Text>
          <CampaignBriefList
            field="hashtags"
            look="chips"
            placeholder={t('marketplace.offer.brief.tags.hashtagsPlaceholder')}
            autoCapitalize="none"
          />
        </Box>
        <Box gap="sm">
          <Text variant="overline" color={colors.text.tertiary}>
            {t('marketplace.offer.brief.tags.mentions')} · {count(lists.mentions.length)}
          </Text>
          <CampaignBriefList
            field="mentions"
            look="chips"
            placeholder={t('marketplace.offer.brief.tags.mentionsPlaceholder')}
            autoCapitalize="none"
          />
        </Box>
      </BriefBlock>
      <BriefBlock
        icon={Link2}
        title={t('marketplace.campaign.wizard.requirements.brief.sheet.links.title')}
        body={t('marketplace.campaign.wizard.requirements.brief.sheet.links.body')}
        count={count(lists.links.length)}
      >
        <CampaignBriefList
          field="links"
          look="points"
          placeholder={t('marketplace.campaign.wizard.requirements.brief.sheet.links.placeholder')}
          autoCapitalize="none"
        />
      </BriefBlock>
      <CampaignBriefMeasure />
      <CampaignBriefFiles />
    </SheetFrame>
  );
};

export const PrivateBriefSheet = memo(PrivateBriefSheetComponent);
