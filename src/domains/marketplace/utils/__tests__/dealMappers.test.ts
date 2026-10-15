import type {
  BrandActiveDealDto,
  DealContractDto,
  DealDisputeDto,
  DealDraftDto,
  DealDto,
  DealFileDto,
  DealItemDto,
  DealPublicationDto,
  DealRetentionCaseDto,
  DealTimelineRowDto,
  DealUpsellQuoteDto,
} from '../../types/dealDto';
import {
  mapBrandActiveDeal,
  mapDeal,
  mapDealActionResult,
  mapDealContract,
  mapDealDetail,
  mapDealDisputeDetail,
  mapDealDraft,
  mapDealFile,
  mapDealPublication,
  mapDealRatingEntry,
  mapDealRetentionCase,
  mapDealStrikes,
  mapDealTimelineRow,
  mapDealUpsellQuote,
  mapDealsPage,
} from '../dealMappers';

const T0 = '2026-10-15T09:00:00+03:00';
const T0_MS = Date.UTC(2026, 9, 15, 6);
const usd = (amount: number) => ({ amount, currency: 'USD' });

const fileDto = (overrides: Partial<DealFileDto> = {}): DealFileDto => ({
  id: 'f1',
  kind: 'video',
  name: 'cut.mp4',
  mime: 'video/mp4',
  size: 1024,
  sha256: null,
  status: 'ready',
  url: 'https://cdn.example/f1',
  ...overrides,
});

const itemDto = (overrides: Partial<DealItemDto> = {}): DealItemDto => ({
  id: 'i1',
  rate_card_id: 'rc1',
  deal_upsell_id: null,
  title: 'Instagram Reel',
  platform: 'instagram',
  service: 'reel',
  package_value: null,
  unit_price_usd: '120.00',
  addons: [
    { type: 'boost', label: 'Boost', price_usd: '30.00', options: { days: 3 }, upsell_id: null },
  ],
  total_usd: '150.00',
  delivery_days: 5,
  delivery_hours: null,
  retention: '30d',
  revisions_allowed: 2,
  revisions_used: 1,
  revisions_left: 1,
  approve_as_is_available: false,
  status: { key: 'draft_submitted', label: 'Draft in review' },
  due_at: T0,
  timer_paused: false,
  live_url: null,
  fix_requests_left: 2,
  verified_at: null,
  ...overrides,
});

const disputeDto = (overrides: Partial<DealDisputeDto> = {}): DealDisputeDto => ({
  id: 'd1',
  status: { key: 'resolved', label: 'Resolved' },
  opened_by: 'brand',
  reason: { key: 'poor_quality', label: 'Poor quality' },
  statement: 'The cut ignores the brief.',
  prior_status: 'in_progress',
  evidence_open: false,
  evidence_due_at: T0,
  evidence_closed_at: T0,
  admin_target_at: T0,
  withdrawn_at: null,
  resolution: 'split',
  ruling: {
    outcome: { key: 'split', label: 'Split' },
    reason: 'Both sides partly right.',
    brand_usd: '75.00',
    creator_usd: '75.00',
    commission_usd: '7.50',
    creator_net_usd: '67.50',
    resolved_at: T0,
  },
  opened_at: T0,
  closed_at: T0,
  ...overrides,
});

const retentionCaseDto = (overrides: Partial<DealRetentionCaseDto> = {}): DealRetentionCaseDto => ({
  id: 'r1',
  item_id: 'i1',
  reason: { key: 'deleted', label: 'Deleted' },
  note: null,
  status: { key: 'closed', label: 'Closed' },
  report_files: [fileDto({ id: 'rf1', kind: 'image', mime: 'image/png' })],
  response: 'contested',
  response_note: 'Still live.',
  restored_url: null,
  handle_checked: null,
  restore_files: [],
  responded_at: T0,
  brand_decision: null,
  brand_note: null,
  decided_at: null,
  escalation_reason: { key: 'contested', label: 'Contested' },
  escalated_at: T0,
  closed_reason: 'upheld',
  admin_note: 'Post was removed.',
  clawback_usd: '20.00',
  due_at: null,
  reported_at: T0,
  closed_at: T0,
  ...overrides,
});

