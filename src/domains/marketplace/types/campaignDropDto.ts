import type { DealLabeledDto } from './dealDto';

/** `GET /brand/campaigns/{id}/drop` (contract §3.7). */
export interface CampaignDropDto {
  campaign_id: string;
  drop_at: string;
  publish_opens_at: string;
  draft_due_at: string;
  phase: string;
  countdown: { seconds_to_publish_open: number; seconds_to_drop: number };
  reminders: { minutes_before: number; at: string; sent: boolean }[];
  totals: {
    linked: number;
    awaiting_payment: number;
    working: number;
    in_review: number;
    late: number;
    verified: number;
    defaulted: number;
    ended: number;
  };
  creators: {
    deal_id: string;
    state: DealLabeledDto;
    deal_status: DealLabeledDto;
    creator: { slug: string | null; display_name: string | null; avatar_url: string | null };
    items: { total: number; in_review: number; verified: number };
    due_at: string | null;
    late_until: string | null;
  }[];
}
