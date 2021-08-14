import type { AdditionalInformationForExtensions } from '../core/Extension'
import { generateMockOtherExtensionInformation } from './MockOtherExtensionInformation'
import { ReduxExtension } from './ReduxExtension'
import { ReactExtension } from './ReactExtension'
import { TypeScriptExtension } from './TypeScriptExtension'
import fs, { readFile, writeFile } from 'fs/promises'
import path from 'path'

describe('run', () => {
  let otherInformation: AdditionalInformationForExtensions
  let installDependenciesMock: jest.SpyInstance
  let writeFileMock: jest.SpyInstance

  beforeEach(() => {
    otherInformation = generateMockOtherExtensionInformation()
    // The return type doesn't show it, but this mock data generation
    // generates mocks for everything
    installDependenciesMock = otherInformation.projectMetadata
      .packageManagerStrategy.installDependencies as unknown as jest.SpyInstance
    writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
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
        chosenExtensions: [ReactExtension, TypeScriptExtension],
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

    it('should copy all CSS files', async () => {
      await ReduxExtension.run(undefined, otherInformation)

      expect(writeFileMock).toHaveBeenCalledWith(
        path.join(
          otherInformation.projectMetadata.rootDirectory,
          'src/features/counter/Counter.css',
        ),
        expect.anything(),
      )
    })

    it('should copy all relevant template files if typescript was chosen', async () => {
      await ReduxExtension.run(undefined, otherInformation)

      const filePaths = [
        'src/app/hooks.ts',
        'src/app/store.ts',
        'src/features/counter/Counter.tsx',
        'src/features/counter/counterAPI.ts',
        'src/features/counter/counterSlice.ts',
        'src/features/counter/counterSlice.test.ts',
      ]
      const pathToTemplateFolder = path.join(
        __dirname,
        '../../fileTemplates/extensions/ReduxExtension',
      )

      for (const relativeFilePath of filePaths) {
        const fileContent = (
          await readFile(path.join(pathToTemplateFolder, relativeFilePath))
        ).toString()

        expect(writeFileMock).toHaveBeenCalledWith(
          path.join(
            otherInformation.projectMetadata.rootDirectory,
            relativeFilePath,
          ),
          fileContent,
        )
      }
    })

    it('should compile all relevant TS files to JS before copying if TS was not chosen', async () => {
      // Remove TypeScriptExtension from chosen extensions
      otherInformation.chosenExtensions.splice(
        otherInformation.chosenExtensions.indexOf(TypeScriptExtension),
        1,
      )
      await ReduxExtension.run(undefined, otherInformation)

      const filePaths = [
        'src/app/hooks.js',
        'src/app/store.js',
        'src/features/counter/Counter.jsx',
        'src/features/counter/counterAPI.js',
        'src/features/counter/counterSlice.js',
        'src/features/counter/counterSlice.test.js',
      ]

      for (let i = 0; i < filePaths.length; i++) {
        const relativeFilePath = filePaths[i]
        const targetFilePath = path.join(
          otherInformation.projectMetadata.rootDirectory,
          relativeFilePath,
        )

        expect(writeFileMock).toHaveBeenCalledWith(
          targetFilePath,
          expect.anything(),
        )
        const correspondingCall = writeFileMock.mock.calls.find(
          (call) => call[0] === targetFilePath,
        )
        expect(correspondingCall).toMatchSnapshot()
      }
    })

    it.todo('should add the state provider to the index.j|tsx')

    it.todo('should add the component to the App.j|tsx')
  })
})
