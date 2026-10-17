import React, { memo } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomInput, Notice, Text } from '@/shared/ui';
import type { CampaignAnnouncementFormValues } from '../../../schemas/campaignAnnouncementSchema';
import { CAMPAIGN_ANNOUNCEMENT_LIMITS } from '../../../utils/campaignAnnouncement';

export interface AnnouncementEditorProps {
  control: Control<CampaignAnnouncementFormValues>;
  /** The cap is reached: the text stays, the fields don't take typing. */
  locked: boolean;
  /** `422 campaign_no_announcement_recipients`: not an error of the text, so it stays. */
  noRecipients: boolean;
}

/** The message (3–1000) and an optional https link, under a fixed line saying it's informational only. */
const AnnouncementEditorComponent: React.FC<AnnouncementEditorProps> = ({ control, locked, noRecipients }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="md">
      {noRecipients ? (
        <Notice
          tone="warning"
          title={t('marketplace.campaign.announcements.noRecipients.title')}
          message={t('marketplace.campaign.announcements.noRecipients.message')}
        />
      ) : null}
      <Controller
        control={control}
        name="body"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.campaign.announcements.editor.bodyLabel')}
            placeholder={t('marketplace.campaign.announcements.editor.bodyPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!locked}
            multiline
            numberOfLines={5}
            maxLength={CAMPAIGN_ANNOUNCEMENT_LIMITS.bodyMax}
            showCount
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="link"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.campaign.announcements.editor.linkLabel')}
            placeholder={t('marketplace.campaign.announcements.editor.linkPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!locked}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            maxLength={CAMPAIGN_ANNOUNCEMENT_LIMITS.linkMax}
            returnKeyType="done"
            error={fieldState.error?.message}
          />
        )}
      />
      <Box row align="flex-start" gap="sm">
        <Info size={sizes.icon.xs} color={colors.text.tertiary} />
        <Box flex={1}>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.announcements.editor.infoOnly')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export const AnnouncementEditor = memo(AnnouncementEditorComponent);
