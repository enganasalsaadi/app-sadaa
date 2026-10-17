/** One row of `GET /brand/campaigns/{id}/announcements`, and the answer of the `POST` (contract §3.9). */
export interface CampaignAnnouncementDto {
  id: string;
  body: string;
  link: string | null;
  recipients_count: number;
  sent_at: string;
}
