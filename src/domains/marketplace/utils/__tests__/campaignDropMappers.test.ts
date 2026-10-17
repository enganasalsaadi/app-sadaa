import type { CampaignDropDto } from '../../types/campaignDropDto';
import { mapCampaignDrop } from '../campaignDropMappers';

const dto = (overrides: Partial<CampaignDropDto> = {}): CampaignDropDto => ({
  campaign_id: 'c1',
  drop_at: '2026-11-01T17:00:00Z',
  publish_opens_at: '2026-11-01T16:45:00Z',
  draft_due_at: '2026-10-30T17:00:00Z',
  phase: 'upcoming',
  countdown: { seconds_to_publish_open: 100, seconds_to_drop: 1000 },
  reminders: [{ minutes_before: 1440, at: '2026-10-31T17:00:00Z', sent: true }],
  totals: { linked: 2, awaiting_payment: 0, working: 1, in_review: 0, late: 1, verified: 0, defaulted: 0, ended: 0 },
  creators: [
    {
      deal_id: 'd1',
      state: { key: 'late', label: 'متأخر' },
      deal_status: { key: 'in_progress', label: 'قيد التنفيذ' },
      creator: { slug: 'lin', display_name: 'لين', avatar_url: null },
      items: { total: 2, in_review: 0, verified: 0 },
      due_at: null,
      late_until: '2026-11-02T17:00:00Z',
    },
  ],
  ...overrides,
});

describe('mapCampaignDrop', () => {
  it('maps the board: epoch times, camelCase, labels kept as the server sent them', () => {
    const board = mapCampaignDrop(dto());
    expect(board.campaignId).toBe('c1');
    expect(board.dropAt).toBe(Date.parse('2026-11-01T17:00:00Z'));
    expect(board.phase).toBe('upcoming');
    expect(board.reminders).toEqual([{ minutesBefore: 1440, at: Date.parse('2026-10-31T17:00:00Z'), sent: true }]);
    expect(board.totals.late).toBe(1);
    expect(board.creators[0]).toMatchObject({
      dealId: 'd1',
      state: { key: 'late', label: 'متأخر' },
      dealStatus: { key: 'in_progress', label: 'قيد التنفيذ' },
      name: 'لين',
      items: { total: 2, inReview: 0, verified: 0 },
      dueAt: null,
      lateUntil: Date.parse('2026-11-02T17:00:00Z'),
    });
  });

  it('turns an unknown phase, state or deal status into null and keeps the label', () => {
    const board = mapCampaignDrop(
      dto({
        phase: 'brand-new',
        creators: [
          {
            ...dto().creators[0]!,
            state: { key: 'paused', label: 'موقوف' },
            deal_status: { key: 'mystery', label: 'غامض' },
          },
        ],
      }),
    );
    expect(board.phase).toBeNull();
    expect(board.creators[0]?.state).toEqual({ key: null, label: 'موقوف' });
    expect(board.creators[0]?.dealStatus).toEqual({ key: null, label: 'غامض' });
  });

  it('throws on a malformed required time rather than showing a wrong countdown', () => {
    expect(() => mapCampaignDrop(dto({ drop_at: 'soon' }))).toThrow(TypeError);
  });
});
