/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import {
  SHOWCASE_CATEGORY_ORDER,
  SHOWCASE_CATEGORIES,
  SHOWCASE_ENTRIES,
  SHOWCASE_EXEMPT,
} from '../showcaseRegistry';

const UI_DIR = path.resolve(__dirname, '../../../../../shared/ui');
const DOMAINS_DIR = path.resolve(__dirname, '../../../../../domains');
const barrel = fs.readFileSync(path.join(UI_DIR, 'index.ts'), 'utf8');

/** Value exports only: `export type { … }` is skipped because `type` sits between `export` and `{`. */
const valueExports = [
  ...barrel.matchAll(/export\s*\{([^}]*)\}\s*from/g),
].flatMap(match =>
  (match[1] ?? '')
    .split(',')
    .map(
      name =>
        name
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim() ?? '',
    )
    .filter(Boolean),
);

/** Components a domain exports from its `components/` folder via its public `index.ts`. */
const domainComponents = fs
  .readdirSync(DOMAINS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(DOMAINS_DIR, dirent.name, 'index.ts'))
  .filter(file => fs.existsSync(file))
  .flatMap(file => [
    ...fs.readFileSync(file, 'utf8').matchAll(/export\s*\{([^}]*)\}\s*from\s*'\.\/components'/g),
  ])
  .flatMap(match =>
    (match[1] ?? '')
      .split(',')
      .map(name => name.trim())
      .filter(Boolean),
  );

const barrelSources = new Set(
  [...barrel.matchAll(/from\s+'\.\/([^/']+)/g)].map(match => match[1]),
);

const covered = new Set<string>(
  Object.values(SHOWCASE_ENTRIES).flatMap(entry => entry.covers),
);
const exempt = new Set<string>(Object.keys(SHOWCASE_EXEMPT));
const domainCovered = new Set<string>(
  Object.values(SHOWCASE_ENTRIES).flatMap(entry =>
    'domainCovers' in entry ? entry.domainCovers : [],
  ),
);

describe('showcase registry', () => {
  it('parses the kit barrel', () => {
    expect(valueExports.length).toBeGreaterThan(20);
  });

  it('every @/shared/ui export has a showcase demo (or a documented exemption)', () => {
    const missing = valueExports.filter(
      name => !covered.has(name) && !exempt.has(name),
    );
    expect(missing).toEqual([]);
  });

  it('every public domain component has a showcase demo', () => {
    expect(domainComponents.length).toBeGreaterThan(0);
    expect(domainComponents.filter(name => !domainCovered.has(name))).toEqual([]);
  });

  it('exemptions point at real exports and never at a demoed one', () => {
    const exports = new Set(valueExports);
    expect([...exempt].filter(name => !exports.has(name))).toEqual([]);
    expect([...exempt].filter(name => covered.has(name))).toEqual([]);
  });

  it('every kit folder is re-exported from the barrel', () => {
    const folders = fs
      .readdirSync(UI_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('__'))
      .map(dirent => dirent.name);
    expect(folders.filter(folder => !barrelSources.has(folder))).toEqual([]);
  });

  it('every category is listed once and has at least one entry', () => {
    expect([...SHOWCASE_CATEGORY_ORDER].sort()).toEqual(
      Object.keys(SHOWCASE_CATEGORIES).sort(),
    );
    const used = new Set(
      Object.values(SHOWCASE_ENTRIES).map(entry => entry.category),
    );
    expect(
      SHOWCASE_CATEGORY_ORDER.filter(category => !used.has(category)),
    ).toEqual([]);
  });
});
