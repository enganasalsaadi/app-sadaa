import type { DealItemStatus, DealPublication, DealPublicationDecision } from '../../types';
import {
  checkLiveUrl,
  dealFixAsk,
  dealFixCount,
  dealItemStage,
  isLastToVerify,
  livePlatformOf,
  parseLiveUrl,
  readLiveUrlReason,
  safeLiveUrl,
  toPublishBody,
  windowShare,
} from '../dealPublish';

const publication = (
  sequence: number,
  decision: DealPublicationDecision | null = null,
  note: string | null = null,
): DealPublication => ({
  id: `pub-${sequence}`,
  itemId: 'item-1',
  sequence,
  url: 'https://instagram.com/reel/abc',
  platform: 'instagram',
  handle: 'sara.style',
  handleChecked: true,
  submittedAt: 0,
  proofs: [],
  review: decision
    ? { decision: { key: decision, label: decision }, by: null, note, reviewedAt: 0 }
    : null,
});

const status = (key: DealItemStatus | null) => ({ key, label: key ?? 'unknown' });

describe('parseLiveUrl', () => {
  it('reads the platform from the host, subdomains included', () => {
    expect(parseLiveUrl('https://www.instagram.com/reel/C9x')).toEqual({
      url: 'https://www.instagram.com/reel/C9x',
      host: 'instagram.com',
      path: '/reel/C9x',
      platform: 'instagram',
    });
    expect(parseLiveUrl(' https://vm.tiktok.com/ZM123/ ')?.platform).toBe('tiktok');
    expect(parseLiveUrl('http://youtu.be/xyz')?.platform).toBe('youtube');
    expect(parseLiveUrl('https://fb.watch/abc')?.platform).toBe('facebook');
    expect(parseLiveUrl('https://t.me/channel/12')?.platform).toBe('telegram');
  });

  it('keeps a valid link on an unknown host without a platform', () => {
    expect(parseLiveUrl('https://example.com/post')?.platform).toBeNull();
  });

  it('refuses anything that is not a plain http(s) link', () => {
    expect(parseLiveUrl('')).toBeNull();
    expect(parseLiveUrl('instagram.com/reel/abc')).toBeNull();
    expect(parseLiveUrl('ftp://instagram.com/reel')).toBeNull();
    expect(parseLiveUrl('data:text/html,instagram.com')).toBeNull();
    expect(parseLiveUrl('https://instagram.com@evil.example/reel')).toBeNull();
    expect(parseLiveUrl(`https://instagram.com/${'a'.repeat(2048)}`)).toBeNull();
  });

  it('does not take a look-alike host for the platform', () => {
    expect(livePlatformOf('notinstagram.com')).toBeNull();
    expect(livePlatformOf('instagram.com.evil.example')).toBeNull();
  });
});

describe('checkLiveUrl', () => {
  it('flags an invalid link and a link from another platform', () => {
    expect(checkLiveUrl('not a link', 'instagram')).toBe('invalid');
    expect(checkLiveUrl('https://tiktok.com/@sara/video/1', 'instagram')).toBe('platform_mismatch');
    expect(checkLiveUrl('https://example.com/post', 'instagram')).toBe('platform_mismatch');
  });

  it('passes a link on the item platform, or any valid link when the app does not know the platform', () => {
    expect(checkLiveUrl('https://instagram.com/reel/abc', 'instagram')).toBeNull();
    expect(checkLiveUrl('https://example.com/post', 'snapchat')).toBeNull();
    expect(checkLiveUrl('https://example.com/post', null)).toBeNull();
  });
});

describe('safeLiveUrl', () => {
  it('opens only allow-listed platform hosts', () => {
    expect(safeLiveUrl('https://instagram.com/reel/abc')).toBe('https://instagram.com/reel/abc');
    expect(safeLiveUrl('https://example.com/post')).toBeNull();
    expect(safeLiveUrl('intent://instagram.com')).toBeNull();
    expect(safeLiveUrl(null)).toBeNull();
  });
});

