import type { AdditionalInformationForExtensions } from '../core/Extension'
import { generateMockOtherExtensionInformation } from './MockOtherExtensionInformation'
import { ReduxExtension } from './ReduxExtension'
import { ReactExtension } from './ReactExtension'

describe('run', () => {
  let otherInformation: AdditionalInformationForExtensions
  let installDependenciesMock: jest.SpyInstance

  beforeEach(() => {
    otherInformation = generateMockOtherExtensionInformation()
    // The return type doesn't show it, but this mock data generation
    // generates mocks for everything
    installDependenciesMock = otherInformation.projectMetadata
      .packageManagerStrategy.installDependencies as unknown as jest.SpyInstance
  })

  it('should always install redux and redux toolkit', async () => {
    await ReduxExtension.run(undefined, otherInformation)

    expect(installDependenciesMock).toHaveBeenCalledTimes(1)
    expect(installDependenciesMock.mock.calls[0][0].includes('redux')).toBe(
      true,
    )
    expect(
      installDependenciesMock.mock.calls[0][0].includes('@reduxjs/toolkit'),
    ).toBe(true)
  })

  it('should NOT install react-redux if react has NOT been chosen', async () => {
    await ReduxExtension.run(undefined, otherInformation)
    expect(
      installDependenciesMock.mock.calls[0][0].includes('react-redux'),
    ).toBe(false)
  })

  describe('when chosen alongside react', () => {
    beforeEach(() => {
      otherInformation = generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      })
      // The return type doesn't show it, but this mock data generation
      // generates mocks for everything
      installDependenciesMock = otherInformation.projectMetadata
        .packageManagerStrategy
        .installDependencies as unknown as jest.SpyInstance
    })

    it('should install react-redux', async () => {
      await ReduxExtension.run(undefined, otherInformation)
      expect(
        installDependenciesMock.mock.calls[0][0].includes('react-redux'),
      ).toBe(true)
    })

    it.todo('should copy all relevant template files if typescript was chosen')

    it.todo(
      'should compile all relevant TS files to JS before copying if TS was not chosen',
    )

    it.todo('should add the state provider to the index.j|tsx')

    it.todo('should add the component to the App.j|tsx')
  })
})