const dealDto = (overrides: Partial<DealDto> = {}): DealDto => ({
  id: '01J',
  origin: 'direct',
  status: { key: 'in_progress', label: 'In progress' },
  stage: { key: 'draft_submitted', label: 'Draft in review' },
  brand: { name: 'Cafe Sham', avatar_url: null },
  creator: { slug: 'reem', name: 'Reem', avatar_url: 'https://cdn.example/a.jpg' },
  items: [itemDto()],
  items_count: 1,
  total_usd: '150.00',
  currency: 'USD',
  shipping_mode: { key: 'gift', label: 'Gift' },
  shipping: {
    ship_by: T0,
    reships_left: 1,
    free_cancel_from: null,
    shipments: [
      {
        id: 's1',
        sequence: 1,
        courier: 'Al Haram',
        tracking_no: 'TR-1',
        tracking_url: null,
        shipped_at: T0,
        received_at: null,
        delayed_report_from: T0,
        issue: {
          reason: { key: 'damaged', label: 'Damaged' },
          note: 'Box crushed',
          photos: [{ url: null, mime: 'image/jpeg', size: 200 }],
          reported_at: T0,
          answer_by: null,
        },
      },
    ],
  },
  cancellation: {
    brand: {
      outcome: { key: 'kill_fee', label: 'Kill fee' },
      free_until: null,
      refund_usd: '120.00',
      kill_fee_usd: '30.00',
      platform_fee_usd: '3.00',
      creator_net_usd: '27.00',
    },
    influencer: { withdraw_available: true, strike: true, refund_usd: '150.00' },
  },
  delivery_hours: 120,
  requested_delivery_days: 5,
  extended_delivery_hours: null,
  extension: {
    addendum_id: 'a1',
    status: 'pending',
    from_hours: 120,
    to_hours: 168,
    reason: 'Travel',
  },
  decline_reason: null,
  deadline_at: null,
  upsells: [
    {
      id: 'u1',
      kind: { key: 'addon', label: 'Add-on' },
      status: { key: 'pending', label: 'Pending' },
      item_id: 'i1',
      title: null,
      quantity: null,
      addon: { type: 'boost', label: 'Boost', price_usd: '15.00', options: {} },
      delivery_hours: null,
      amount_usd: '15.00',
      currency: 'USD',
      addendum_id: null,
      added_item_ids: [],
      review_paused: true,
      due_at: T0,
      decline_reason: null,
      note: null,
      void_reason: null,
      proposed_at: T0,
      closed_at: null,
    },
  ],
  upsell_window: { open: false, closed_reason: null, pending_upsell_id: 'u1' },
  dispute: disputeDto(),
  dispute_window: { open: false, closed_reason: 'deal_disputed', disputes_left: 0 },
  retention: [{ item_id: 'i1', ends_at: T0, report_available: true, open_case_id: null }],
  retention_cases: [retentionCaseDto()],
  rating: {
    open: false,
    due_at: T0,
    revealed_at: T0,
    brand: {
      answered: true,
      skipped: false,
      scores: { content_quality: 5, timeliness: 4, unknown_metric: 1 },
      overall: 4.5,
      comment: 'Great',
      submitted_at: T0,
    },
    influencer: { answered: false },
  },
  brief: {
    hashtags: ['#sada'],
    mentions: ['@sada'],
    talking_points: ['Show the new menu.'],
    donts: [],
    promo_code: 'SADA10',
    tracking_link: null,
  },
  brief_attachments: [fileDto({ id: 'b1', kind: 'document', mime: 'application/pdf' })],
  due_at: null,
  sent_at: T0,
  funded_at: T0,
  contract: {
    id: 'c1',
    hash: 'abc',
    signatures: [
      { party: 'brand', signed_at: T0 },
      { party: 'influencer', signed_at: T0 },
    ],
  },
  created_at: T0,
  updated_at: T0,
  ...overrides,
});

