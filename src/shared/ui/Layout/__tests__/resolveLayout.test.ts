import { LAYOUT_DEFAULT_PADDING, resolveLayout } from '../resolveLayout';

const base = {
  mode: 'scroll',
  hasHeader: false,
  headerIsConfig: false,
  headerVariant: undefined,
  headerBehavior: undefined,
  hasHero: false,
  hasSticky: false,
  hasFooter: false,
  inHeroSheet: false,
  padding: undefined,
  keyboard: undefined,
  surface: undefined,
  statusBar: 'auto',
} as const;

const withHeader = { ...base, hasHeader: true, headerIsConfig: true } as const;

describe('resolveLayout', () => {
  describe('edges', () => {
    it('plain scroll screen owns the top inset; bottom is cleared by content padding', () => {
      expect(resolveLayout(base).edges).toEqual(['left', 'right', 'top']);
    });

    it('header owns the top inset', () => {
      expect(resolveLayout(withHeader).edges).toEqual(['left', 'right']);
    });

    it('hero sheet owns the top inset', () => {
      expect(resolveLayout({ ...base, inHeroSheet: true }).edges).toEqual(['left', 'right']);
    });

    it('a hero runs under the status bar', () => {
      expect(resolveLayout({ ...base, hasHero: true }).edges).toEqual(['left', 'right']);
    });

    it('static screen without footer owns the bottom inset', () => {
      expect(resolveLayout({ ...base, mode: 'static' }).edges).toEqual([
        'left',
        'right',
        'top',
        'bottom',
      ]);
    });

    it('footer owns the bottom inset on static screens', () => {
      expect(resolveLayout({ ...base, mode: 'static', hasFooter: true }).edges).toEqual([
        'left',
        'right',
        'top',
      ]);
    });

    it('static mode ignores the hero', () => {
      expect(resolveLayout({ ...base, mode: 'static', hasHero: true }).edges).toContain('top');
    });
  });

  describe('padding', () => {
    it('defaults both axes', () => {
      const r = resolveLayout(base);
      expect([r.paddingX, r.paddingY]).toEqual([LAYOUT_DEFAULT_PADDING.x, LAYOUT_DEFAULT_PADDING.y]);
    });

    it('overrides one axis and keeps the other default', () => {
      const r = resolveLayout({ ...base, padding: { y: '3xl' } });
      expect([r.paddingX, r.paddingY]).toEqual([LAYOUT_DEFAULT_PADDING.x, '3xl']);
    });

    it("'none' removes both axes", () => {
      const r = resolveLayout({ ...base, padding: 'none' });
      expect([r.paddingX, r.paddingY]).toEqual([undefined, undefined]);
    });
  });

  describe('keyboard', () => {
    it('scroll avoids by default, static does not', () => {
      expect(resolveLayout(base).keyboard).toBe('avoid');
      expect(resolveLayout({ ...base, mode: 'static' }).keyboard).toBe('none');
    });

    it('explicit value wins', () => {
      expect(resolveLayout({ ...base, keyboard: 'none' }).keyboard).toBe('none');
      expect(resolveLayout({ ...base, mode: 'static', keyboard: 'avoid' }).keyboard).toBe('avoid');
    });
  });

  describe('surface', () => {
    it('base by default, surface inside a hero sheet, explicit wins', () => {
      expect(resolveLayout(base).surface).toBe('base');
      expect(resolveLayout({ ...base, inHeroSheet: true }).surface).toBe('surface');
      expect(resolveLayout({ ...base, inHeroSheet: true, surface: 'transparent' }).surface).toBe(
        'transparent',
      );
    });
  });

  describe('header behaviour', () => {
    it('fixed by default, overlay over a hero', () => {
      expect(resolveLayout(withHeader).headerBehavior).toBe('fixed');
      expect(resolveLayout({ ...withHeader, hasHero: true }).headerBehavior).toBe('overlay');
    });

    it('explicit behaviour wins in scroll mode', () => {
      expect(resolveLayout({ ...withHeader, headerBehavior: 'collapse' }).headerBehavior).toBe(
        'collapse',
      );
    });

    it('static mode and element headers are always fixed', () => {
      expect(
        resolveLayout({ ...withHeader, mode: 'static', headerBehavior: 'hideOnScroll' })
          .headerBehavior,
      ).toBe('fixed');
      expect(
        resolveLayout({ ...withHeader, headerIsConfig: false, headerBehavior: 'hideOnScroll' })
          .headerBehavior,
      ).toBe('fixed');
    });

    it('only hideOnScroll and overlay float over the body', () => {
      expect(resolveLayout({ ...withHeader, headerBehavior: 'hideOnScroll' }).headerFloats).toBe(
        true,
      );
      expect(resolveLayout({ ...withHeader, hasHero: true }).headerFloats).toBe(true);
      expect(resolveLayout({ ...withHeader, headerBehavior: 'collapse' }).headerFloats).toBe(false);
    });

    it('overlay headers default to transparent, others to solid; explicit variant wins', () => {
      expect(resolveLayout({ ...withHeader, hasHero: true }).headerVariant).toBe('transparent');
      expect(resolveLayout(withHeader).headerVariant).toBe('solid');
      expect(
        resolveLayout({ ...withHeader, hasHero: true, headerVariant: 'brand' }).headerVariant,
      ).toBe('brand');
    });
  });

  describe('sticky', () => {
    it('sticks under a fixed header, not under a floating one, never in static mode', () => {
      expect(resolveLayout({ ...withHeader, hasSticky: true }).sticky).toBe(true);
      expect(
        resolveLayout({ ...withHeader, hasSticky: true, headerBehavior: 'hideOnScroll' }).sticky,
      ).toBe(false);
      expect(resolveLayout({ ...withHeader, hasSticky: true, mode: 'static' }).sticky).toBe(false);
    });
  });

  describe('status bar', () => {
    it('follows the theme by default and the header variant when there is one', () => {
      expect(resolveLayout(base).statusBar).toBe('auto');
      expect(resolveLayout({ ...withHeader, headerVariant: 'brand' }).statusBar).toBe('light');
      expect(resolveLayout({ ...withHeader, hasHero: true }).statusBar).toBe('light');
    });

    it('light over a header-less hero; explicit value wins', () => {
      expect(resolveLayout({ ...base, hasHero: true }).statusBar).toBe('light');
      expect(resolveLayout({ ...base, hasHero: true, statusBar: 'dark' }).statusBar).toBe('dark');
    });
  });
});
