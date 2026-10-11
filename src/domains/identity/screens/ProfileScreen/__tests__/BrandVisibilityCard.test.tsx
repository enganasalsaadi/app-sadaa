import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { BrandVisibilityModel } from '../../../hooks/useBrandVisibility';
import { BrandVisibilityCard } from '../components/BrandVisibilityCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
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
  const { createElement } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode; trailing?: React.ReactNode }) =>
      createElement(host, props, children, props.trailing);
    Component.displayName = host;
    return Component;
  };
  return {
    ListGroup: stub('ListGroup'),
    ListRow: stub('ListRow'),
    Notice: stub('Notice'),
    Switch: stub('Switch'),
  };
});

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const model = (overrides: Partial<BrandVisibilityModel> = {}): BrandVisibilityModel => ({
  visible: true,
  isLoading: false,
  isError: false,
  isSaving: false,
  onToggle: jest.fn(),
  retry: jest.fn(),
  ...overrides,
});

const render = (m: BrandVisibilityModel) => {
  let renderer: ReturnType<typeof create> | undefined;
  act(() => {
    renderer = create(<BrandVisibilityCard model={m} />);
  });
  if (!renderer) throw new Error('not rendered');
  return renderer.root;
};

describe('BrandVisibilityCard', () => {
  it('shows the switch on the saved value and forwards a toggle', () => {
    const m = model({ visible: false });
    const root = render(m);
    const sw = root.find(isHost('Switch'));
    expect(sw.props.value).toBe(false);
    act(() => sw.props.onValueChange(true));
    expect(m.onToggle).toHaveBeenCalledWith(true);
  });

  it('locks the switch while a save is in flight', () => {
    const root = render(model({ isSaving: true }));
    expect(root.find(isHost('Switch')).props.disabled).toBe(true);
  });

  it('shows no switch until the value is known', () => {
    const root = render(model({ visible: null, isLoading: true }));
    expect(root.findAll(isHost('Switch'))).toHaveLength(0);
    expect(root.find(isHost('ListRow')).props.loading).toBe(true);
  });

  it('offers a retry when the setting could not load', () => {
    const m = model({ visible: null, isError: true });
    const root = render(m);
    expect(root.findAll(isHost('Switch'))).toHaveLength(0);
    act(() => root.find(isHost('Notice')).props.action.onPress());
    expect(m.retry).toHaveBeenCalled();
  });
});
