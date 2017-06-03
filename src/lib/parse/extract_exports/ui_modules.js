import * as t from 'babel-types'

function getBlockContaining(path) {
  if (
    path.parentPath &&
    !t.isProgram(path.parentPath) &&
    !t.isBlockStatement(path.parentPath)
  ) {
    return getBlockContaining(path.parentPath)
  }

  return path.parentPath || path
}

function isUiModulesGetCall(uiModulesName, path) {
  return (
    t.isCallExpression(path) &&
    t.isMemberExpression(path.node.callee) &&
    t.isIdentifier(path.node.callee.object, { name: uiModulesName }) &&
    t.isIdentifier(path.node.callee.property, { name: 'get' }) &&
    path.node.arguments.length > 0 &&
    path.node.arguments.length <= 2 &&
    t.isStringLiteral(path.node.arguments[0])
  )
}

function moduleCallToStructure(moduleName, call) {
  return {
    name: call.node.arguments[0].value,
    value: {
      type: call.node.callee.property.name,
      path: call,
      angularModule: moduleName,
    },
  }
}

function unwrapAssignmentCalls(moduleName, path) {
  if (!t.isVariableDeclarator(path.parentPath.node)) {
    return []
  }

  const id = path.parentPath.get('id')
  const exports = []

  getBlockContaining(id.parentPath).traverse({
    CallExpression(call) {
      if (
        t.isMemberExpression(call.node.callee) &&
        t.isIdentifier(call.node.callee.object) &&
        t.isIdentifier(call.node.callee.property) &&
        call.node.callee.object.name === id.node.name &&
        call.node.arguments.length === 2
      ) {
        exports.push(
          moduleCallToStructure(moduleName, call),
          ...extractExportsFromUiModule(moduleName, call),
        )
      }
    },
  })

  return exports
}

function unwrapMemberCall(moduleName, path) {
  // module.service() breaks into two tokens, a "MemberExpression" for `module.service`
  // and a "CallExpression" for the argument list
  if (
    !t.isMemberExpression(path.parentPath) ||
    !t.isCallExpression(path.parentPath.parentPath)
  ) {
    return []
  }

  const call = path.parentPath.parentPath
  if (
    t.isIdentifier(call.node.callee.property) &&
    call.node.arguments.length === 2 &&
    t.isStringLiteral(call.node.arguments[0]) &&
    t.isFunction(call.node.arguments[1])
  ) {
    return [
      moduleCallToStructure(moduleName, call),
      ...extractExportsFromUiModule(moduleName, call),
    ]
  }

  return []
}


function extractExportsFromUiModule(moduleName, path) {
  return [
    ...unwrapMemberCall(moduleName, path),
    ...unwrapAssignmentCalls(moduleName, path),
  ]
}

function extractExportsDefinedWith(id) {
  const exports = []

  getBlockContaining(id).traverse({
    CallExpression(call) {
      if (!isUiModulesGetCall(id.node.name, call)) {
        return
      }

      const moduleName = call.node.arguments[0].value
      exports.push(...extractExportsFromUiModule(moduleName, call))
    },
  })

  return exports
}

export function extractExportsFromUiModules(path) {
  // import { uiModules } from 'ui/modules'
  if (t.isImportDeclaration(path.node)) {
    const specifierI = path.node.specifiers.findIndex(s => s.imported.name === 'uiModules')
    return extractExportsDefinedWith(path.get(`specifiers.${specifierI}.local`))
  }

  // const uiModules = require('ui/modules')
  if (t.isVariableDeclarator(path.parentPath.node)) {
    return extractExportsDefinedWith(path.parentPath.get('id'))
  }

  // require('ui/modules').get('ui/module')
  if (
    t.isMemberExpression(path.parentPath.node) &&
    t.isCallExpression(path.parentPath.parentPath) &&
    t.isIdentifier(path.parentPath.parentPath.node.callee.property, { name: 'get' }) &&
    path.parentPath.parentPath.node.arguments.length > 0 &&
    path.parentPath.parentPath.node.arguments.length <= 2 &&
    t.isStringLiteral(path.parentPath.parentPath.node.arguments[0])
  ) {
    return extractExportsFromUiModule(path.parentPath)
  }

  return []
}
