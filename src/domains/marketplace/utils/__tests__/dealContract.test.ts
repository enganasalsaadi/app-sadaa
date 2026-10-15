import { addendumClause, bpsShare, parseContractDocument } from '../dealContract';

const DOCUMENT = {
  governing_language: 'ar',
  parties: {
    brand: { legal_name: 'Cham Coffee', signatory: 'Rana', kyc: { verified: true } },
    influencer: {
      legal_name: 'Reem Halabi',
      kyc: { verified: false },
      handles: [{ platform: 'instagram', username: 'reem' }, { platform: 'tiktok', username: '@reem.tt' }],
    },
  },
  deliverables: [
    {
      item_id: 'i1',
      title: { ar: 'ريل إنستغرام', en: 'Instagram reel' },
      total_usd: '150.00',
      revisions: 2,
      retention: { value: '30d', title: { ar: 'يبقى 30 يوماً', en: 'Stays 30 days' } },
      delivery_days: 5,
      delivery_hours: null,
    },
    { item_id: 'i2', title: 'not bilingual but text', total_usd: 'oops', revisions: 'x' },
    { item_id: 'i3' },
  ],
  schedule: { response_hours: 48, delivery_hours: 120, delivery_starts: { ar: 'بعد الضمان', en: 'After escrow' } },
  payment: { total_usd: '450.00', commission_bps: 1500, kill_fee_bps: 2500, free_cancel_grace_hours: 24 },
  shipping: { mode: 'gift', title: { ar: 'هدية', en: 'Gift' } },
  terms: { version: 'v1', items: [{ key: 'escrow', text: { ar: 'نص', en: 'Text' } }, { key: 'empty', text: {} }] },
};

describe('parseContractDocument', () => {
  it('reads the snapshot in the asked language', () => {
    const en = parseContractDocument(DOCUMENT, 'en');
    expect(en.brand).toEqual({ legalName: 'Cham Coffee', verified: true, signatory: 'Rana' });
    expect(en.creator).toEqual({ legalName: 'Reem Halabi', verified: false, handles: ['@reem', '@reem.tt'] });
    expect(en.deliverables[0]).toEqual({
      id: 'i1',
      title: 'Instagram reel',
      total: { amount: 15000, currency: 'USD' },
      revisions: 2,
      retention: 'Stays 30 days',
      deliveryHours: 120,
    });
    expect(en.total).toEqual({ amount: 45000, currency: 'USD' });
    expect(en.shipping).toBe('Gift');
    expect(en.terms).toEqual([{ key: 'escrow', text: 'Text' }]);
    expect(parseContractDocument(DOCUMENT, 'ar').deliverables[0]?.title).toBe('ريل إنستغرام');
  });

  it('drops what it cannot read instead of guessing', () => {
    const view = parseContractDocument(DOCUMENT, 'en');
    expect(view.deliverables).toHaveLength(2);
    expect(view.deliverables[1]).toMatchObject({ total: null, revisions: null, retention: null });
    expect(parseContractDocument({}, 'en')).toMatchObject({ brand: null, creator: null, deliverables: [], terms: [] });
  });

  it('falls back to the governing Arabic and reads addenda clauses', () => {
    expect(parseContractDocument({ shipping: { title: { ar: 'هدية' } } }, 'en').shipping).toBe('هدية');
    expect(addendumClause({ text: { ar: 'تمديد', en: 'Extension' } }, 'en')).toBe('Extension');
    expect(addendumClause({}, 'ar')).toBeNull();
    expect(bpsShare(1500)).toBe(0.15);
  });
});
