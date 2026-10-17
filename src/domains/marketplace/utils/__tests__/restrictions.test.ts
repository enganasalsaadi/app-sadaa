import type { CreatorRestriction, CreatorRestrictions } from '../../types/restriction';
import { mapCreatorRestrictions, restrictionNotice } from '../restrictions';

const NOW = Date.parse('2026-10-20T10:00:00Z');
const DAY = 86_400_000;

const row = (over: Partial<CreatorRestriction> & Pick<CreatorRestriction, 'kind'>): CreatorRestriction => ({
  id: 'r1',
  blocksPublicApplications: true,
  blocksDirectOffers: false,
  dealId: null,
  startsAt: NOW - DAY,
  endsAt: null,
  ...over,
});

const owed = row({
  id: 'owed',
  kind: { key: 'return_pending', label: 'Return pending' },
  blocksDirectOffers: true,
  dealId: '01J',
});
const ban = row({ id: 'ban', kind: { key: 'public_apply_ban', label: 'Ban' }, endsAt: NOW + 10 * DAY });

const list = (items: CreatorRestriction[], canApplyPublic = true, canAcceptDirect = true): CreatorRestrictions => ({
  items,
  canApplyPublic,
  canAcceptDirect,
});

describe('mapCreatorRestrictions', () => {
  it('maps rows and the two verdicts, an unknown kind keeps its label', () => {
    const mapped = mapCreatorRestrictions(
      [
        {
          id: 'a',
          kind: { key: 'return_pending', label: 'Return pending' },
          blocks_public_applications: true,
          blocks_direct_offers: true,
          deal_id: '01J',
          starts_at: '2026-10-19T10:00:00Z',
          ends_at: null,
        },
        {
          id: 'b',
          kind: { key: 'brand_new', label: 'New' },
          blocks_public_applications: false,
          blocks_direct_offers: false,
          deal_id: null,
          starts_at: null,
          ends_at: '2026-11-16T00:00:00Z',
        },
      ],
      { can_apply_public: false, can_accept_direct: false },
    );
    expect(mapped.canApplyPublic).toBe(false);
    expect(mapped.canAcceptDirect).toBe(false);
    expect(mapped.items[0]).toEqual({
      id: 'a',
      kind: { key: 'return_pending', label: 'Return pending' },
      blocksPublicApplications: true,
      blocksDirectOffers: true,
      dealId: '01J',
      startsAt: Date.parse('2026-10-19T10:00:00Z'),
      endsAt: null,
    });
    expect(mapped.items[1]?.kind).toEqual({ key: null, label: 'New' });
    expect(mapped.items[1]?.endsAt).toBe(Date.parse('2026-11-16T00:00:00Z'));
  });
});

describe('restrictionNotice', () => {
  it('is null before the answer and with nothing in the way', () => {
    expect(restrictionNotice(null, 'public', NOW)).toBeNull();
    expect(restrictionNotice(list([]), 'public', NOW)).toBeNull();
  });

  it('puts the owed waybill ahead of a ban', () => {
    expect(restrictionNotice(list([ban, owed], false), 'public', NOW)).toEqual({
      kind: 'return_pending',
      dealId: '01J',
      label: 'Return pending',
    });
    expect(restrictionNotice(list([ban], false), 'public', NOW)).toEqual({
      kind: 'public_apply_ban',
      endsAt: NOW + 10 * DAY,
      label: 'Ban',
    });
  });

  it('answers per scope: a ban leaves direct offers alone', () => {
    expect(restrictionNotice(list([ban], false), 'direct', NOW)).toBeNull();
    expect(restrictionNotice(list([owed], false, false), 'direct', NOW)?.kind).toBe('return_pending');
  });

  it('lets a ban whose date has passed go without a refetch, but never a waybill with no date', () => {
    const lapsed = row({ id: 'old', kind: { key: 'public_apply_ban', label: 'Ban' }, endsAt: NOW - 1 });
    expect(restrictionNotice(list([lapsed], false), 'public', NOW)).toBeNull();
    expect(restrictionNotice(list([owed], false), 'public', NOW)?.kind).toBe('return_pending');
  });

  it('still locks when the server says no and names nothing', () => {
    expect(restrictionNotice(list([], false, true), 'public', NOW)).toEqual({ kind: 'other', endsAt: null, label: '' });
    expect(restrictionNotice(list([], false, true), 'direct', NOW)).toBeNull();
  });

  it('shows an unknown kind that blocks, in the server\'s words', () => {
    const odd = row({ id: 'odd', kind: { key: null, label: 'Something new' }, endsAt: NOW + DAY });
    expect(restrictionNotice(list([odd], false), 'public', NOW)).toEqual({
      kind: 'other',
      endsAt: NOW + DAY,
      label: 'Something new',
    });
  });
});
