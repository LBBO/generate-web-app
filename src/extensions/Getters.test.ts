import {
  getAngularExtension,
  getESLintExtension,
  getLessExtension,
  getReactExtension,
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
import { ReactExtension } from './ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'

const getters = [
  [getTypeScriptExtension, TypeScriptExtension, 'TypeScriptExtension'],
  [getReactExtension, ReactExtension, 'ReactExtension'],
  [getAngularExtension, AngularExtension, 'AngularExtension'],
  [getScssExtension, ScssExtension, 'ScssExtension'],
  [getSassExtension, SassExtension, 'SassExtension'],
  [getLessExtension, LessExtension, 'LessExtension'],
  [getESLintExtension, ESLintExtension, 'ESLintExtension'],
] as const

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