describe('mapDeal', () => {
  it('parses every USD string into cents', () => {
    const deal = mapDeal(dealDto());
    const item = deal.items[0];

    expect(deal.total).toEqual(usd(15000));
    expect(item?.unitPrice).toEqual(usd(12000));
    expect(item?.total).toEqual(usd(15000));
    expect(item?.addons[0]).toEqual({
      type: 'boost',
      label: 'Boost',
      price: usd(3000),
      options: { days: 3 },
      upsellId: null,
    });
    expect(deal.cancellation?.brand).toMatchObject({
      refund: usd(12000),
      killFee: usd(3000),
      platformFee: usd(300),
      creatorNet: usd(2700),
    });
    expect(deal.cancellation?.creator).toEqual({
      withdrawAvailable: true,
      strike: true,
      refund: usd(15000),
    });
    expect(deal.upsells[0]?.amount).toEqual(usd(1500));
    expect(deal.upsells[0]?.addon?.price).toEqual(usd(1500));
    expect(deal.dispute?.ruling).toMatchObject({
      brandAmount: usd(7500),
      creatorAmount: usd(7500),
      commission: usd(750),
      creatorNet: usd(6750),
    });
    expect(deal.retentionCases[0]?.clawback).toEqual(usd(2000));
  });

  it('narrows known enums and keeps server labels', () => {
    const deal = mapDeal(dealDto());

    expect(deal.origin).toBe('direct');
    expect(deal.status).toEqual({ key: 'in_progress', label: 'In progress' });
    expect(deal.stage).toEqual({ key: 'draft_submitted', label: 'Draft in review' });
    expect(deal.shippingMode.key).toBe('gift');
    expect(deal.items[0]?.retention).toBe('30d');
    expect(deal.extension?.status).toBe('pending');
    expect(deal.dispute?.openedBy).toBe('brand');
    expect(deal.dispute?.priorStatus).toBe('in_progress');
  });

  it('maps unknown enum values to a null key without crashing', () => {
    const deal = mapDeal(
      dealDto({
        origin: 'campaign',
        status: { key: 'archived_v9', label: 'Archived' },
        stage: null,
        items: [itemDto({ retention: '7d', status: { key: 'mystery', label: 'Mystery' } })],
      }),
    );

    expect(deal.origin).toBeNull();
    expect(deal.status).toEqual({ key: null, label: 'Archived' });
    expect(deal.stage).toBeNull();
    expect(deal.items[0]?.retention).toBeNull();
    expect(deal.items[0]?.status).toEqual({ key: null, label: 'Mystery' });
  });

  it('converts ISO times to epoch ms and keeps null deadlines paused', () => {
    const deal = mapDeal(dealDto());

    expect(deal.items[0]?.dueAt).toBe(T0_MS);
    expect(deal.dueAt).toBeNull();
    expect(deal.fundedAt).toBe(T0_MS);
    expect(deal.shipping?.shipments[0]?.shippedAt).toBe(T0_MS);
    expect(deal.shipping?.shipments[0]?.issue?.answerBy).toBeNull();
  });

  it('renames the influencer side to creator', () => {
    const deal = mapDeal(dealDto());

    expect(deal.contract?.signatures.map(s => s.party)).toEqual(['brand', 'creator']);
    expect(deal.rating?.creator).toEqual({ answered: false, revealed: null });
  });

  it('keeps only known rating criteria once revealed', () => {
    const deal = mapDeal(dealDto());

    expect(deal.rating?.brand.revealed).toEqual({
      skipped: false,
      scores: { content_quality: 5, timeliness: 4 },
      overall: 4.5,
      comment: 'Great',
      submittedAt: T0_MS,
    });
  });

  it('maps the optional blocks to null for a digital-only, uncontracted deal', () => {
    const deal = mapDeal(
      dealDto({
        shipping: null,
        cancellation: null,
        extension: null,
        dispute: null,
        rating: null,
        contract: null,
        brief: null,
      }),
    );

    expect(deal.shipping).toBeNull();
    expect(deal.cancellation).toBeNull();
    expect(deal.extension).toBeNull();
    expect(deal.dispute).toBeNull();
    expect(deal.rating).toBeNull();
    expect(deal.contract).toBeNull();
    expect(deal.brief).toBeNull();
  });

  it('maps the structured brief to camelCase', () => {
    expect(mapDeal(dealDto()).brief).toEqual({
      hashtags: ['#sada'],
      mentions: ['@sada'],
      talkingPoints: ['Show the new menu.'],
      donts: [],
      promoCode: 'SADA10',
      trackingLink: null,
    });
  });

  it('maps a dispute-only cancellation without money', () => {
    const deal = mapDeal(
      dealDto({
        cancellation: {
          brand: {
            outcome: { key: 'dispute_only', label: 'Dispute only' },
            free_until: null,
            refund_usd: null,
            kill_fee_usd: null,
            platform_fee_usd: null,
            creator_net_usd: null,
          },
          influencer: { withdraw_available: false, strike: false, refund_usd: null },
        },
      }),
    );

    expect(deal.cancellation).toEqual({
      brand: {
        outcome: { key: 'dispute_only', label: 'Dispute only' },
        freeUntil: null,
        refund: null,
        killFee: null,
        platformFee: null,
        creatorNet: null,
      },
      creator: { withdrawAvailable: false, strike: false, refund: null },
    });
  });

  it('throws on malformed money instead of showing a wrong amount', () => {
    expect(() => mapDeal(dealDto({ total_usd: '150' + ',00' }))).toThrow(TypeError);
  });

  it('throws on a malformed required timestamp', () => {
    expect(() => mapDeal(dealDto({ created_at: 'yesterday' }))).toThrow(TypeError);
  });
});