describe('readLiveUrlReason', () => {
  it('maps the server reason codes', () => {
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: 'handle_mismatch' })).toBe('handle_mismatch');
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: 'platform_mismatch' })).toBe('platform_mismatch');
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: 'invalid' })).toBe('invalid');
    expect(readLiveUrlReason({ code: 'deal_live_url_taken', reason: null })).toBe('taken');
  });

  it('falls back to «invalid» for an unknown or missing reason, and ignores other errors', () => {
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: 'something_new' })).toBe('invalid');
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: 'taken' })).toBe('invalid');
    expect(readLiveUrlReason({ code: 'deal_live_url_invalid', reason: null })).toBe('invalid');
    expect(readLiveUrlReason({ code: 'deal_fix_limit', reason: null })).toBeNull();
    expect(readLiveUrlReason({ code: null, reason: 'handle_mismatch' })).toBeNull();
  });
});

describe('dealItemStage', () => {
  it('moves an item to its publish screen once the draft is approved', () => {
    expect(dealItemStage({ status: status('pending') })).toBe('draft');
    expect(dealItemStage({ status: status('revision_requested') })).toBe('draft');
    expect(dealItemStage({ status: status(null) })).toBe('draft');
    expect(dealItemStage({ status: status('approved_to_publish') })).toBe('publish');
    expect(dealItemStage({ status: status('verifying_live') })).toBe('publish');
    expect(dealItemStage({ status: status('verified') })).toBe('publish');
  });
});

describe('fix requests', () => {
  it('finds the submission the brand sent back', () => {
    expect(dealFixAsk([])).toBeNull();
    expect(dealFixAsk([publication(1)])).toBeNull();
    expect(dealFixAsk([publication(2, 'fix_requested', 'wrong reel'), publication(1, 'fix_requested')])?.sequence).toBe(2);
    expect(dealFixAsk([publication(2, 'confirmed')])).toBeNull();
  });

  it('counts fixes used from the record and left from the server', () => {
    const history = [publication(3), publication(2, 'fix_requested'), publication(1, 'fix_requested')];
    expect(dealFixCount({ fixRequestsLeft: 0 }, history)).toEqual({ used: 2, remaining: 0, allowed: 2 });
    expect(dealFixCount({ fixRequestsLeft: 2 }, [publication(1)])).toEqual({ used: 0, remaining: 2, allowed: 2 });
    expect(dealFixCount({ fixRequestsLeft: -1 }, [])).toEqual({ used: 0, remaining: 0, allowed: 0 });
  });
});

describe('windowShare', () => {
  it('is the share of the window gone, clamped, and 0 without a deadline', () => {
    expect(windowShare(0, 100, 25)).toBe(0.25);
    expect(windowShare(0, 100, 150)).toBe(1);
    expect(windowShare(50, 100, 0)).toBe(0);
    expect(windowShare(0, null, 50)).toBe(0);
    expect(windowShare(100, 100, 100)).toBe(0);
  });
});

describe('isLastToVerify', () => {
  it('is true only when every other deliverable is verified', () => {
    const items = [
      { id: 'a', status: status('verified') },
      { id: 'b', status: status('verifying_live') },
    ];
    expect(isLastToVerify({ items }, 'b')).toBe(true);
    expect(isLastToVerify({ items }, 'a')).toBe(false);
  });
});

describe('toPublishBody', () => {
  it('sends the trimmed link with the screenshots, and no link when empty', () => {
    expect(toPublishBody(' https://instagram.com/reel/abc ', ['f1', 'f2'])).toEqual({
      url: 'https://instagram.com/reel/abc',
      proof_file_ids: ['f1', 'f2'],
    });
    expect(toPublishBody('  ', ['f1'])).toEqual({ proof_file_ids: ['f1'] });
  });
});
