import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Hash, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, StaggerIn, Text } from '@/shared/ui';
import { BriefBlock } from '../../../components/brief/BriefBlock';
import { BriefEntryAdder } from '../../../components/brief/BriefEntryAdder';
import { BriefFileTiles } from '../../../components/brief/BriefFileTiles';
import { BriefTemplates } from '../../../components/brief/BriefTemplates';
import { BriefToneChips } from '../../../components/brief/BriefToneChips';
import { DEAL_UPLOAD_LIMIT } from '../../../constants/dealUploads';
import { useOfferBuilder } from '../OfferBuilderContext';
import { BriefFieldEntries } from './BriefFieldEntries';
import { BriefMeasure } from './BriefMeasure';

/** Step 2: the brief. Every field is optional; a template fills the lists in one tap. */
const BriefStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { creatorName, brief, attachments, openFilesSheet } = useOfferBuilder();
  const { addEntry, applyTemplate } = brief;
  const addPoint = useCallback((raw: string) => addEntry('talkingPoints', raw), [addEntry]);
  const addDont = useCallback((raw: string) => addEntry('donts', raw), [addEntry]);
  const addHashtag = useCallback((raw: string) => addEntry('hashtags', raw), [addEntry]);
  const addMention = useCallback((raw: string) => addEntry('mentions', raw), [addEntry]);

  return (
    <Box gap="2xl">
      <Box gap="xs">
        <Text variant="h3" color={colors.text.primary}>
          {t('marketplace.offer.brief.title', { name: creatorName })}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.brief.body')}
        </Text>
      </Box>
      <BriefTemplates onApply={applyTemplate} />
      <StaggerIn gap="lg">
        <BriefBlock icon={MessageCircle} title={t('marketplace.offer.brief.talk.title')} body={t('marketplace.offer.brief.talk.body')}>
          <BriefFieldEntries field="talkingPoints" look="points" />
          <BriefEntryAdder placeholder={t('marketplace.offer.brief.talk.placeholder')} onAdd={addPoint} />
          <BriefToneChips active={brief.activeTone} onToggle={brief.toggleTone} />
        </BriefBlock>
        <BriefBlock icon={Ban} title={t('marketplace.offer.brief.donts.title')} body={t('marketplace.offer.brief.donts.body')}>
          <BriefFieldEntries field="donts" look="points" tone="avoid" />
          <BriefEntryAdder placeholder={t('marketplace.offer.brief.donts.placeholder')} onAdd={addDont} />
        </BriefBlock>
        <BriefBlock icon={Hash} title={t('marketplace.offer.brief.tags.title')} body={t('marketplace.offer.brief.tags.body')}>
          <Box gap="sm">
            <Text variant="overline" color={colors.text.tertiary}>
              {t('marketplace.offer.brief.tags.hashtags')}
            </Text>
            <BriefFieldEntries field="hashtags" look="chips" />
            <BriefEntryAdder
              placeholder={t('marketplace.offer.brief.tags.hashtagsPlaceholder')}
              onAdd={addHashtag}
              autoCapitalize="none"
            />
          </Box>
          <Box gap="sm">
            <Text variant="overline" color={colors.text.tertiary}>
              {t('marketplace.offer.brief.tags.mentions')}
            </Text>
            <BriefFieldEntries field="mentions" look="chips" />
            <BriefEntryAdder
              placeholder={t('marketplace.offer.brief.tags.mentionsPlaceholder')}
              onAdd={addMention}
              autoCapitalize="none"
            />
          </Box>
        </BriefBlock>
        <BriefMeasure />
        <BriefFileTiles
          attachments={attachments}
          max={DEAL_UPLOAD_LIMIT.brief}
          caption={t('marketplace.offer.brief.files.caption')}
          onAdd={openFilesSheet}
        />
      </StaggerIn>
    </Box>
  );
};

export const BriefStep = memo(BriefStepComponent);
