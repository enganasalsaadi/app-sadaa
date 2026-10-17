import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { CreatorCampaign } from '../../../types';
import { HomeCampaigns } from '../components/HomeCampaigns';
import type { CreatorHomeCampaigns } from '../hooks/useCreatorHomeCampaigns';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({ formatNumber: (value: number) => String(value) }));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: (_target, key) => (key === Symbol.toPrimitive ? () => 0 : tokens) });
  return {
    useTheme: () => ({ colors: tokens, sizes: tokens, spacing: tokens, isRTL: false }),
    useStyles: () => tokens,
    moderateScale: (n: number) => n,
    iconStroke: { regular: 2, bold: 2.5 },
  };
});

jest.mock('lucide-react-native', () => ({ Inbox: () => null }));

jest.mock('@/shared/ui', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) => createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  const StaggerIn = ({ children }: { children?: React.ReactNode }) => createElement(Fragment, null, children);
  return {
    Box: stub('Box'),
    Pressable: stub('Pressable'),
    Rail: stub('Rail'),
    StaggerIn,
    Text: stub('Text'),
  };
});

jest.mock('../../../hooks/useClock', () => ({ useClock: () => 0 }));
jest.mock('../components/CampaignTicket', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return { CampaignTicket: (props: object) => createElement('CampaignTicket', props) };
});

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;
const ticket = (id: string) => ({ id }) as CreatorCampaign;

const render = (campaigns: CreatorHomeCampaigns) => {
  const handlers = {
    openCampaign: jest.fn(),
    openFeed: jest.fn(),
    openApplications: jest.fn(),
    openRates: jest.fn(),
  };
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<HomeCampaigns campaigns={campaigns} {...handlers} />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, ...handlers };
};

const strip = (overrides: Partial<Extract<CreatorHomeCampaigns, { kind: 'strip' }>> = {}): CreatorHomeCampaigns => ({
  kind: 'strip',
  feedCount: 12,
  newInvites: 1,
  openApplications: 2,
  items: [ticket('a'), ticket('b'), ticket('c')],
  ...overrides,
});

const pressables = (root: ReactTestInstance) => root.findAll(isHost('Pressable'));
const chip = (root: ReactTestInstance, key: string) =>
  pressables(root).find(node => String(node.props.accessibilityLabel).includes(key));

describe('HomeCampaigns', () => {
  it('renders nothing while the server sends no campaigns', () => {
    const { root } = render({ kind: 'hidden' });
    expect(root.findAll(isHost('Rail'))).toHaveLength(0);
    expect(root.findAll(isHost('Text'))).toHaveLength(0);
  });

  it('shows a ticket per card and a last tile when the feed holds more', () => {
    const { root, openFeed } = render(strip());
    expect(root.findAll(isHost('CampaignTicket'))).toHaveLength(3);
    const all = chip(root, 'allA11y');
    expect(all).toBeDefined();
    act(() => all?.props.onPress());
    expect(openFeed).toHaveBeenCalledTimes(1);
  });

  it('drops the last tile when every campaign is already a ticket', () => {
    const { root } = render(strip({ feedCount: 3 }));
    expect(chip(root, 'allA11y')).toBeUndefined();
  });

  it('opens the feed for open + invitations and my applications for the ones under review', () => {
    const { root, openFeed, openApplications } = render(strip());
    act(() => chip(root, 'chips.available')?.props.onPress());
    act(() => chip(root, 'chips.invites')?.props.onPress());
    expect(openFeed).toHaveBeenCalledTimes(2);
    act(() => chip(root, 'chips.review')?.props.onPress());
    expect(openApplications).toHaveBeenCalledTimes(1);
  });

  it('shows a chip only for counts above 0', () => {
    const { root } = render(strip({ newInvites: 0, openApplications: 0 }));
    expect(chip(root, 'chips.available')).toBeDefined();
    expect(chip(root, 'chips.invites')).toBeUndefined();
    expect(chip(root, 'chips.review')).toBeUndefined();
  });

  it('offers the rate cards when nothing fits yet', () => {
    const { root, openRates } = render(strip({ feedCount: 0, newInvites: 0, openApplications: 0, items: [] }));
    expect(root.findAll(isHost('Rail'))).toHaveLength(0);
    const quiet = chip(root, 'quiet.title');
    expect(quiet).toBeDefined();
    act(() => quiet?.props.onPress());
    expect(openRates).toHaveBeenCalledTimes(1);
  });

  it('keeps the chips without the calm card when only applications are open', () => {
    const { root } = render(strip({ feedCount: 0, newInvites: 0, openApplications: 1, items: [] }));
    expect(chip(root, 'chips.review')).toBeDefined();
    expect(chip(root, 'quiet.title')).toBeDefined();
  });
});
