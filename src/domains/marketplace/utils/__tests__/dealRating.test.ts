import type { DealRating, DealRatingSide } from '../../types';
import {
  dealRatingView,
  firstMissingCriterion,
  ratingAverage,
  ratingCriteriaOf,
  ratingHoursLeft,
  ratingWindowLeft,
  toRatingBody,
} from '../dealRating';

const HOUR = 3_600_000;

const waiting = (answered: boolean): DealRatingSide => ({ answered, revealed: null });

const opened = (overall: number | null): DealRatingSide => ({
  answered: overall !== null,
  revealed: {
    skipped: overall === null,
    scores: {},
    overall,
    comment: null,
    submittedAt: overall === null ? null : 1,
  },
});

const rating = (patch: Partial<DealRating> = {}): DealRating => ({
  open: true,
  dueAt: 100 * HOUR,
  revealedAt: null,
  brand: waiting(false),
  creator: waiting(false),
  ...patch,
});

describe('dealRatingView', () => {
  it('has nothing before the deal completes', () => {
    expect(dealRatingView(null, 'brand')).toBeNull();
  });

  it('invites a side that has not answered while the window is open', () => {
    const view = dealRatingView(rating({ creator: waiting(true) }), 'brand');
    expect(view?.stage).toBe('invite');
    expect(view?.theirs.answered).toBe(true);
  });

  it('seals a side that answered and waits for the other', () => {
    expect(dealRatingView(rating({ creator: waiting(true) }), 'creator')?.stage).toBe('sealed');
  });

  it('waits for the reveal once the window shut without one', () => {
    expect(dealRatingView(rating({ open: false }), 'brand')?.stage).toBe('closing');
  });

  it('reveals from revealed_at or from either side carrying its answer', () => {
    expect(dealRatingView(rating({ open: false, revealedAt: 5 }), 'brand')?.stage).toBe('revealed');
    expect(
      dealRatingView(rating({ open: false, brand: opened(4.3) }), 'creator')?.stage,
    ).toBe('revealed');
  });

  it("gives each role its own criteria and the other side's for what was said about them", () => {
    const view = dealRatingView(rating(), 'creator');
    expect(view?.criteria).toEqual(['brief_clarity', 'review_speed', 'request_clarity']);
    expect(view?.theirCriteria).toEqual(['content_quality', 'timeliness', 'communication']);
  });
});

describe('ratingAverage', () => {
  const criteria = ratingCriteriaOf('brand');

  it('averages the given scores to one decimal', () => {
    expect(ratingAverage({ content_quality: 5, timeliness: 4, communication: 4 }, criteria)).toBe(4.3);
  });

  it('ignores criteria of the other role and missing scores', () => {
    expect(ratingAverage({ content_quality: 3, brief_clarity: 1 }, criteria)).toBe(3);
    expect(ratingAverage({}, criteria)).toBeNull();
  });
});

describe('firstMissingCriterion', () => {
  const criteria = ratingCriteriaOf('creator');

  it('points at the first question without a score', () => {
    expect(firstMissingCriterion({ brief_clarity: 4 }, criteria)).toBe(1);
  });

  it('is -1 once all three are answered', () => {
    expect(
      firstMissingCriterion({ brief_clarity: 4, review_speed: 2, request_clarity: 5 }, criteria),
    ).toBe(-1);
  });
});

describe('toRatingBody', () => {
  const criteria = ratingCriteriaOf('brand');
  const scores = { content_quality: 5, timeliness: 3, communication: 4, review_speed: 1 };

  it("sends exactly the role's criteria and a trimmed note", () => {
    expect(toRatingBody(scores, criteria, '  great work  ')).toEqual({
      scores: { content_quality: 5, timeliness: 3, communication: 4 },
      comment: 'great work',
    });
  });

  it('leaves an empty note out', () => {
    expect(toRatingBody(scores, criteria, '   ')).not.toHaveProperty('comment');
  });
});

describe('rating clock', () => {
  it('rounds hours left up and never goes negative', () => {
    expect(ratingHoursLeft(10 * HOUR, 0.5 * HOUR)).toBe(10);
    expect(ratingHoursLeft(HOUR, 3 * HOUR)).toBe(0);
    expect(ratingHoursLeft(null, 0)).toBeNull();
  });

  it('draws the share of the seven days still left', () => {
    expect(ratingWindowLeft(84 * HOUR, 0)).toBe(0.5);
    expect(ratingWindowLeft(500 * HOUR, 0)).toBe(1);
    expect(ratingWindowLeft(HOUR, 2 * HOUR)).toBe(0);
    expect(ratingWindowLeft(null, 0)).toBe(0);
  });
});
