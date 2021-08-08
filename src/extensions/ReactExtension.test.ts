import { getReactExtension, ReactExtension } from './ReactExtension'
import { allExtensions } from './allExtensions'

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
