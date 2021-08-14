import fs from 'fs/promises'
import {
  addComponent,
  surroundAppWithComponentWithoutImport,
} from './ReactCodeGeneration'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import type { AdditionalInformationForExtensions } from '../../core/Extension'
import path from 'path'
import { ReactExtension } from '../ReactExtension'
import { TypeScriptExtension } from '../TypeScriptExtension'
import * as GeneralCodeGeneration from '../../core/CodeGeneration'
import {
  appTsxWithAdditionalComponents,
  defaultAppTsx,
  defaultIndexTsx,
} from './MockValues'

let readFileMock: jest.SpyInstance<ReturnType<typeof fs['readFile']>>
let writeFileMock: jest.SpyInstance<Promise<void>>
let otherExtensionInformation: AdditionalInformationForExtensions

beforeEach(() => {
  readFileMock = jest.spyOn(fs, 'readFile').mockResolvedValue('')
  writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
  otherExtensionInformation = generateMockOtherExtensionInformation({
    chosenExtensions: [ReactExtension, TypeScriptExtension],
  })
})

describe('addComponent', () => {
  let addImportToJsOrTsFileMock: jest.SpyInstance

  beforeEach(() => {
    readFileMock.mockResolvedValue(defaultAppTsx)
    addImportToJsOrTsFileMock = jest
      .spyOn(GeneralCodeGeneration, 'addImportToJsOrTsFile')
      .mockResolvedValue(undefined)
  })

  it('should modify App.jsx if typescript is not installed', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      }),
    )

    const pathToIndexJsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.jsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexJsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexJsx)
  })

  it('should modify App.tsx if typescript is installed', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      otherExtensionInformation,
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.tsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexTsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexTsx)
  })

  it('should add an import for the component', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      otherExtensionInformation,
    )

    expect(addImportToJsOrTsFileMock).toHaveBeenCalledTimes(1)
    expect(addImportToJsOrTsFileMock.mock.calls[0][1]).toEqual({
      sourcePath: './SomeComponent',
      importItems: ['SomeComponent'],
    })
  })

  it('should add the component to the end of the App.tsx return statement', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      otherExtensionInformation,
    )

    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should add the component to the end of the App.tsx return statement', async () => {
    readFileMock.mockResolvedValue(appTsxWithAdditionalComponents)

    await addComponent(
      './NewComponent',
      'NewComponent',
      otherExtensionInformation,
    )

    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should support default import', async () => {
    await addComponent(
      './SomeComponent',
      'SomeComponent',
      otherExtensionInformation,
      'default',
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'App.tsx',
    )

    expect(addImportToJsOrTsFileMock).toHaveBeenCalledTimes(1)
    expect(addImportToJsOrTsFileMock).toHaveBeenCalledWith(pathToIndexTsx, {
      sourcePath: './SomeComponent',
      importDefault: 'SomeComponent',
    })
  })
})

describe('surroundAppWithComponentWithoutImport', () => {
  beforeEach(() => {
    readFileMock.mockResolvedValue(defaultIndexTsx)
  })

  it('should modify index.jsx if typescript is not installed', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      generateMockOtherExtensionInformation({
        chosenExtensions: [ReactExtension],
      }),
    )

    const pathToIndexJsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'index.jsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexJsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexJsx)
  })

  it('should modify index.tsx if typescript is installed', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      otherExtensionInformation,
    )

    const pathToIndexTsx = path.join(
      otherExtensionInformation.projectMetadata.rootDirectory,
      'src',
      'index.tsx',
    )

    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledWith(pathToIndexTsx)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][0]).toBe(pathToIndexTsx)
  })

  it('should surround the <App /> component with the given provider tag in the index.tsx', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Switch>',
      otherExtensionInformation,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should accept a component with extra props', async () => {
    await surroundAppWithComponentWithoutImport(
      '<Provider store={store}>',
      otherExtensionInformation,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })
})
