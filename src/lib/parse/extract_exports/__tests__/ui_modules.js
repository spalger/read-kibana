import traverse from 'babel-traverse'
import * as t from 'babel-types'
import expect from 'expect.js'

import { getAst } from '../../util'

import { extractExportsFromUiModules } from '../ui_modules'

function noPath(exports) {
  return exports.map(exp => {
    if (exp.value && exp.value.path) {
      return {
        ...exp,
        value: {
          ...exp.value,
          path: typeof exp,
        },
      }
    }

    return exp
  })
}

describe('extractExportsFromUiModules()', () => {
  describe('with import', () => {
    it('extracts exports from direct method call', () => {
      const ast = getAst({
        contents: `
          import { uiModules } from 'ui/modules';
          
          uiModules
            .get('@module')
            .service('@service', () => {
              
            });
        `,
      })

      let importPath
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value === 'ui/modules') {
            importPath = path
          }
        },
      })

      expect(noPath(extractExportsFromUiModules(importPath))).to.eql([
        {
          name: '@service',
          value: {
            type: 'service',
            path: 'object',
            angularModule: '@module',
          },
        },
      ])
    })

    it('extracts multiple exports from direct method calls', () => {
      const ast = getAst({
        contents: `
          import { uiModules } from 'ui/modules';
          
          uiModules
            .get('@module')
            .service('@service1', () => {
              
            })
            .service('@service2', function () {
              
            });
        `,
      })

      let importPath
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value === 'ui/modules') {
            importPath = path
          }
        },
      })

      expect(noPath(extractExportsFromUiModules(importPath))).to.eql([
        {
          name: '@service1',
          value: {
            type: 'service',
            path: 'object',
            angularModule: '@module',
          },
        },
        {
          name: '@service2',
          value: {
            type: 'service',
            path: 'object',
            angularModule: '@module',
          },
        },
      ])
    })

    it('extracts exports after assign', () => {
      const ast = getAst({
        contents: `
          import { uiModules } from 'ui/modules';
          
          const myModule = uiModules.get('myModule')
          
          myModule.service('@service', () => {
            
          });
        `,
      })

      let importPath
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value === 'ui/modules') {
            importPath = path
          }
        },
      })

      expect(noPath(extractExportsFromUiModules(importPath))).to.eql([
        {
          name: '@service',
          value: {
            type: 'service',
            path: 'object',
            angularModule: 'myModule',
          },
        },
      ])
    })

    it('extracts exports combining assignment and direct access', () => {
      const ast = getAst({
        contents: `
          import { uiModules } from 'ui/modules';
          
          const myModule = uiModules.get('myModule')
            .service('@immediate', () => {})
          
          myModule.service('@assigned', () => {
            
          });
        `,
      })

      let importPath
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value === 'ui/modules') {
            importPath = path
          }
        },
      })

      expect(noPath(extractExportsFromUiModules(importPath))).to.eql([
        {
          name: '@immediate',
          value: {
            type: 'service',
            path: 'object',
            angularModule: 'myModule',
          },
        },
        {
          name: '@assigned',
          value: {
            type: 'service',
            path: 'object',
            angularModule: 'myModule',
          },
        },
      ])
    })
  })

  describe('with commonjs', () => {
    it('extracts exports from commonjs', () => {
      const ast = getAst({
        contents: `
          require('ui/modules')
            .service('@immediate', () => {})
        `,
      })

      let requirePath
      traverse(ast, {
        CallExpression(path) {
          if (t.isIdentifier(path.node.callee)) {
            requirePath = path
          }
        },
      })

      debugger
      expect(noPath(extractExportsFromUiModules(requirePath))).to.eql([
        {
          name: '@immediate',
          value: {
            type: 'service',
            path: 'object',
            angularModule: 'myModule',
          },
        },
        {
          name: '@assigned',
          value: {
            type: 'service',
            path: 'object',
            angularModule: 'myModule',
          },
        },
      ])
    })
  })
})
