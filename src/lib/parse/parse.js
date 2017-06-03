import traverse from 'babel-traverse'
import * as t from 'babel-types'

import {
  getAst,
  castToStructure,
  findBindingForIdentifier,
} from './util'

import {
  extractExportsFromUiModules,
  extractExportsFromModuleExports,
  extractExportsFromExportSpecifiers,
  extractExportsFromVariableDeclaration,
} from './extract_exports'

function isModuleExportsAssignment(path) {
  return (
    t.isMemberExpression(path.node.left) &&
    t.isIdentifier(path.node.left.object, { name: 'module' }) &&
    t.isIdentifier(path.node.left.property, { name: 'exports' })
  )
}

function isCommonStaticJsRequire(path) {
  return (
    t.isIdentifier(path.node.callee) &&
    path.node.callee.name === 'require' &&
    !findBindingForIdentifier(path.node.callee) &&
    path.node.arguments.length === 1 &&
    t.isStringLiteral(path.node.arguments[0])
  )
}

function isExportAssignment(path) {
  return (
    t.isMemberExpression(path.node.left) &&
    t.isIdentifier(path.node.left.property) &&
    (
      // exports.name = value
      t.isIdentifier(path.node.left.object, { name: 'exports' }) ||
      // module.exports.name = value
      (
        t.isMemberExpression(path.node.left.object) &&
        t.isIdentifier(path.node.left.object.object, { name: 'module' }) &&
        t.isIdentifier(path.node.left.object.property, { name: 'exports' })
      )
    )
  )
}

function lookForExports(ast) {
  const exports = []

  // look for module.exports
  traverse(ast, {
    AssignmentExpression(path) {
      if (isModuleExportsAssignment(path)) {
        exports.push(...extractExportsFromModuleExports(path.get('right')))
        return
      }

      if (isExportAssignment(path)) {
        exports.push({
          name: path.node.left.property.name,
          value: castToStructure(path.get('right')),
        })
      }
    },

    CallExpression(path) {
      if (isCommonStaticJsRequire(path) && path.node.arguments[0].value === 'ui/modules') {
        exports.push(...extractExportsFromUiModules(path))
      }
    },

    ExportNamedDeclaration(path) {
      if (path.node.declaration == null) {
        exports.push(...extractExportsFromExportSpecifiers(path))
        return
      }

      const declaration = path.get('declaration')
      if (t.isVariableDeclaration(declaration.node)) {
        exports.push(...extractExportsFromVariableDeclaration(declaration))
        return
      }

      if (
        t.isFunctionDeclaration(declaration.node) ||
        t.isClassDeclaration(declaration.node)
      ) {
        exports.push({
          name: declaration.node.id.name,
          value: castToStructure(declaration),
        })
      }
    },

    ExportDefaultDeclaration(path) {
      exports.push({
        name: null,
        value: castToStructure(path.get('declaration')),
      })
    },

    ImportDeclaration(path) {
      if (path.node.source.value === 'ui/modules') {
        exports.push(...extractExportsFromUiModules(path))
      }
    },
  })

  return exports
}

export function parse(file, babelOptions) {
  return lookForExports(getAst(file, babelOptions))
}
