type Replacement = { from: string; to: string };

let _testModeEnabled = false;
let _replacements: Replacement[] = [];

export function setTestConfig(
  isTestMode: boolean,
  pairs: Replacement[] = [],
): void {
  _testModeEnabled = isTestMode;
  _replacements = pairs;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyReplacements(text: string): string {
  if (!_testModeEnabled || _replacements.length === 0) return text;
  let result = text;
  for (const { from, to } of _replacements) {
    result = result.replace(new RegExp(escapeRegex(from), 'gi'), to);
  }
  return result;
}