describe('mapDealFile', () => {
  it('nulls unknown kinds and statuses', () => {
    expect(mapDealFile(fileDto({ kind: 'audio', status: 'scanning', url: null }))).toEqual({
      id: 'f1',
      kind: null,
      name: 'cut.mp4',
      mime: 'video/mp4',
      size: 1024,
      status: null,
      url: null,
    });
  });
});

describe('mapDealRetentionCase', () => {
  it('maps the response, escalation and admin close', () => {
    expect(mapDealRetentionCase(retentionCaseDto())).toMatchObject({
      response: 'contested',
      responseNote: 'Still live.',
      brandDecision: null,
      escalationReason: { key: 'contested', label: 'Contested' },
      closedReason: 'upheld',
      adminNote: 'Post was removed.',
      reportFiles: [{ id: 'rf1', kind: 'image' }],
    });
  });

  it('leaves clawback null when nothing moved', () => {
    expect(mapDealRetentionCase(retentionCaseDto({ clawback_usd: null })).clawback).toBeNull();
  });
});

describe('mapDealDisputeDetail', () => {
  it('maps the evidence thread with both ref kinds', () => {
    const detail = mapDealDisputeDetail(
      disputeDto({
        entries: [
          {
            id: 'e1',
            party: 'influencer',
            note: 'See the draft.',
            links: ['https://instagram.com/p/x'],
            files: [fileDto()],
            refs: [
              { type: 'file', id: 'f9', purpose: 'draft', file: null },
              { type: 'shipment_photo', shipment_id: 's1', index: 0, url: null },
            ],
            created_at: T0,
          },
        ],
      }),
    );

    expect(detail.entries).toEqual([
      {
        id: 'e1',
        party: 'influencer',
        note: 'See the draft.',
        links: ['https://instagram.com/p/x'],
        files: [mapDealFile(fileDto())],
        refs: [
          { type: 'file', id: 'f9', purpose: 'draft', file: null },
          { type: 'shipment_photo', shipmentId: 's1', index: 0, url: null },
        ],
        createdAt: T0_MS,
      },
    ]);
  });

  it('defaults to no entries when the thread is not loaded', () => {
    expect(mapDealDisputeDetail(disputeDto()).entries).toEqual([]);
  });
});

describe('mapDealTimelineRow', () => {
  const row = (overrides: Partial<DealTimelineRowDto> = {}): DealTimelineRowDto => ({
    id: 't1',
    subject: { type: 'deal', id: '01J' },
    from: { key: 'awaiting_payment', label: 'Awaiting payment' },
    to: { key: 'in_progress', label: 'In progress' },
    actor: { key: 'system', label: 'System' },
    reason: null,
    metadata: null,
    due_at: null,
    occurred_at: T0,
    ...overrides,
  });

  it('maps a status change', () => {
    expect(mapDealTimelineRow(row())).toEqual({
      id: 't1',
      subject: { type: 'deal', id: '01J' },
      from: { key: 'awaiting_payment', label: 'Awaiting payment' },
      to: { key: 'in_progress', label: 'In progress' },
      actor: { key: 'system', label: 'System' },
      reason: null,
      metadata: null,
      dueAt: null,
      occurredAt: T0_MS,
      isNote: false,
    });
  });

  it('flags note rows and accepts both item subject spellings', () => {
    const note = mapDealTimelineRow(
      row({
        subject: { type: 'deal_item', id: 'i1' },
        from: { key: 'in_progress', label: 'In progress' },
        reason: 'deadline_warning',
      }),
    );

    expect(note.isNote).toBe(true);
    expect(note.subject).toEqual({ type: 'item', id: 'i1' });
    expect(mapDealTimelineRow(row({ subject: { type: 'item', id: 'i1' } })).subject.type).toBe(
      'item',
    );
  });

  it('treats the first row (no from) as a change', () => {
    expect(mapDealTimelineRow(row({ from: null })).isNote).toBe(false);
  });
});

