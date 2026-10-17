import {
  CAMPAIGN_DROP_PHASE,
  CAMPAIGN_DROP_STATE,
  type CampaignDropBoard,
  type CampaignDropCreator,
  type CampaignDropReminder,
} from '../types/campaignDrop';
import type { CampaignDropDto } from '../types/campaignDropDto';
import { DEAL_STATUS } from '../types/deal';
import { oneOf, toLabeled, toTimestamp, toTimestampOrNull } from './dealMappers';

// DTO → domain for the batch tools (rule 04). Unknown enum values become `null` (labels still
// render); a malformed required time throws, never a wrong countdown.

const mapReminder = (dto: CampaignDropDto['reminders'][number]): CampaignDropReminder => ({
  minutesBefore: dto.minutes_before,
  at: toTimestamp(dto.at),
  sent: dto.sent,
});

const mapCreator = (dto: CampaignDropDto['creators'][number]): CampaignDropCreator => ({
  dealId: dto.deal_id,
  state: toLabeled(CAMPAIGN_DROP_STATE, dto.state),
  dealStatus: toLabeled(DEAL_STATUS, dto.deal_status),
  slug: dto.creator.slug,
  name: dto.creator.display_name,
  avatarUrl: dto.creator.avatar_url,
  items: { total: dto.items.total, inReview: dto.items.in_review, verified: dto.items.verified },
  dueAt: toTimestampOrNull(dto.due_at),
  lateUntil: toTimestampOrNull(dto.late_until),
});

export const mapCampaignDrop = (dto: CampaignDropDto): CampaignDropBoard => ({
  campaignId: dto.campaign_id,
  dropAt: toTimestamp(dto.drop_at),
  publishOpensAt: toTimestamp(dto.publish_opens_at),
  draftDueAt: toTimestamp(dto.draft_due_at),
  phase: oneOf(CAMPAIGN_DROP_PHASE, dto.phase),
  reminders: dto.reminders.map(mapReminder),
  totals: {
    linked: dto.totals.linked,
    awaiting_payment: dto.totals.awaiting_payment,
    working: dto.totals.working,
    in_review: dto.totals.in_review,
    late: dto.totals.late,
    verified: dto.totals.verified,
    defaulted: dto.totals.defaulted,
    ended: dto.totals.ended,
  },
  creators: dto.creators.map(mapCreator),
});
