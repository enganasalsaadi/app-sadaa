import type { CampaignPage } from '../types/campaign';
import type { CampaignPageDto } from '../types/campaignDto';
import type { CampaignAnnouncement } from '../types/campaignAnnouncement';
import type { CampaignAnnouncementDto } from '../types/campaignAnnouncementDto';
import { toTimestamp } from './dealMappers';

// DTO → domain for announcements (rule 04). A malformed `sent_at` throws: the daily quota is
// counted from it, and a wrong time would unlock the editor early or lock it for nothing.

export const mapCampaignAnnouncement = (dto: CampaignAnnouncementDto): CampaignAnnouncement => ({
  id: dto.id,
  body: dto.body,
  link: dto.link?.trim() || null,
  recipients: dto.recipients_count,
  sentAt: toTimestamp(dto.sent_at),
});

export const mapCampaignAnnouncementsPage = (
  page: CampaignPageDto<CampaignAnnouncementDto>,
): CampaignPage<CampaignAnnouncement> => ({
  items: page.items.map(mapCampaignAnnouncement),
  meta: { currentPage: page.meta.current_page, lastPage: page.meta.last_page, total: page.meta.total },
});
