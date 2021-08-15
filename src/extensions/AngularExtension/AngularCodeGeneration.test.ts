import path from 'path'
import {
  addAngularComponentToAppComponent,
  addAngularImportToModule,
  addDeclarationToModule,
} from './AngularCodeGeneration'
import type { JsOrTsImportData } from '../../core/CodeGeneration'
import * as GeneralCodeGeneration from '../../core/CodeGeneration'
import fs from 'fs/promises'
import {
  appModuleWithMoreDeclarations,
  appModuleWithMoreImports,
  defaultAppComponentHtml,
  defaultAppModule,
} from './AngularCodeGenerationMockData'
import { generateMockOtherExtensionInformation } from '../MockOtherExtensionInformation'
import { TypeScriptExtension } from '../TypeScriptExtension'
import { AngularExtension } from './AngularExtension'

const defaultPathToAppModule = path.join(__dirname, 'app.module.ts')
const defaultComponentImportData: JsOrTsImportData = {
  sourcePath: './my-component/my-component.component',
  importItems: ['MyComponent'],
}
const defaultModuleImportData: JsOrTsImportData = {
  sourcePath: '@angular/forms',
  importItems: ['FormsModule'],
}

let addImportToJsOrTsFileMock: jest.SpyInstance
let readFileMock: jest.SpyInstance
let writeFileMock: jest.SpyInstance

beforeEach(() => {
  addImportToJsOrTsFileMock = jest
    .spyOn(GeneralCodeGeneration, 'addImportToJsOrTsFile')
    .mockResolvedValue(undefined)
  readFileMock = jest.spyOn(fs, 'readFile').mockResolvedValue(defaultAppModule)
  writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValue()
})

describe('addDeclarationToModule', () => {
  it('should create an item import for the declaration if desired', async () => {
    await addDeclarationToModule(
      defaultPathToAppModule,
      defaultComponentImportData,
    )

    expect(addImportToJsOrTsFileMock).toHaveBeenCalledTimes(1)
    expect(addImportToJsOrTsFileMock).toHaveBeenCalledWith(
      defaultPathToAppModule,
      defaultComponentImportData,
    )
  })

  it('should correctly add declarations to the AppModule', async () => {
    await addDeclarationToModule(
      defaultPathToAppModule,
      defaultComponentImportData,
    )

    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should sort declarations alphabetically', async () => {
    readFileMock.mockResolvedValue(appModuleWithMoreDeclarations)
    await addDeclarationToModule(
      defaultPathToAppModule,
      defaultComponentImportData,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })
})

describe('addAngularImportToModule', () => {
  it('should create an item import for the import if desired', async () => {
    await addAngularImportToModule(
      defaultPathToAppModule,
      defaultModuleImportData,
    )

    expect(addImportToJsOrTsFileMock).toHaveBeenCalledTimes(1)
    expect(addImportToJsOrTsFileMock.mock.calls[0][1]).toBe(
      defaultModuleImportData,
    )
  })

  it('should correctly add imports to the AppModule', async () => {
    await addAngularImportToModule(
      defaultPathToAppModule,
      defaultModuleImportData,
    )

    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })

  it('should sort imports alphabetically', async () => {
    readFileMock.mockResolvedValue(appModuleWithMoreImports)

    await addAngularImportToModule(
      defaultPathToAppModule,
      defaultModuleImportData,
    )

    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })
})

describe('addAngularComponent', () => {
  beforeEach(() => {
    readFileMock.mockResolvedValue(defaultAppComponentHtml)
  })

  it('should add the component in the correct position', async () => {
    await addAngularComponentToAppComponent(
      'my-component',
      generateMockOtherExtensionInformation({
        chosenExtensions: [TypeScriptExtension, AngularExtension],
      }),
    )

    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock.mock.calls[0][1]).toMatchSnapshot()
  })
})
