/** What waits on the user first, the server's order kept inside each half. */
export const needsFirst = <T>(items: readonly T[], needs: (item: T) => boolean): T[] => [
  ...items.filter(needs),
  ...items.filter(item => !needs(item)),
];
