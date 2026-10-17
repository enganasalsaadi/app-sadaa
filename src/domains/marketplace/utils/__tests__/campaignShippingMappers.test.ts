import type { CampaignShipmentReportDto, CampaignShippingDto } from '../../types/campaignShippingDto';
import { mapCampaignShipmentReport, mapCampaignShipping } from '../campaignShippingMappers';

const dto = (overrides: Partial<CampaignShippingDto['deals'][number]> = {}): CampaignShippingDto => ({
  campaign_id: 'c1',
  shipping_mode: { key: 'gift', label: 'هدية' },
  totals: { awaiting: 3, ready: 2, blocked: 1, shipped: 4 },
  deals: [
    {
      deal_id: 'd1',
      kind: 'first',
      deal_status: { key: 'product_shipping', label: 'بانتظار الشحن' },
      creator: { slug: 'reem', display_name: 'ريم', avatar_url: null },
      ready: false,
      blockers: ['brief_window', 'address_missing'],
      ship_from: '2026-11-01T10:00:00Z',
      ship_by: null,
      reshipments_left: 2,
      last_shipment: { courier: 'أرامكس', tracking_no: 'AR-1' },
      address: null,
      ...overrides,
    },
  ],
});

describe('mapCampaignShipping', () => {
  it('maps the manifest: epoch times, camelCase, server labels kept', () => {
    const board = mapCampaignShipping(dto());
    expect(board.campaignId).toBe('c1');
    expect(board.shippingMode).toEqual({ key: 'gift', label: 'هدية' });
    expect(board.totals).toEqual({ awaiting: 3, ready: 2, blocked: 1, shipped: 4 });
    expect(board.rows[0]).toMatchObject({
      dealId: 'd1',
      kind: 'first',
      name: 'ريم',
      ready: false,
      blockers: ['brief_window', 'address_missing'],
      shipFrom: Date.parse('2026-11-01T10:00:00Z'),
      shipBy: null,
      reshipmentsLeft: 2,
      lastShipment: { courier: 'أرامكس', trackingNo: 'AR-1' },
      address: null,
    });
  });

  it('maps the address when the server sends one', () => {
    const board = mapCampaignShipping(
      dto({
        address: {
          recipient_name: 'ريم الشامي',
          phone: '+963944000111',
          governorate: { id: 'dam', label: 'دمشق' },
          city: 'دمشق',
          area: 'المزة',
          address_line: 'شارع الجلاء',
          landmark: null,
          notes: '',
          updated_at: null,
        },
      }),
    );
    expect(board.rows[0]?.address).toMatchObject({ recipientName: 'ريم الشامي', area: 'المزة', notes: null });
  });

  it('drops blockers it does not know and turns an unknown kind into null', () => {
    const row = mapCampaignShipping(dto({ kind: 'swap', blockers: ['brief_window', 'moon_phase'] })).rows[0];
    expect(row?.kind).toBeNull();
    expect(row?.blockers).toEqual(['brief_window']);
  });

  it('throws on a malformed time instead of showing a wrong countdown', () => {
    expect(() => mapCampaignShipping(dto({ ship_from: 'soon' }))).toThrow();
  });
});

describe('mapCampaignShipmentReport', () => {
  const report: CampaignShipmentReportDto = {
    total: 3,
    shipped: 1,
    failed: 2,
    results: [
      { deal_id: 'd1', ok: true },
      {
        deal_id: 'd2',
        ok: false,
        error_code: 'campaign_brief_window_open',
        message: 'المؤثر يراجع البريف',
        meta: { ship_from: '2026-11-01T10:00:00Z' },
      },
      { deal_id: 'd3', ok: false },
    ],
  };

  it('keeps one result per row, failures with their code, message and ship_from', () => {
    expect(mapCampaignShipmentReport(report)).toEqual({
      total: 3,
      shipped: 1,
      failed: 2,
      results: [
        { dealId: 'd1', ok: true },
        {
          dealId: 'd2',
          ok: false,
          code: 'campaign_brief_window_open',
          message: 'المؤثر يراجع البريف',
          shipFrom: Date.parse('2026-11-01T10:00:00Z'),
        },
        { dealId: 'd3', ok: false, code: null, message: '', shipFrom: null },
      ],
    });
  });
});
