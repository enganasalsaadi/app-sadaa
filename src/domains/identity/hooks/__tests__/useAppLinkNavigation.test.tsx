import React from 'react';
import { act, create } from 'react-test-renderer';
import type { AppLinkHandler } from '@/core/linking';
import { useAppLinkNavigation } from '../useAppLinkNavigation';

const mockHandlers: AppLinkHandler[] = [];
const mockUnsubscribe = jest.fn();
const mockPush = jest.fn();

jest.mock('@/core/linking', () => ({
  appLinkManager: {
    registerOpenHandler: (handler: AppLinkHandler) => {
      mockHandlers.push(handler);
      return mockUnsubscribe;
    },
  },
}));

jest.mock('@/core/navigation', () => ({
  push: (...args: unknown[]) => mockPush(...args),
}));

const Probe: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  useAppLinkNavigation(enabled);
  return null;
};

describe('useAppLinkNavigation', () => {
  beforeEach(() => {
    mockHandlers.length = 0;
    jest.clearAllMocks();
    jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback(0);
        return 1;
      });
  });

  it('does not listen while disabled (a gate is showing)', () => {
    act(() => {
      create(<Probe enabled={false} />);
    });
    expect(mockHandlers).toHaveLength(0);
  });

  it('pushes the typed public-profile route with source "link"', () => {
    act(() => {
      create(<Probe enabled />);
    });
    act(() => mockHandlers[0]?.({ kind: 'creator', slug: 'anas' }));
    expect(mockPush).toHaveBeenCalledWith('MediaKitPublic', { slug: 'anas', source: 'link' });
  });

  it('unsubscribes when disabled again', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<Probe enabled />);
    });
    act(() => tree?.update(<Probe enabled={false} />));
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
