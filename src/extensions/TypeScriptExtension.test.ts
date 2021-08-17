import { ReactExtension } from './ReactExtension/ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { AngularExtension } from './AngularExtension/AngularExtension'
import { generateMockExtension } from './MockExtension'
import { generateMockProjectMetadata } from './MockOtherExtensionInformation'

describe('canBeSkipped', () => {
  const projectMetadata = generateMockProjectMetadata()

  it('will return true if chosenExtension includes ReactExtension', () => {
    const chosenExtensions = [ReactExtension, TypeScriptExtension]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(true)
  })

  it('will return true if chosenExtension includes AngularExtension', () => {
    const chosenExtensions = [AngularExtension, TypeScriptExtension]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(true)
  })

  it('will return false otherwise', () => {
    const chosenExtensions = [TypeScriptExtension, generateMockExtension()]
    expect(
      TypeScriptExtension.canBeSkipped?.(undefined, {
        projectMetadata,
        chosenExtensions,
      }),
    ).toBe(false)
  })
})
