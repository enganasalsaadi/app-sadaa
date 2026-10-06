import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { StatTile } from '../StatTile';
import type { StatTileProps } from '../StatTile';

const isHost = (node: ReactTestInstance, type: string): boolean => node.type === type;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number) => `${Math.round(value * 1000) / 10}%`,
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { iconStroke: { bold: 2 }, useTheme: () => ({ colors: tokens, sizes: tokens }) };
});

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
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

jest.mock('../../primitives/Box', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
  return { Box: ({ children, ...props }: { children?: React.ReactNode }) => createElement('Box', props, children) };
});
jest.mock('../../primitives/Text', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
  return { Text: ({ children, ...props }: { children?: React.ReactNode }) => createElement('Text', props, children) };
});
jest.mock('../../Skeleton', () => ({ Skeleton: () => null }));

const render = (props: Partial<StatTileProps> = {}) => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<StatTile label="Views" value="1.2K" {...props} />);
  });
  if (!tree) {
    throw new Error('render failed');
  }
  return tree.root;
};

const texts = (root: ReactTestInstance) =>
  root
    .findAll(n => isHost(n, 'Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string');
const trendIcons = (root: ReactTestInstance) => root.findAll(n => isHost(n, 'Icon'));
const label = (root: ReactTestInstance) => root.findAll(n => isHost(n, 'Box'))[0]?.props.accessibilityLabel;

describe('StatTile change', () => {
  it('shows a trend arrow and the percentage for a number', () => {
    const root = render({ change: 0.12 });
    expect(texts(root)).toContain('12%');
    expect(trendIcons(root).map(i => i.props.name)).toEqual(['TrendingUp']);
  });

  it('shows "new" with no arrow when there is nothing to compare to', () => {
    const root = render({ change: 'new' });
    expect(texts(root)).toContain('common.stat.new');
    expect(trendIcons(root)).toHaveLength(0);
  });

  it('reads "new" to a screen reader without the "change" wording', () => {
    expect(label(render({ change: 'new' }))).toBe('Views, 1.2K, common.stat.new');
  });

  it('shows no change row when change is omitted', () => {
    const root = render();
    expect(texts(root)).toEqual(['Views', '1.2K']);
    expect(trendIcons(root)).toHaveLength(0);
  });
});
