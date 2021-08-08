import { AngularExtension, getAngularExtension } from './AngularExtension'
import { allExtensions } from './allExtensions'

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
