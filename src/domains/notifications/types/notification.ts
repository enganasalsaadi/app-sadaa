/** One inbox entry (contract §11.3). `title`/`body` arrive localized; `data` mirrors the push payload. */
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsPage {
  items: AppNotification[];
  meta: { current_page: number; last_page: number; total: number };
}
