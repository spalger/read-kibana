import * as t from 'babel-types'

import { castToStructure } from '../util'

export function extractExportsFromModuleExports(path) {
  if (t.isObjectExpression(path.node)) {
    return path.node.properties
      .map((_, i) => {
        const prop = path.get(`properties.${i}`)

        if (prop.node.computed) {
          // computed properties not supported
          return undefined
        }

        if (t.isSpreadProperty(prop.node)) {
          // spread properties not supported
          return undefined
        }

        if (prop.node.key.name.startsWith('_')) {
          // ignore "private" exports
          return undefined
        }

        return castToStructure(prop.get('value'))
      })
      .filter(Boolean)
  }

  const value = castToStructure(path)
  if (value) {
    return [{ name: 'default', value }]
  }

  return []
}
