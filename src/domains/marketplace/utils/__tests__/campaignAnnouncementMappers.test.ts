import { mapCampaignAnnouncement, mapCampaignAnnouncementsPage } from '../campaignAnnouncementMappers';

const dto = {
  id: 'a1',
  body: 'الدروب الثلاثاء',
  link: ' https://example.com/brief ',
  recipients_count: 4,
  sent_at: '2026-10-17T15:10:00+03:00',
};

describe('mapCampaignAnnouncement', () => {
  it('maps the row and keeps the server recipient count', () => {
    expect(mapCampaignAnnouncement(dto)).toEqual({
      id: 'a1',
      body: 'الدروب الثلاثاء',
      link: 'https://example.com/brief',
      recipients: 4,
      sentAt: Date.parse('2026-10-17T15:10:00+03:00'),
    });
  });

  it('turns an empty or missing link into null', () => {
    expect(mapCampaignAnnouncement({ ...dto, link: '  ' }).link).toBeNull();
    expect(mapCampaignAnnouncement({ ...dto, link: null }).link).toBeNull();
  });

  it('throws on a malformed time rather than count the quota from it', () => {
    expect(() => mapCampaignAnnouncement({ ...dto, sent_at: 'soon' })).toThrow();
  });
});

describe('mapCampaignAnnouncementsPage', () => {
  it('maps the page meta', () => {
    const page = mapCampaignAnnouncementsPage({
      items: [dto],
      meta: { current_page: 1, last_page: 3, total: 41 },
    });
    expect(page.items).toHaveLength(1);
    expect(page.meta).toEqual({ currentPage: 1, lastPage: 3, total: 41 });
  });
});
