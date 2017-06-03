export function extractExportsFromExportSpecifiers(path) {
  return path.node.specifiers.map((_, i) => {
    const specifier = path.get(`specifiers.${i}`)
    return {
      name: specifier.node.exported.name,
      value: {
        type: 'ExportSpecifier',
        path: specifier,
      },
    }
  })
}
