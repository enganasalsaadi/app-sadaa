/**
 * Architecture + design-system guardrails. See `.claude/rules/*.md`.
 * Layering: app → domains → shared → core (never upward).
 */

const PHYSICAL_DIRECTION_KEYS =
  '/^(margin|padding|border)(Left|Right)(Width|Color)?$|^(left|right)$|^border(Top|Bottom)?(Left|Right)Radius$/';

const DOMAIN_DEEP_IMPORT = {
  group: ['@/domains/*/*', '@/domains/*/**'],
  message:
    'Import other domains only via their public API: `@/domains/<name>`. Inside a domain use relative imports.',
};

const RN_RAW_UI = {
  name: 'react-native',
  importNames: [
    'View',
    'Text',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'Pressable',
    'Image',
  ],
  message:
    'Use the UI kit from `@/shared/ui` (Box, Text, Pressable, Card, Image, CustomButton).',
};

module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: `Property[key.name=${PHYSICAL_DIRECTION_KEYS}]`,
        message:
          'RTL: use Start/End (marginStart, paddingEnd, start, end, borderTopStartRadius…) instead of Left/Right.',
      },
      {
        selector: `JSXAttribute[name.name=${PHYSICAL_DIRECTION_KEYS}]`,
        message: 'RTL: use Start/End props instead of Left/Right.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          DOMAIN_DEEP_IMPORT,
          {
            group: ['../../../*'],
            message: 'Too deep — use the `@/` alias.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Type-aware rule; JS files use the babel parser.
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
      },
    },
    {
      // Feature code: UI kit only, no raw RN primitives.
      files: ['src/domains/**/*.{ts,tsx}', 'src/app/screens/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: [RN_RAW_UI], patterns: [DOMAIN_DEEP_IMPORT] },
        ],
      },
    },
    {
      // shared/ may only depend on core/.
      files: ['src/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/domains', '@/domains/*', '@/app', '@/app/*'],
                message: 'shared/ must not import domains/ or app/.',
              },
            ],
          },
        ],
      },
    },
    {
      // core/ is the bottom layer. Type-only access to RootState is the one exception.
      files: ['src/core/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/domains', '@/domains/*', '@/shared', '@/shared/*'],
                message: 'core/ must not import shared/ or domains/.',
              },
              {
                group: ['@/app', '@/app/*'],
                allowTypeImports: true,
                message: 'core/ may only import types (RootState) from app/.',
              },
            ],
          },
        ],
      },
    },
    {
      // Token definitions are the only place raw values may live.
      files: ['src/core/theme/tokens/**'],
      rules: { 'react-native/no-color-literals': 'off' },
    },
  ],
};
