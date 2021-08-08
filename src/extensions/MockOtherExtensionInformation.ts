import { Extension } from '../core/Extension'
import { ProjectMetaData } from '../core/userDialog/PerformUserDialog'
import { generateMockPackageManagerStrategy } from '../core/packageManagers/MockPackageManagerStrategy'
import { PackageManagerNames } from '../core/packageManagers/PackageManagerStrategy'
import { generateMockExtension } from './MockExtension'
import { OverrideProperties } from '../types/UtilityTypes'

export const generateMockProjectMetadata = (
  // Override should be ProjectMetaData, but the packageManagerStrategy value
  // will be passed to the mock generator. Also, all values should be optional.
  override?: Partial<
    OverrideProperties<
      ProjectMetaData,
      {
        packageManagerStrategy: Parameters<
          typeof generateMockPackageManagerStrategy
        >[0]
      }
    >
  >,
): ProjectMetaData => ({
  name: override?.name ?? 'mock-project-name',
  packageManagerStrategy: generateMockPackageManagerStrategy(
    override?.packageManagerStrategy,
  ),
  chosenPackageManager:
    override?.chosenPackageManager ?? PackageManagerNames.NPM,
})

type OtherExtensionInformation = Parameters<Extension['run']>[1]
export const generateMockOtherExtensionInformation = (
  override?: Partial<
    OverrideProperties<
      OtherExtensionInformation,
      {
        projectMetadata: Parameters<typeof generateMockProjectMetadata>[0]
      }
    >
  >,
): OtherExtensionInformation => ({
  chosenExtensions: override?.chosenExtensions ?? [
    generateMockExtension({ name: 'Mock extension 1' }),
    generateMockExtension({ name: 'Mock extension 2' }),
    generateMockExtension({ name: 'Mock extension 3' }),
  ],
  projectMetadata: generateMockProjectMetadata(override?.projectMetadata),
})
