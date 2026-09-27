import React, { Children, Fragment, isValidElement, memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Divider } from '../Divider';
import { SectionHeader } from '../SectionHeader';
import type { SectionHeaderAction } from '../SectionHeader';

export interface ListGroupProps {
  children: React.ReactNode;
  title?: string;
  action?: SectionHeaderAction;
  /** Caption under the group (what a setting does). */
  footer?: string;
  /** `danger` outlines the group in red (delete account). */
  tone?: 'default' | 'danger';
}

/** Flat bordered card of `ListRow`s with dividers between them (rule 08: flat + 1px border). */
const ListGroupComponent: React.FC<ListGroupProps> = ({
  children,
  title,
  action,
  footer,
  tone = 'default',
}) => {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <Box gap="sm">
      {title ? <SectionHeader title={title} action={action} /> : null}
      <Box
        bg={colors.surface.main}
        borderRadius="lg"
        borderWidth="thin"
        borderColor={tone === 'danger' ? colors.status.danger.main : colors.border.default}
        overflow="hidden"
      >
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 ? <Divider inset="lg" /> : null}
            {row}
          </Fragment>
        ))}
      </Box>
      {footer ? (
        <Text variant="caption" color={colors.text.tertiary} px="xs">
          {footer}
        </Text>
      ) : null}
    </Box>
  );
};

export const ListGroup = memo(ListGroupComponent);
