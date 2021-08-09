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

describe('getAngularExtension', () => {
  it('should be able to identify the actual AngularExtension', () => {
    expect(getAngularExtension(allExtensions)).toBe(AngularExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the AngularExtension', () => {
    const copiedAngularExtension = { ...AngularExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === AngularExtension ? copiedAngularExtension : extension,
    )
    expect(getAngularExtension(listWithModifiedExtension)).toBe(
      copiedAngularExtension,
    )
  })
})

describe('getLessExtension', () => {
  it('should be able to identify the actual LessExtension', () => {
    expect(getLessExtension(allExtensions)).toBe(LessExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the LessExtension', () => {
    const copiedLessExtension = { ...LessExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === LessExtension ? copiedLessExtension : extension,
    )
    expect(getLessExtension(listWithModifiedExtension)).toBe(
      copiedLessExtension,
    )
  })
})

describe('getSassExtension', () => {
  it('should be able to identify the actual SassExtension', () => {
    expect(getSassExtension(allExtensions)).toBe(SassExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the SassExtension', () => {
    const copiedSassExtension = { ...SassExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === SassExtension ? copiedSassExtension : extension,
    )
    expect(getSassExtension(listWithModifiedExtension)).toBe(
      copiedSassExtension,
    )
  })
})

describe('getScssExtension', () => {
  it('should be able to identify the actual ScssExtension', () => {
    expect(getScssExtension(allExtensions)).toBe(ScssExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the ScssExtension', () => {
    const copiedScssExtension = { ...ScssExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === ScssExtension ? copiedScssExtension : extension,
    )
    expect(getScssExtension(listWithModifiedExtension)).toBe(
      copiedScssExtension,
    )
  })
})

describe('getESLintExtension', () => {
  it('should be able to identify the actual ESLintExtension', () => {
    expect(getESLintExtension(allExtensions)).toBe(ESLintExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the ESLintExtension', () => {
    const copiedESLintExtension = { ...ESLintExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === ESLintExtension ? copiedESLintExtension : extension,
    )
    expect(getESLintExtension(listWithModifiedExtension)).toBe(
      copiedESLintExtension,
    )
  })
})

describe('getReactExtension', () => {
  it('should be able to identify the actual ReactExtension', () => {
    expect(getReactExtension(allExtensions)).toBe(ReactExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the ReactExtension', () => {
    const copiedReactExtension = { ...ReactExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === ReactExtension ? copiedReactExtension : extension,
    )
    expect(getReactExtension(listWithModifiedExtension)).toBe(
      copiedReactExtension,
    )
  })
})

describe('getTypeScriptExtension', () => {
  it('should be able to identify the actual TypeScriptExtension', () => {
    expect(getTypeScriptExtension(allExtensions)).toBe(TypeScriptExtension)
  })

  it('should be able to identify a copy (non-identical reference!) of the TypeScriptExtension', () => {
    const copiedTypeScriptExtension = { ...TypeScriptExtension }
    const listWithModifiedExtension = allExtensions.map((extension) =>
      extension === TypeScriptExtension ? copiedTypeScriptExtension : extension,
    )
    expect(getTypeScriptExtension(listWithModifiedExtension)).toBe(
      copiedTypeScriptExtension,
    )
  })
})
