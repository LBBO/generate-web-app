import { LessExtension } from './LessExtension'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { generateMockExtension } from '../MockExtension'
import { AngularExtension } from '../AngularExtension/AngularExtension'

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
