import type { CampaignDraftBrief } from '../../types/campaignDraft';
import {
  briefPreviewLines,
  campaignKycGate,
  missingByStep,
  readCampaignMissing,
  submitBlockOf,
} from '../campaignReview';

const brief = (patch: Partial<CampaignDraftBrief> = {}): CampaignDraftBrief => ({
  hashtags: [],
  mentions: [],
  talkingPoints: [],
  donts: [],
  links: [],
  promoCode: '',
  trackingLink: '',
  ...patch,
});

describe('readCampaignMissing', () => {
  it('reads the reasons of a campaign_not_ready refusal', () => {
    expect(readCampaignMissing({ meta: { missing: ['pricing', 'schedule'] } })).toEqual(['pricing', 'schedule']);
  });

  it('drops what is not text, and answers null without the list', () => {
    expect(readCampaignMissing({ meta: { missing: ['pricing', 3, null] } })).toEqual(['pricing']);
    expect(readCampaignMissing({ meta: {} })).toBeNull();
    expect(readCampaignMissing('campaign_not_ready')).toBeNull();
    expect(readCampaignMissing(null)).toBeNull();
  });
});

describe('missingByStep', () => {
  it('groups the known reasons under the step that owns them', () => {
    expect(missingByStep(['pricing', 'title', 'schedule', 'deliverables'])).toEqual({
      idea: ['title'],
      requirements: ['deliverables'],
      money: ['pricing', 'schedule'],
      review: [],
    });
  });

  it('leaves out a reason this build does not know', () => {
    expect(missingByStep(['payout_method'])).toEqual({ idea: [], requirements: [], money: [], review: [] });
  });
});

describe('campaignKycGate', () => {
  it('reads the brand verification from /me', () => {
    expect(campaignKycGate('verified')).toBe('verified');
    expect(campaignKycGate('pending')).toBe('pending');
    expect(campaignKycGate('unverified')).toBe('required');
    expect(campaignKycGate('rejected')).toBe('required');
  });

  it('lets the server decide when the status is unknown', () => {
    expect(campaignKycGate(undefined)).toBe('unknown');
    expect(campaignKycGate('suspended')).toBe('unknown');
  });
});

describe('submitBlockOf', () => {
  it('opens a sheet for KYC and the live limit only', () => {
    expect(submitBlockOf({ code: 'kyc_required' })).toBe('kyc');
    expect(submitBlockOf({ code: 'campaign_live_limit' })).toBe('liveLimit');
    expect(submitBlockOf({ code: 'campaign_not_ready' })).toBeNull();
    expect(submitBlockOf({ code: null })).toBeNull();
  });
});

describe('briefPreviewLines', () => {
  it('takes a few of the brief’s own lines, hashtags first', () => {
    expect(
      briefPreviewLines(
        brief({ hashtags: ['#a', '#b'], talkingPoints: ['Show the cup'], promoCode: 'RAMADAN10', donts: ['No rivals'] }),
      ),
    ).toEqual(['#a #b', 'Show the cup', 'RAMADAN10']);
  });

  it('shows a repeated line once', () => {
    expect(briefPreviewLines(brief({ talkingPoints: ['Show the cup', 'Show the cup'], donts: ['No rivals'] }))).toEqual([
      'Show the cup',
      'No rivals',
    ]);
  });

  it('is empty for an empty brief', () => {
    expect(briefPreviewLines(brief({ promoCode: '  ' }))).toEqual([]);
  });
});
