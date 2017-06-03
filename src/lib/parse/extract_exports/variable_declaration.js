import { castToStructure } from '../util'

export function extractExportsFromVariableDeclaration(path) {
  return path.node.declarations.map((_, i) => {
    const declaration = path.get(`declarations.${i}`)
    return {
      name: declaration.node.id.name,
      value: castToStructure(declaration.get('init')),
    }
  })
}
