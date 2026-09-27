import type { ParseKeys } from 'i18next';

/** One step of a WizardShell flow. */
export interface WizardStepDef {
  /** 1-based position shown in the header ("2 of 4"). */
  index: number;
  titleKey: ParseKeys;
  subtitleKey: ParseKeys;
}
