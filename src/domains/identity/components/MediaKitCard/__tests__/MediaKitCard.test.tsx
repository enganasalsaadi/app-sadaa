import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { CustomButton, IconButton, Notice, StatusPill } from '@/shared/ui';
import { MediaKitCard } from '../MediaKitCard';
import type { MediaKitCardProps } from '../MediaKitCard';

const isHost = (node: ReactTestInstance, type: string): boolean => node.type === type;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number) => String(value),
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
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

jest.mock('@/shared/ui', () => {
  const { createElement } = jest.requireActual<{ createElement: typeof React.createElement }>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  return {
    Avatar: stub('Avatar'),
    Box: stub('Box'),
    Card: stub('Card'),
    CustomButton: stub('CustomButton'),
    IconButton: stub('IconButton'),
    MoneyText: stub('MoneyText'),
    Notice: stub('Notice'),
    Pressable: stub('Pressable'),
    Skeleton: stub('Skeleton'),
    SocialPlatformIcon: stub('SocialPlatformIcon'),
    StatusPill: stub('StatusPill'),
    Tag: stub('Tag'),
    TierBadge: stub('TierBadge'),
    Text: stub('Text'),
  };
});

const fn = () => jest.fn();

const baseProps = (): MediaKitCardProps => ({
  status: 'ready',
  link: 'https://sada.app/c/anas',
  isPublic: true,
  noActivity: false,
  share: {
    isReady: true,
    isSharing: false,
    error: null,
    canRetry: false,
    isMakingPublic: false,
    onShare: fn(),
    onCopy: fn(),
    onRetry: fn(),
    onDismissError: fn(),
    onMakePublic: fn(),
  },
  onRetry: fn(),
});

const render = (overrides: Partial<MediaKitCardProps> = {}) => {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitCard {...baseProps()} {...overrides} />);
  });
  if (!tree) {
    throw new Error('render failed');
  }
  return tree.root;
};

const textOf = (node: ReactTestInstance): string =>
  node
    .findAll(n => isHost(n, 'Text'))
    .flatMap(n => n.children)
    .filter((c): c is string => typeof c === 'string')
    .join('|');

const primary = (root: ReactTestInstance) =>
  root.findAllByType(CustomButton).find(b => b.props.title === 'account.mediaKit.share.cta');

describe('MediaKitCard — header', () => {
  it('says what the kit is for, and nudges a first share when nobody opened it', () => {
    expect(textOf(render())).toContain('account.mediaKit.subtitle');
    const quiet = render({ noActivity: true });
    expect(textOf(quiet)).toContain('account.mediaKit.noActivity');
    expect(textOf(quiet)).not.toContain('account.mediaKit.subtitle');
  });

  it('shows visibility as a pill with text, and none before the kit loads', () => {
    expect(render().findByType(StatusPill).props.label).toBe('account.mediaKit.visibility.public');
    const hidden = render({ isPublic: false }).findByType(StatusPill);
    expect(hidden.props.label).toBe('account.mediaKit.visibility.hidden');
    expect(hidden.props.tone).toBe('neutral');
    expect(render({ isPublic: null }).findAllByType(StatusPill)).toHaveLength(0);
  });
});

describe('MediaKitCard — share and copy triggers', () => {
  it('fires onShare from the one primary button', () => {
    const props = baseProps();
    const onShare = props.share.onShare;
    const root = render(props);
    const button = primary(root);
    if (!button) throw new Error('no share button');
    expect(button.props.title).toBe('account.mediaKit.share.cta');
    act(() => button.props.onPress());
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('fires onCopy from the copy icon', () => {
    const props = baseProps();
    const onCopy = props.share.onCopy;
    const root = render(props);
    const copy = root.findByType(IconButton);
    expect(copy.props.accessibilityLabel).toBe('account.mediaKit.share.copy');
    act(() => copy.props.onPress());
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('shows the link without its protocol', () => {
    expect(textOf(render())).toContain('sada.app/c/anas');
  });

  it('shows the button loading while sharing and locks copy', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isSharing: true } });
    expect(primary(root)?.props.loading).toBe(true);
    expect(root.findByType(IconButton).props.disabled).toBe(true);
  });

  it('disables both triggers until the share URL is known', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isReady: false } });
    expect(primary(root)?.props.disabled).toBe(true);
    expect(root.findByType(IconButton).props.disabled).toBe(true);
  });

  it('disables Share while the kit is being made public', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, isMakingPublic: true } });
    expect(primary(root)?.props.disabled).toBe(true);
  });
});

describe('MediaKitCard — share errors', () => {
  it('prompts "Make public" when the kit is hidden', () => {
    const props = baseProps();
    const onMakePublic = props.share.onMakePublic;
    const root = render({ share: { ...props.share, error: 'private' } });
    const notice = root.findByType(Notice);
    expect(notice.props.title).toBe('account.mediaKit.share.privateTitle');
    expect(notice.props.action.label).toBe('account.mediaKit.share.makePublic');
    act(() => notice.props.action.onPress());
    expect(onMakePublic).toHaveBeenCalledTimes(1);
  });

  it('offers a retry for a failed share, and dismisses', () => {
    const props = baseProps();
    const { onRetry, onDismissError } = props.share;
    const root = render({ share: { ...props.share, error: 'failed', canRetry: true } });
    const notice = root.findByType(Notice);
    act(() => notice.props.action.onPress());
    act(() => notice.props.onDismiss());
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('has no retry when the failure cannot be replayed', () => {
    const props = baseProps();
    const root = render({ share: { ...props.share, error: 'rate_limited', canRetry: false } });
    const notice = root.findByType(Notice);
    expect(notice.props.message).toBe('account.mediaKit.share.rateLimited');
    expect(notice.props.action).toBeUndefined();
  });

  it('shows no notice when nothing went wrong', () => {
    expect(render().findAllByType(Notice)).toHaveLength(0);
  });
});

describe('MediaKitCard — preview', () => {
  it('offers Preview as a secondary action only when its screen is wired', () => {
    const none = render();
    expect(none.findAllByType(CustomButton)).toHaveLength(1);

    const onOpenPreview = jest.fn();
    const root = render({ onOpenPreview });
    const preview = root
      .findAllByType(CustomButton)
      .find(b => b.props.title === 'account.mediaKit.preview');
    expect(preview?.props.variant).toBe('secondary');
    act(() => preview?.props.onPress());
    expect(onOpenPreview).toHaveBeenCalledTimes(1);
  });
});

describe('MediaKitCard — states', () => {
  it('keeps its shape while the kit loads, with Share locked', () => {
    const root = render({ status: 'loading', link: undefined, isPublic: null });
    expect(root.findAll(n => isHost(n, 'Skeleton')).length).toBeGreaterThan(0);
    expect(primary(root)?.props.disabled).toBe(true);
    expect(root.findAllByType(IconButton)).toHaveLength(0);
  });

  it('shows a retryable error when the kit fails to load', () => {
    const onRetry = jest.fn();
    const root = render({ status: 'error', link: undefined, isPublic: null, onRetry });
    const notice = root.findByType(Notice);
    expect(notice.props.message).toBe('account.mediaKit.loadFailed');
    act(() => notice.props.action.onPress());
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
