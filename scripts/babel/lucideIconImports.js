/**
 * Metro has no tree-shaking, so `import { X } from 'lucide-react-native'` ships all ~1900 icons
 * (~1.9MB JS). Rewrite each icon to its own module (`lucide-react-native/icons/<file>`, in the
 * package's exports map). Non-icon names (Icon, createLucideIcon, types) stay on the barrel.
 */
const fs = require('fs');
const path = require('path');

const PACKAGE = 'lucide-react-native';
// `require` condition resolves dist/cjs/lucide-react-native.js; the esm barrel sits beside it.
const BARREL = path.resolve(
  path.dirname(require.resolve(PACKAGE)),
  '..',
  'esm',
  'lucide-react-native.mjs',
);

function loadIconFiles() {
  const files = new Map();
  const exportLine = /export \{([^}]+)\} from '\.\/icons\/([^']+)\.mjs';/g;
  const source = fs.readFileSync(BARREL, 'utf8');
  for (const [, names, file] of source.matchAll(exportLine)) {
    for (const name of names.matchAll(/default as (\w+)/g)) {
      files.set(name[1], file);
    }
  }
  return files;
}

module.exports = function lucideIconImports({ types: t }) {
  const iconFiles = loadIconFiles();

  return {
    name: 'lucide-icon-imports',
    visitor: {
      ImportDeclaration(declaration) {
        const { node } = declaration;
        if (node.source.value !== PACKAGE || node.importKind === 'type') {
          return;
        }
        const perIcon = [];
        const rest = node.specifiers.filter(specifier => {
          if (!t.isImportSpecifier(specifier) || specifier.importKind === 'type') {
            return true;
          }
          const imported = t.isIdentifier(specifier.imported)
            ? specifier.imported.name
            : specifier.imported.value;
          const file = iconFiles.get(imported);
          if (!file) {
            return true;
          }
          perIcon.push(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(specifier.local.name))],
              t.stringLiteral(`${PACKAGE}/icons/${file}`),
            ),
          );
          return false;
        });
        if (perIcon.length === 0) {
          return;
        }
        if (rest.length === 0) {
          declaration.replaceWithMultiple(perIcon);
        } else {
          node.specifiers = rest;
          declaration.insertAfter(perIcon);
        }
      },
    },
  };
};
