const toParts = (version: string): number[] =>
  version
    .trim()
    .replace(/^v/i, '')
    // Pre-release/build suffixes ("1.2.0-beta", "1.2.0+45") compare as their base version.
    .split(/[-+]/)[0]
    ?.split('.')
    .map(part => {
      const n = Number.parseInt(part, 10);
      return Number.isNaN(n) ? 0 : n;
    }) ?? [];

/** Semver-style numeric compare: -1 if a < b, 0 if equal, 1 if a > b. Missing parts count as 0 ("1.2" = "1.2.0"). */
export const compareVersions = (a: string, b: string): -1 | 0 | 1 => {
  const pa = toParts(a);
  const pb = toParts(b);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i += 1) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
};
