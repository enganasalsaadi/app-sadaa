import React from 'react';
import { act, create } from 'react-test-renderer';
import type { SlugCheck } from '../../types/mediaKit';
import {
  SLUG_CHECK_DEBOUNCE_MS,
  useSlugAvailability,
  type SlugAvailability,
} from '../useSlugAvailability';

interface Deferred {
  slug: string;
  resolve: (value: SlugCheck) => void;
  reject: (error: unknown) => void;
  abort: jest.Mock;
}

const requests: Deferred[] = [];
const mockCheckSlug = jest.fn((slug: string) => {
  let resolve: Deferred['resolve'] = () => undefined;
  let reject: Deferred['reject'] = () => undefined;
  const promise = new Promise<SlugCheck>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const abort = jest.fn();
  requests.push({ slug, resolve, reject, abort });
  return { unwrap: () => promise, abort };
});

jest.mock('../../api/mediaKitApi', () => ({
  useLazyCheckMediaKitSlugQuery: () => [mockCheckSlug],
}));

const latest: { availability: SlugAvailability | null; recheck: () => void } = {
  availability: null,
  recheck: () => undefined,
};

const Probe: React.FC<{ slug: string; current: string | null }> = ({ slug, current }) => {
  const result = useSlugAvailability(slug, current);
  latest.availability = result.availability;
  latest.recheck = result.recheck;
  return null;
};

const flush = () => act(async () => {});

describe('useSlugAvailability', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    requests.length = 0;
    mockCheckSlug.mockClear();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const mount = (slug: string, current: string | null = 'anas') => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<Probe slug={slug} current={current} />);
    });
    if (!tree) throw new Error('render failed');
    const renderer = tree;
    return {
      update: (next: string) =>
        act(() => {
          renderer.update(<Probe slug={next} current={current} />);
        }),
    };
  };

  it('reports the current slug as unchanged without a request', () => {
    mount('anas');
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    expect(latest.availability).toEqual({ status: 'unchanged' });
    expect(mockCheckSlug).not.toHaveBeenCalled();
  });

  it('answers shape errors locally', () => {
    mount('ab');
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    expect(latest.availability).toEqual({ status: 'invalid', reason: 'invalid_length' });
    expect(mockCheckSlug).not.toHaveBeenCalled();
  });

  it('debounces typing into one request for the last value', async () => {
    const view = mount('noo');
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS - 1));
    view.update('noor');
    expect(latest.availability).toEqual({ status: 'checking' });
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    expect(mockCheckSlug).toHaveBeenCalledTimes(1);
    expect(mockCheckSlug).toHaveBeenCalledWith('noor');

    requests[0]?.resolve({ available: true, reason: null });
    await flush();
    expect(latest.availability).toEqual({ status: 'available' });
  });

  it('maps a taken result and drops replies for an older value', async () => {
    const view = mount('noor');
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    view.update('noor.style');
    expect(requests[0]?.abort).toHaveBeenCalled();
    requests[0]?.resolve({ available: true, reason: null });
    await flush();
    expect(latest.availability).toEqual({ status: 'checking' });

    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    requests[1]?.resolve({ available: false, reason: 'taken' });
    await flush();
    expect(latest.availability).toEqual({ status: 'unavailable', reason: 'taken' });
  });

  it('a failed check is unknown, and recheck asks again', async () => {
    mount('noor');
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    requests[0]?.reject({ status: 429 });
    await flush();
    expect(latest.availability).toEqual({ status: 'unknown' });

    act(() => latest.recheck());
    expect(latest.availability).toEqual({ status: 'checking' });
    act(() => jest.advanceTimersByTime(SLUG_CHECK_DEBOUNCE_MS));
    expect(mockCheckSlug).toHaveBeenCalledTimes(2);
  });
});