describe('mapDealDraft', () => {
  it('maps the brand review pins', () => {
    const dto: DealDraftDto = {
      id: 'dr1',
      item_id: 'i1',
      round: 2,
      caption: 'Menu reveal',
      submitted_at: T0,
      files: [fileDto()],
      review: {
        decision: { key: 'revision_requested', label: 'Changes requested' },
        by: 'brand',
        note: 'Logo too small',
        pins: [
          { file_id: 'f1', at_second: 12, note: 'Here' },
          { file_id: 'f1', note: 'Whole file' },
        ],
        reviewed_at: T0,
      },
    };

    expect(mapDealDraft(dto).review).toEqual({
      decision: { key: 'revision_requested', label: 'Changes requested' },
      by: 'brand',
      note: 'Logo too small',
      pins: [
        { fileId: 'f1', atSecond: 12, note: 'Here' },
        { fileId: 'f1', atSecond: null, note: 'Whole file' },
      ],
      reviewedAt: T0_MS,
    });
  });

  it('keeps review null while the brand is still reviewing', () => {
    const dto: DealDraftDto = {
      id: 'dr1',
      item_id: 'i1',
      round: 1,
      caption: null,
      submitted_at: T0,
      files: [],
      review: null,
    };

    expect(mapDealDraft(dto)).toMatchObject({ round: 1, review: null, submittedAt: T0_MS });
  });
});

describe('mapDealPublication', () => {
  it('maps proofs and an automatic verification', () => {
    const dto: DealPublicationDto = {
      id: 'p1',
      item_id: 'i1',
      sequence: 1,
      url: 'https://instagram.com/reel/x',
      platform: 'instagram',
      handle: null,
      handle_checked: false,
      submitted_at: T0,
      proofs: [fileDto({ kind: 'image' })],
      review: {
        decision: { key: 'auto_verified', label: 'Auto verified' },
        by: 'system',
        note: null,
        reviewed_at: T0,
      },
    };

    expect(mapDealPublication(dto)).toMatchObject({
      handleChecked: false,
      proofs: [{ kind: 'image' }],
      review: { decision: { key: 'auto_verified' }, by: 'system' },
    });
  });
});

describe('mapDealRatingEntry', () => {
  it('maps the caller rating with the creator role', () => {
    expect(
      mapDealRatingEntry({
        id: 'rt1',
        rated_by: 'influencer',
        skipped: true,
        scores: null,
        overall: null,
        comment: null,
        submitted_at: T0,
      }),
    ).toEqual({
      id: 'rt1',
      ratedBy: 'creator',
      skipped: true,
      scores: {},
      overall: null,
      comment: null,
      submittedAt: T0_MS,
    });
  });
});

describe('mapDealContract', () => {
  it('maps the contract and its addenda', () => {
    const dto: DealContractDto = {
      id: 'c1',
      terms_version: '2026-10',
      hash: 'h0',
      issued_at: T0,
      document: { ar: {}, en: {} },
      signatures: [{ party: 'influencer', signed_at: T0 }],
      addenda: [
        {
          id: 'a1',
          sequence: 1,
          type: 'deadline_extension',
          hash: 'h1',
          issued_at: T0,
          document: { reason: 'Travel' },
          signatures: [],
        },
      ],
    };

    expect(mapDealContract(dto)).toEqual({
      id: 'c1',
      hash: 'h0',
      issuedAt: T0_MS,
      document: { ar: {}, en: {} },
      signatures: [{ party: 'creator', signedAt: T0_MS }],
      termsVersion: '2026-10',
      addenda: [
        {
          id: 'a1',
          hash: 'h1',
          issuedAt: T0_MS,
          document: { reason: 'Travel' },
          signatures: [],
          sequence: 1,
          type: 'deadline_extension',
        },
      ],
    });
  });
});

describe('mapBrandActiveDeal', () => {
  it('maps a Brand Home row', () => {
    const dto: BrandActiveDealDto = {
      id: '01J',
      status: { key: 'in_progress', label: 'In progress' },
      stage: { key: 'draft_submitted', label: 'Draft in review' },
      creator: { slug: 'food', name: 'Food Creator', avatar_url: null },
      title: 'Instagram Reel +2',
      total_usd: '150.00',
      due_at: T0,
      needs_action: true,
      action: { key: 'review_draft', label: 'Review the draft' },
    };

    expect(mapBrandActiveDeal(dto)).toEqual({
      id: '01J',
      status: { key: 'in_progress', label: 'In progress' },
      stage: { key: 'draft_submitted', label: 'Draft in review' },
      creator: { slug: 'food', name: 'Food Creator', avatarUrl: null },
      title: 'Instagram Reel +2',
      total: usd(15000),
      dueAt: T0_MS,
      needsAction: true,
      action: { key: 'review_draft', label: 'Review the draft' },
    });
  });
});

