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
      getTypeScriptExtension(otherInformation.chosenExtensions) ? 'tsx' : 'js'
    }`,
  )

  await addImportToJsOrTsFile(pathToAppComponent, {
    sourcePath: srcFilePath,
    importItems: exportType === 'item' ? [componentName] : undefined,
    importDefault: exportType === 'default' ? componentName : undefined,
  })

  const fileContent = (await readFile(pathToAppComponent)).toString()
  const pTagToInsertComponentBefore =
    /<p>\s*Edit <code>src\/App.(?:js|tsx)<\/code> and save to reload.\s*<\/p>/

  const newComponent = `<${componentName} />`

  const pTagMatch = fileContent.match(pTagToInsertComponentBefore)
  const pTagContent = pTagMatch?.[0]
  const pTagIndex = pTagMatch?.index

  if (!pTagMatch || !pTagContent || !pTagIndex) {
    throw new Error(
      `P tag couldn't be found, so the component could not be inserted!`,
    )
  } else {
    const newFileContent =
      fileContent.slice(0, pTagIndex) +
      newComponent +
      fileContent.slice(pTagIndex)

    await writeFile(
      pathToAppComponent,
      formatWithPrettier(newFileContent, pathToAppComponent),
    )
  }
}

export const surroundAppWithComponentWithoutImport = async (
  componentOpeningTag: string,
  otherInformation: AdditionalInformationForExtensions,
): Promise<void> => {
  const pathToIndexFile = path.join(
    otherInformation.projectMetadata.rootDirectory,
    'src',
    `index.${
      getTypeScriptExtension(otherInformation.chosenExtensions) ? 'tsx' : 'js'
    }`,
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
