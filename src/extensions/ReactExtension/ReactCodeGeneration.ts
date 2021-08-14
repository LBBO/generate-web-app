import type { AdditionalInformationForExtensions } from '../../core/Extension'
import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import { getTypeScriptExtension } from '../Getters'
import { formatWithPrettier } from '../../core/FormatCode'
import { addImportToJsOrTsFile } from '../../core/CodeGeneration'

export const addComponent = async (
  srcFilePath: string,
  componentName: string,
  otherInformation: AdditionalInformationForExtensions,
  exportType: 'default' | 'item' = 'item',
): Promise<void> => {
  const pathToAppComponent = path.join(
    otherInformation.projectMetadata.rootDirectory,
    'src',
    `App.${
      getTypeScriptExtension(otherInformation.chosenExtensions) ? 't' : 'j'
    }sx`,
  )

  await addImportToJsOrTsFile(pathToAppComponent, {
    sourcePath: srcFilePath,
    importItems: exportType === 'item' ? [componentName] : undefined,
    importDefault: exportType === 'default' ? componentName : undefined,
  })

  await readFile(pathToAppComponent)
  await writeFile(pathToAppComponent, '')
}

export const surroundAppWithComponentWithoutImport = async (
  componentOpeningTag: string,
  otherInformation: AdditionalInformationForExtensions,
): Promise<void> => {
  const pathToIndexFile = path.join(
    otherInformation.projectMetadata.rootDirectory,
    'src',
    `index.${
      getTypeScriptExtension(otherInformation.chosenExtensions) ? 't' : 'j'
    }sx`,
  )
  const fileContent = (await readFile(pathToIndexFile)).toString()
  const componentName = componentOpeningTag.match(/<(.*?)\W/)?.[1]

  if (!componentName) {
    throw new Error('Malformed opening tag!')
  }

  const componentClosingTag = `</${componentName}>`
  const newFileContent = fileContent.replace(
    /<App ?\/>/g,
    `${componentOpeningTag}<App />${componentClosingTag}`,
  )
  await writeFile(
    pathToIndexFile,
    formatWithPrettier(newFileContent, pathToIndexFile),
  )
}
