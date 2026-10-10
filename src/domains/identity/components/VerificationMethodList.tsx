import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ListGroup, ListRow, StatusPill } from '@/shared/ui';
import {
  VERIFICATION_METHODS,
  VERIFICATION_METHOD_DEF,
  VERIFICATION_SECTION_TITLE,
  type VerificationMethod,
  type VerificationMethodSection,
} from '../constants/verificationMethods';

/**
 * `grouped`: settings picker, documents / no-documents sections, full description + how it's checked.
 * `compact`: one card with a short line per method (onboarding step, picker under an active attempt).
 */
export type VerificationMethodListVariant = 'grouped' | 'compact';

export interface VerificationMethodListProps {
  variant: VerificationMethodListVariant;
  onSelect: (method: VerificationMethod) => void;
  /** `compact` only: section title above the card ("Or pick another way"). */
  title?: string;
  /** Replaces a method's line, e.g. social while a code is pending ("A new code replaces the current one"). */
  hints?: Partial<Record<VerificationMethod, string>>;
}

const SECTIONS: readonly VerificationMethodSection[] = ['documents', 'noDocuments'];

interface MethodRowProps {
  method: VerificationMethod;
  detailed: boolean;
  hint?: string;
  onSelect: (method: VerificationMethod) => void;
}

const MethodRow = memo<MethodRowProps>(({ method, detailed, hint, onSelect }) => {
  const { t } = useTranslation();
  const def = VERIFICATION_METHOD_DEF[method];
  const handlePress = useCallback(() => onSelect(method), [onSelect, method]);

  return (
    <ListRow
      icon={def.icon}
      iconTone={def.tone}
      title={t(def.titleKey)}
      subtitle={hint ?? t(detailed ? def.descriptionKey : def.shortKey)}
      meta={
        detailed ? (
          <StatusPill tone={def.meta.tone} size="sm" icon={def.meta.icon} label={t(def.meta.labelKey)} />
        ) : undefined
      }
      onPress={handlePress}
    />
  );
});

/** The four verification methods, shared by the settings picker and the onboarding KYC step. */
const VerificationMethodListComponent: React.FC<VerificationMethodListProps> = ({
  variant,
  onSelect,
  title,
  hints,
}) => {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <ListGroup title={title}>
        {VERIFICATION_METHODS.map(method => (
          <MethodRow key={method} method={method} detailed={false} hint={hints?.[method]} onSelect={onSelect} />
        ))}
      </ListGroup>
    );
  }

  return (
    <Box gap="2xl">
      {SECTIONS.map(section => (
        <ListGroup key={section} title={t(VERIFICATION_SECTION_TITLE[section])}>
          {VERIFICATION_METHODS.filter(method => VERIFICATION_METHOD_DEF[method].section === section).map(
            method => (
              <MethodRow key={method} method={method} detailed hint={hints?.[method]} onSelect={onSelect} />
            ),
          )}
        </ListGroup>
      ))}
    </Box>
  );
};

export const VerificationMethodList = memo(VerificationMethodListComponent);
