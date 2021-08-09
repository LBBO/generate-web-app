import { ESLintExtension, getESLintExtension } from './ESLintExtension'
import { allExtensions } from './allExtensions'

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
