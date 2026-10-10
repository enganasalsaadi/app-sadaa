import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { MediaKitInsightsScreenModel } from '../hooks/useMediaKitInsightsScreen';
import { MediaKitInsightsScreen } from '../MediaKitInsightsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number) => String(value),
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
});

jest.mock('@/shared/context/BottomBarContext', () => ({
  useHideBottomBar: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<{
    createElement: typeof React.createElement;
  }>('react');
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        typeof name === 'string' && name !== '__esModule'
          ? (props: object) => createElement('Icon', { name, ...props })
          : undefined,
    },
  );
});

jest.mock('@/shared/ui', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
    }) => createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  // Renders every slot so the period switch, body and footer are reachable in the tree.
  const Layout = ({
    sticky,
    footer,
    children,
    ...props
  }: {
    sticky?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
  }) =>
    createElement(
      'Layout',
      props,
      createElement(Fragment, null, sticky, children, footer),
    );
  const LayoutFooter = ({ top, ...props }: { top?: React.ReactNode }) =>
    createElement('LayoutFooter', props, top);
  return {
    Box: stub('Box'),
    Card: stub('Card'),
    ErrorState: stub('ErrorState'),
    Layout,
    LayoutFooter,
    ListGroup: stub('ListGroup'),
    ListRow: stub('ListRow'),
    Notice: stub('Notice'),
    ProgressBar: stub('ProgressBar'),
    SectionHeader: stub('SectionHeader'),
    SegmentedControl: stub('SegmentedControl'),
    Sparkline: stub('Sparkline'),
    StatTile: stub('StatTile'),
    Text: stub('Text'),
  };
});

