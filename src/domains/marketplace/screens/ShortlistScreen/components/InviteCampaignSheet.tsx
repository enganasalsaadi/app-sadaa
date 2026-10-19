import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleCheck, Megaphone } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, CustomButton, EmptyState, InlineError, ListRow, Notice, Skeleton, StatusPill, Text, SheetFrame } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import { CAMPAIGN_INVITE_LIMIT, CAMPAIGN_INVITE_SKIP_TONE, UNKNOWN_INVITE_SKIP_TONE } from '../../../constants/campaignInvite';
import type { Campaign } from '../../../types/campaign';
import type { InviteReportRow, ShortlistInviteSheet } from '../../../hooks/useShortlistInvite';

const FACE = moderateScale(40);

export interface InviteCampaignSheetProps {
  sheet: ShortlistInviteSheet;
}

const ReportRow = memo<{ row: InviteReportRow }>(({ row }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tone = row.reasonKey ? CAMPAIGN_INVITE_SKIP_TONE[row.reasonKey] : UNKNOWN_INVITE_SKIP_TONE;
  const label = row.invited
    ? t('marketplace.shortlist.invite.report.invited')
    : (row.reasonLabel ?? t('marketplace.shortlist.invite.report.skipped'));
  return (
    <Box row align="center" gap="md" accessible accessibilityLabel={`${row.name}. ${label}`}>
      <ApplicantFace name={row.name} avatarUrl={row.avatarUrl} size={FACE} />
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
          {row.name}
        </Text>
        {row.eligibility.length > 0 ? (
          <Text variant="caption" color={colors.text.secondary}>
            {row.eligibility.join(' · ')}
          </Text>
        ) : null}
      </Box>
      <StatusPill
        label={label}
        tone={row.invited ? 'success' : tone}
        icon={row.invited ? CircleCheck : undefined}
        size="sm"
      />
    </Box>
  );
});

const Report = memo<{ sheet: ShortlistInviteSheet }>(({ sheet }) => {
  const { t } = useTranslation();
  const { report, rows } = sheet;
  if (!report) return null;
  const full = report.used >= report.limit;
  return (
    <>
      <Notice
        tone={report.invited > 0 ? 'success' : 'warning'}
        title={t('marketplace.shortlist.invite.report.summary', {
          invited: formatNumber(report.invited),
          total: formatNumber(rows.length),
        })}
        message={
          full
            ? t('marketplace.shortlist.invite.report.quotaFull', { limit: formatNumber(report.limit) })
            : t('marketplace.shortlist.invite.report.quota', {
                used: formatNumber(report.used),
                limit: formatNumber(report.limit),
              })
        }
      />
      <Box gap="md">
        {rows.map(row => (
          <ReportRow key={row.slug} row={row} />
        ))}
      </Box>
    </>
  );
});

const CampaignChoice = memo<{ campaign: Campaign; chosen: boolean; disabled: boolean; onChoose: (id: string) => void }>(
  ({ campaign, chosen, disabled, onChoose }) => {
    const { t } = useTranslation();
    const choose = useCallback(() => onChoose(campaign.id), [campaign.id, onChoose]);
    return (
      <ListRow
        icon={Megaphone}
        iconTone="interactive"
        title={campaign.title}
        subtitle={t('marketplace.campaign.list.seats', { filled: campaign.counters.seatsOccupied, total: campaign.seatsTotal })}
        selected={chosen}
        onPress={choose}
        disabled={disabled}
      />
    );
  },
);

const Picker = memo<{ sheet: ShortlistInviteSheet }>(({ sheet }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (sheet.isLoading) {
    return (
      <Box gap="md">
        <Skeleton width="100%" height={moderateScale(64)} />
        <Skeleton width="100%" height={moderateScale(64)} />
      </Box>
    );
  }
  if (sheet.isError) {
    return (
      <Box gap="md">
        <InlineError error={t('marketplace.shortlist.invite.loadFailed')} />
        <CustomButton variant="secondary" fullWidth title={t('common.retry')} onPress={sheet.retry} />
      </Box>
    );
  }
  if (sheet.campaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title={t('marketplace.shortlist.invite.noCampaigns.title')}
        message={t('marketplace.shortlist.invite.noCampaigns.hint')}
      />
    );
  }
  return (
    <Box gap="sm">
      {sheet.campaigns.map(campaign => (
        <CampaignChoice
          key={campaign.id}
          campaign={campaign}
          chosen={campaign.id === sheet.chosen}
          disabled={sheet.isSending}
          onChoose={sheet.choose}
        />
      ))}
      {sheet.hasMore ? (
        <CustomButton
          variant="ghost"
          fullWidth
          title={t('common.showMore')}
          loading={sheet.isLoadingMore}
          onPress={sheet.more}
        />
      ) : null}
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.shortlist.invite.quotaNote', { limit: formatNumber(CAMPAIGN_INVITE_LIMIT) })}
      </Text>
    </Box>
  );
});

/**
 * Picks the campaign the shortlisted creators are invited to, then shows the server's report for
 * each of them (invited, or skipped with the server's reason): the sheet never claims more than
 * the report says.
 */
const InviteCampaignSheetComponent: React.FC<InviteCampaignSheetProps> = ({ sheet }) => {
  const { t } = useTranslation();
  const sent = sheet.report !== null;
  const canSend = !sheet.isLoading && !sheet.isError && sheet.campaigns.length > 0;
  return (
    <SheetFrame
      visible={sheet.visible}
      onClose={sheet.close}
      title={t(sent ? 'marketplace.shortlist.invite.report.title' : 'marketplace.shortlist.invite.sheet.title')}
      body={sent ? undefined : t('marketplace.shortlist.invite.sheet.body')}
      footer={
        sent ? (
          <CustomButton fullWidth title={t('common.done')} onPress={sheet.finish} />
        ) : canSend ? (
          <CustomButton
            fullWidth
            title={t('marketplace.shortlist.invite.sheet.send')}
            loading={sheet.isSending}
            onPress={sheet.send}
          />
        ) : (
          <CustomButton fullWidth variant="secondary" title={t('common.close')} onPress={sheet.close} />
        )
      }
    >
      {sent ? <Report sheet={sheet} /> : <Picker sheet={sheet} />}
    </SheetFrame>
  );
};

export const InviteCampaignSheet = memo(InviteCampaignSheetComponent);
