import type { Timestamp } from './deal';

// Campaign announcements (contract §3.9, CM9): one informational message from the brand to every
// creator on a funded linked deal. Terms never change through it.

export interface CampaignAnnouncement {
  id: string;
  body: string;
  /** An https link the creators copy; the app never opens it (rule 07). */
  link: string | null;
  /** How many creators it reached, as the server counted. The app never works it out. */
  recipients: number;
  sentAt: Timestamp;
}

/** What the brand typed. */
export interface CampaignAnnouncementInput {
  body: string;
  link: string | null;
}