const mockModel: { current: MediaKitInsightsScreenModel | null } = {
  current: null,
};
jest.mock('../hooks/useMediaKitInsightsScreen', () => ({
  useMediaKitInsightsScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) =>
  node.type === type;

const share = (
  overrides: Partial<MediaKitInsightsScreenModel['share']> = {},
): MediaKitInsightsScreenModel['share'] => ({
  isReady: true,
  isSharing: false,
  error: null,
  canRetry: false,
  isMakingPublic: false,
  onShare: jest.fn(),
  onCopy: jest.fn(),
  onRetry: jest.fn(),
  onDismissError: jest.fn(),
  onMakePublic: jest.fn(),
  ...overrides,
});

const model = (
  overrides: Partial<MediaKitInsightsScreenModel> = {},
): MediaKitInsightsScreenModel => ({
  period: '30d',
  periodOptions: [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
  ],
  onPeriodChange: jest.fn(),
  status: 'ready',
  error: undefined,
  rangeLabel: 'Sep 7 – Oct 6',
  compareLabel: 'compare',
  tileRows: [
    [
      { key: 'profile_views', value: 1240, change: 0.12 },
      { key: 'unique_brand_views', value: 38, change: 0.267 },
    ],
    [
      { key: 'link_opens', value: 96, change: 'new' },
      { key: 'shares', value: 14, change: 0.556 },
    ],
  ],
  noActivity: false,
  dailyViews: { values: [2, 7], accessibilityLabel: 'daily' },
  locations: [{ key: 'damascus', label: 'Damascus', count: 21, share: 0.553 }],
  topWork: [],
  share: share(),
  refreshing: false,
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  ...overrides,
});

const render = (overrides: Partial<MediaKitInsightsScreenModel> = {}) => {
  const vm = model(overrides);
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitInsightsScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

describe('MediaKitInsightsScreen', () => {
  it('wires the period switch', () => {
    const { root, vm } = render();
    const control = root.find(isHost('SegmentedControl'));
    expect(control.props.value).toBe('30d');
    expect(control.props.options).toBe(vm.periodOptions);
    expect(control.props.onChange).toBe(vm.onPeriodChange);
  });

  it('renders every tile with its change vs the previous period', () => {
    const { root } = render();
    const tiles = root.findAll(isHost('StatTile'));
    expect(tiles.map(tile => tile.props.label)).toEqual([
      'account.mediaKit.tiles.views',
      'account.mediaKit.tiles.brands',
      'account.mediaKit.tiles.linkOpens',
      'account.mediaKit.tiles.shares',
    ]);
    expect(tiles.map(tile => tile.props.change)).toEqual([
      0.12,
      0.267,
      'new',
      0.556,
    ]);
  });

  it('adds the search impressions tile once the server reports it', () => {
    const { root } = render({
      tileRows: [
        [
          { key: 'profile_views', value: 1240, change: 0.12 },
          { key: 'unique_brand_views', value: 38, change: 0.267 },
        ],
        [
          { key: 'link_opens', value: 96, change: 'new' },
          { key: 'shares', value: 14, change: 0.556 },
        ],
        [{ key: 'search_impressions', value: 410, change: undefined }],
      ],
    });
    const tiles = root.findAll(isHost('StatTile'));
    expect(tiles).toHaveLength(5);
    expect(tiles[4]?.props.label).toBe(
      'account.mediaKit.tiles.searchImpressions',
    );
    expect(tiles[4]?.props.change).toBeUndefined();
  });

  it('shows skeleton tiles and no sections while loading', () => {
    const { root } = render({
      status: 'loading',
      tileRows: [],
      dailyViews: null,
      locations: [],
    });
    const tiles = root.findAll(isHost('StatTile'));
    expect(tiles).toHaveLength(4);
    expect(tiles.every(tile => tile.props.loading === true)).toBe(true);
    expect(root.findAll(isHost('Sparkline'))).toHaveLength(0);
  });

  it('shows the error state with retry instead of the body', () => {
    const { root, vm } = render({ status: 'error', tileRows: [] });
    expect(root.find(isHost('ErrorState')).props.onRetry).toBe(vm.onRetry);
    expect(root.findAll(isHost('StatTile'))).toHaveLength(0);
  });

  it('prompts a share when there is no activity yet', () => {
    const { root } = render({ noActivity: true });
    expect(root.find(isHost('Notice')).props.message).toBe(
      'account.mediaKit.noActivity',
    );
  });

  it('draws the daily views line and the brand cities', () => {
    const { root } = render();
    expect(root.find(isHost('Sparkline')).props.values).toEqual([2, 7]);
    const [city] = root.findAll(isHost('ProgressBar'));
    expect(city?.props.value).toBe(0.553);
    expect(city?.props.label).toBe('Damascus');
  });

  it('hides empty sections (§17.7)', () => {
    const { root } = render({ dailyViews: null, locations: [], topWork: [] });
    expect(root.findAll(isHost('Sparkline'))).toHaveLength(0);
    expect(root.findAll(isHost('ProgressBar'))).toHaveLength(0);
    expect(root.findAll(isHost('ListGroup'))).toHaveLength(0);
  });

  it('lists the most-viewed work once the server sends it', () => {
    const { root } = render({
      topWork: [
        {
          id: 'w1',
          title: 'Reel',
          thumbnail_url: 'https://x/y.jpg',
          clicks: 12,
        },
      ],
    });
    expect(root.find(isHost('ListRow')).props.title).toBe('Reel');
  });

  it('makes Share the footer primary, blocked until the link is known', () => {
    const { root, vm } = render({ share: share({ isReady: false }) });
    const { primary } = root.find(isHost('LayoutFooter')).props;
    expect(primary.onPress).toBe(vm.share.onShare);
    expect(primary.disabled).toBe(true);
  });

  it('offers "Make public" above the footer when the kit is hidden', () => {
    const { root, vm } = render({ share: share({ error: 'private' }) });
    const notice = root.find(isHost('LayoutFooter')).find(isHost('Notice'));
    expect(notice.props.action.onPress).toBe(vm.share.onMakePublic);
  });
});
