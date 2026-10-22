import type { StrengthStage } from '@/domains/identity';
import type { CreatorActiveDeal } from '../../../../types';
import { buildHomeTasks, homeTaskKey } from '../buildHomeTasks';

const deal = (id: string): CreatorActiveDeal => ({
  id,
  status: { key: 'pending_influencer', label: 'Waiting' },
  stage: null,
  brand: { name: 'Nova', avatarUrl: null },
  title: 'Reel',
  total: { amount: 15000, currency: 'USD' },
  dueAt: null,
  needsAction: true,
  action: { key: 'reply_offer', label: 'Reply' },
});

const stages: StrengthStage[] = [
  { key: 'info', state: 'done' },
  { key: 'avatar', state: 'upcoming' },
  { key: 'platforms', state: 'done' },
  { key: 'rates', state: 'current' },
  { key: 'kyc', state: 'upcoming' },
];

describe('buildHomeTasks', () => {
  it('puts the blocker first, then the waiting deals in the server order', () => {
    const tasks = buildHomeTasks({
      notice: 'platformsActionRequired',
      waiting: [deal('a'), deal('b')],
      welcome: false,
      stages,
    });
    expect(tasks.map(homeTaskKey)).toEqual(['notice:platformsActionRequired', 'deal:a', 'deal:b']);
  });

  it('adds the open storefront stages only before the first offer', () => {
    const welcome = buildHomeTasks({ notice: null, waiting: [], welcome: true, stages });
    expect(welcome.map(homeTaskKey)).toEqual(['step:avatar', 'step:rates', 'step:kyc']);
    expect(buildHomeTasks({ notice: null, waiting: [], welcome: false, stages })).toEqual([]);
  });

  it('never asks twice: a notice covering a stage hides that step', () => {
    const tasks = buildHomeTasks({ notice: 'rateCardRequired', waiting: [], welcome: true, stages });
    expect(tasks.map(homeTaskKey)).toEqual(['notice:rateCardRequired', 'step:avatar', 'step:kyc']);
  });
});