describe('mapDealStrikes', () => {
  it('maps the list with its meta', () => {
    expect(
      mapDealStrikes(
        [
          {
            id: 'k1',
            deal_id: '01J',
            reason: { key: 'withdrew', label: 'Withdrew' },
            occurred_at: T0,
            expires_at: T0,
          },
        ],
        { active_count: 1, window_days: 90 },
      ),
    ).toEqual({
      items: [
        {
          id: 'k1',
          dealId: '01J',
          reason: { key: 'withdrew', label: 'Withdrew' },
          occurredAt: T0_MS,
          expiresAt: T0_MS,
        },
      ],
      activeCount: 1,
      windowDays: 90,
    });
  });
});

describe('mapDealsPage', () => {
  it('maps each deal and camel-cases the page meta', () => {
    const page = mapDealsPage({
      items: [dealDto(), dealDto({ id: '02J', status: { key: 'brand_new_status', label: 'New' } })],
      meta: { current_page: 1, last_page: 3, total: 41 },
    });

    expect(page.items.map(deal => [deal.id, deal.status.key])).toEqual([
      ['01J', 'in_progress'],
      ['02J', null],
    ]);
    expect(page.meta).toEqual({ currentPage: 1, lastPage: 3, total: 41 });
  });
});

describe('mapDealDetail', () => {
  it('maps the brand funding preview while awaiting payment', () => {
    const detail = mapDealDetail(dealDto(), {
      funding: { funded: false, reason: 'insufficient_funds', missing_usd: '42.50' },
    });

    expect(detail.deal.id).toBe('01J');
    expect(detail.funding).toEqual({ funded: false, reason: 'insufficient_funds', missing: usd(4250) });
  });

  it('leaves funding null when the server sends none', () => {
    expect(mapDealDetail(dealDto(), {}).funding).toBeNull();
  });
});

describe('mapDealActionResult', () => {
  it('maps the per-action extras', () => {
    const result = mapDealActionResult(dealDto(), {
      upsell_id: 'u9',
      draft: { id: 'd1', item_id: 'i1', round: 2, caption: null, submitted_at: T0, files: [], review: null },
    });

    expect(result.upsellId).toBe('u9');
    expect(result.draft).toMatchObject({ id: 'd1', round: 2, submittedAt: T0_MS });
    expect(result.publication).toBeNull();
    expect(result.funding).toBeNull();
  });

  it('defaults every extra to null', () => {
    expect(mapDealActionResult(dealDto(), {})).toMatchObject({
      funding: null,
      draft: null,
      publication: null,
      upsellId: null,
    });
  });
});

describe('mapDealUpsellQuote', () => {
  const dto: DealUpsellQuoteDto = {
    kind: { key: 'extra_revision', label: 'Extra revision' },
    item_id: 'item-1',
    title: 'Instagram reel',
    amount_usd: '15.00',
    revisions: { from: 2, to: 3 },
    total_usd: { from: '300.00', to: '315.00' },
    wallet: { balance_usd: '10.00', shortfall_usd: '5.00', is_sufficient: false },
  };

  it('maps the extra round price, rounds and wallet shortfall to cents', () => {
    expect(mapDealUpsellQuote(dto)).toEqual({
      kind: { key: 'extra_revision', label: 'Extra revision' },
      itemId: 'item-1',
      title: 'Instagram reel',
      amount: { amount: 1500, currency: 'USD' },
      revisions: { from: 2, to: 3 },
      total: { from: { amount: 30000, currency: 'USD' }, to: { amount: 31500, currency: 'USD' } },
      wallet: {
        balance: { amount: 1000, currency: 'USD' },
        shortfall: { amount: 500, currency: 'USD' },
        isSufficient: false,
      },
    });
  });

  it('keeps an unknown kind readable and throws on a malformed amount', () => {
    expect(mapDealUpsellQuote({ ...dto, kind: { key: 'mystery', label: 'Mystery' } }).kind).toEqual({
      key: null,
      label: 'Mystery',
    });
    expect(() => mapDealUpsellQuote({ ...dto, amount_usd: '15,00' })).toThrow();
  });
});
