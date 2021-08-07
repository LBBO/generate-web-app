import { ReactExtension } from './ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'
import { ProjectMetaData } from '../core/userDialog/PerformUserDialog'
import { AngularExtension } from './AngularExtension'
import { generateMockExtension } from './MockExtension'
import { PackageManager } from '../core/userDialog/ChoosePackageManager'

describe('canBeSkipped', () => {
  const projectMetadata: ProjectMetaData = {
    name: '',
    chosenPackageManager: PackageManager.NPM,
  }

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
