import { ScssExtension } from './ScssExtension'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { generateMockExtension } from '../MockExtension'
import { AngularExtension } from '../AngularExtension/AngularExtension'
import { ReactExtension } from '../ReactExtension/ReactExtension'
import fs from 'fs/promises'

describe('canBeSkipped', () => {
  it('should return true if Angular has been chosen', () => {
    expect(
      ScssExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [AngularExtension],
        }),
      ),
    ).toBe(true)
  })

  it('should return false if Angular has not been chosen', () => {
    expect(
      ScssExtension.canBeSkipped?.(
        undefined,
        generateMockOtherExtensionInformation({
          chosenExtensions: [generateMockExtension()],
        }),
      ),
    ).toBe(false)
  })
})

describe('run', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'rm').mockResolvedValue(undefined)
    jest.spyOn(fs, 'copyFile').mockResolvedValue(undefined)
  })

  it('should install the latest version as a dev dependency if React has not been chosen', async () => {
    const otherInformation = generateMockOtherExtensionInformation()
    const installDependenciesMock = otherInformation.projectMetadata
      .packageManagerStrategy.installDependencies as jest.Mock

    await ScssExtension.run(undefined, otherInformation)

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
      .packageManagerStrategy.installDependencies as jest.Mock

    await ScssExtension.run(undefined, otherInformation)

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
