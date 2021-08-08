import { ReactExtension } from './ReactExtension'
import {
  getTypeScriptExtension,
  TypeScriptExtension,
} from './TypeScriptExtension'
import { ProjectMetaData } from '../core/userDialog/PerformUserDialog'
import { AngularExtension } from './AngularExtension'
import { generateMockExtension } from './MockExtension'
import { PackageManagerNames } from '../core/packageManagers/PackageManagerStrategy'
import { generateMockPackageManagerStrategy } from '../core/packageManagers/MockPackageManagerStrategy'
import { allExtensions } from './allExtensions'

describe('canBeSkipped', () => {
  const projectMetadata: ProjectMetaData = {
    name: '',
    chosenPackageManager: PackageManagerNames.NPM,
    packageManagerStrategy: generateMockPackageManagerStrategy(),
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
