import {
  createExtensionGetter,
  getAngularExtension,
  getESLintExtension,
  getLessExtension,
  getReactExtension,
  getReduxExtension,
  getSassExtension,
  getScssExtension,
  getTypeScriptExtension,
} from './Getters'
import { allExtensions } from './allExtensions'
import { AngularExtension } from './AngularExtension/AngularExtension'
import { LessExtension } from './cssPreprocessors/LessExtension'
import { SassExtension } from './cssPreprocessors/SassExtension'
import { ScssExtension } from './cssPreprocessors/ScssExtension'
import { ESLintExtension } from './ESLintExtension'
import { ReactExtension } from './ReactExtension/ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension/TypeScriptExtension'
import { ReduxExtension } from './ReduxExtension'
import { setIndexes } from '../core/TestingUtils'
import { generateMockExtension } from './MockExtension'

const getters = [
  [getTypeScriptExtension, TypeScriptExtension, 'TypeScriptExtension'],
  [getReactExtension, ReactExtension, 'ReactExtension'],
  [getAngularExtension, AngularExtension, 'AngularExtension'],
  [getScssExtension, ScssExtension, 'ScssExtension'],
  [getSassExtension, SassExtension, 'SassExtension'],
  [getLessExtension, LessExtension, 'LessExtension'],
  [getESLintExtension, ESLintExtension, 'ESLintExtension'],
  [getReduxExtension, ReduxExtension, 'ReduxExtension'],
] as const

it('should have one getter per extension', () => {
  expect(getters.length).toBe(allExtensions.length)
})

it('should use an O(n) fallback if the index is incorrect', () => {
  const extensions = setIndexes([
    generateMockExtension({ name: 'extension 0' }),
    generateMockExtension({ name: 'extension 1' }),
    generateMockExtension({ name: 'extension 2' }),
    generateMockExtension({ name: 'extension 3' }),
  ])

  const actualIndex = 3
  const expectedExtension = extensions[actualIndex]
  expectedExtension.index = 5
  const getter = createExtensionGetter(expectedExtension.name, actualIndex)

  expect(getter(extensions)).toBe(expectedExtension)
})

getters.forEach(([getter, extension, extensionName]) => {
  describe('get' + extensionName, () => {
    it(`should be able to identify the actual ${extensionName}`, () => {
      expect(getter(allExtensions)).toBe(extension)
    })

    it(`should be able to identify a copy (non-identical reference!) of the ${extensionName}`, () => {
      const copiedExtension = { ...extension }
      const listWithModifiedExtension = allExtensions.map((currentExtension) =>
        currentExtension === extension ? copiedExtension : currentExtension,
      )
      expect(getter(listWithModifiedExtension)).toBe(copiedExtension)
    })
  })
})
