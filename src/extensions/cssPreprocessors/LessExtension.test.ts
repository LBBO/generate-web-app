import { getLessExtension, LessExtension } from './LessExtension'
import { allExtensions } from '../allExtensions'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { generateMockExtension } from '../MockExtension'
import { AngularExtension } from '../AngularExtension'

describe('canBeSkipped', () => {
  it('should return true if Angular has been chosen', () => {
    expect(
      LessExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [AngularExtension],
        }),
      ),
    ).toBe(true)
  })

  it('should return false if Angular has not been chosen', () => {
    expect(
      LessExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [generateMockExtension()],
        }),
      ),
    ).toBe(false)
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
