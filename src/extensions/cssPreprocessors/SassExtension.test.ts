import { getSassExtension, SassExtension } from './SassExtension'
import { allExtensions } from '../allExtensions'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { generateMockExtension } from '../MockExtension'
import { AngularExtension } from '../AngularExtension'
import { ReactExtension } from '../ReactExtension'
import Mock = jest.Mock

describe('canBeSkipped', () => {
  it('should return true if Angular has been chosen', () => {
    expect(
      SassExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [AngularExtension],
        }),
      ),
    ).toBe(true)
  })

  it('should return false if Angular has not been chosen', () => {
    expect(
      SassExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [generateMockExtension()],
        }),
      ),
    ).toBe(false)
  })
})

describe('run', () => {
  it('should install the latest version as a dev dependency if React has not been chosen', async () => {
    const otherInformation = generateMockOtherExtensionInformation()
    const installDependenciesMock = otherInformation.projectMetadata
      .packageManagerStrategy.installDependencies as Mock

    await SassExtension.run(undefined, otherInformation)

    expect(installDependenciesMock).toHaveBeenCalledTimes(1)
    expect(installDependenciesMock).toHaveBeenCalledWith([
      {
        name: 'node-sass',
        isDevDependency: true,
        version: undefined,
      },
    ])
  })

  it('should not install the latest version if React has been chosen', async () => {
    const otherInformation = generateMockOtherExtensionInformation({
      chosenExtensions: [ReactExtension],
    })
    const installDependenciesMock = otherInformation.projectMetadata
      .packageManagerStrategy.installDependencies as Mock

    await SassExtension.run(undefined, otherInformation)

    expect(installDependenciesMock).toHaveBeenCalledTimes(1)
    expect(installDependenciesMock).toHaveBeenCalledWith([
      {
        name: 'node-sass',
        isDevDependency: true,
        version: '^5.0.0',
      },
    ])
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
