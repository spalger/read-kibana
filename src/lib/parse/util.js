import * as t from 'babel-types'
import { File as BabelCoreFile } from 'babel-core'

export function getAst(file, babelOptions = {}) {
  const bcFile = new BabelCoreFile({
    ...babelOptions,
    filename: file.path,
    filenameRelative: file.relative,
    comments: true,
    code: false,
    babelrc: false,
  })

  return bcFile.parse(file.contents)
}

export function findBindingForIdentifier(path) {
  const name = path.node.name
  for (let scope = path.scope; scope; scope = scope.parent) {
    if (name in scope.bindings) {
      return scope.bindings[name]
    }
  }
  return undefined
}

export function castToStructure(path) {
  if (t.isFunction(path.node)) {
    return { type: 'Function', path }
  }

  if (t.isIdentifier(path.node)) {
    const binding = findBindingForIdentifier(path)
    if (binding) {
      return castToStructure(binding.path)
    }
  }

  if (t.isClassExpression(path.node)) {
    return { type: 'Class', path }
  }

  return { type: 'Unknown', path }
}

