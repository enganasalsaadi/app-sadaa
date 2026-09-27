import { buildBoxStyle, splitBoxStyleProps } from '../boxStyle';

const theme = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  radii: { none: 0, sm: 4, md: 8, lg: 12, full: 9999 },
  shadows: {
    none: { elevation: 0 },
    sm: { elevation: 2 },
    md: { elevation: 4 },
  },
  borderWidths: { none: 0, thin: 1 },
  zIndices: { base: 0, modal: 50 },
} as unknown as Parameters<typeof buildBoxStyle>[1];

describe('buildBoxStyle', () => {
  it('returns an empty style when no props are set', () => {
    expect(buildBoxStyle({}, theme)).toEqual({});
  });

  it('resolves tokens to theme values', () => {
    expect(
      buildBoxStyle(
        {
          p: 'md',
          ms: 'sm',
          gap: 'xs',
          bg: 'surface',
          borderRadius: 'lg',
          borderWidth: 'thin',
          row: true,
          flex: 1,
          width: '50%',
          opacity: 0.5,
          zIndex: 'modal',
          shadow: 'sm',
        },
        theme,
      ),
    ).toEqual({
      padding: 12,
      marginStart: 8,
      gap: 4,
      backgroundColor: 'surface',
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      flex: 1,
      width: '50%',
      opacity: 0.5,
      zIndex: 50,
      elevation: 2,
    });
  });

  it('lets reverseRow win over row', () => {
    expect(buildBoxStyle({ row: true, reverseRow: true }, theme)).toEqual({
      flexDirection: 'row-reverse',
    });
  });
});

describe('splitBoxStyleProps', () => {
  it('separates layout props from pass-through props', () => {
    const { styleProps, rest } = splitBoxStyleProps({
      p: 'md' as const,
      testID: 'box',
    });
    expect(styleProps.p).toBe('md');
    expect(rest).toEqual({ testID: 'box' });
  });
});
